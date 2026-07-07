import { Router, Response } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { StudentModel } from '../models/Student';
import { PaymentModel } from '../models/Payment';
import { db } from '../db/database';

const router = Router();

/**
 * GET /api/students
 * Retrieve all registered and pending students from MongoDB with auto-recalculated dues
 */
router.get('/', async (req, res: Response) => {
  try {
    const students = await StudentModel.find().sort({ name: 1 });
    const allPayments = await PaymentModel.find({ status: 'completed' });
    
    // Create a fast-lookup map for completed payments by studentId
    const paymentsMap = new Map<string, any[]>();
    allPayments.forEach(p => {
      const list = paymentsMap.get(p.studentId) || [];
      list.push(p);
      paymentsMap.set(p.studentId, list);
    });

    const updatedStudents = [];
    for (const student of students) {
      const studentPayments = paymentsMap.get(student.studentId) || [];
      const totalPaid = studentPayments.reduce((sum, record) => sum + record.amount, 0);
      const totalFees = (student.term1Fee || 0) + (student.term2Fee || 0);
      
      const correctPending = Math.max(0, totalFees - totalPaid);
      let correctStatus = student.status;
      if (totalPaid >= totalFees && totalFees > 0) {
        correctStatus = 'paid';
      } else if (totalPaid > 0) {
        correctStatus = 'partial';
      } else {
        correctStatus = 'pending';
      }

      let needsSave = false;
      if (student.paidAmount !== totalPaid) {
        student.paidAmount = totalPaid;
        needsSave = true;
      }
      if (student.pendingAmount !== correctPending) {
        student.pendingAmount = correctPending;
        needsSave = true;
      }
      if (student.status !== correctStatus) {
        student.status = correctStatus;
        needsSave = true;
      }

      if (needsSave) {
        await student.save();
      }
      updatedStudents.push(student);
    }

    res.json({ students: updatedStudents });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch students from database', details: err.message });
  }
});

/**
 * POST /api/students
 * Register a new student in MongoDB
 */
router.post('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const studentData = req.body;
    
    // Validate Phone Number: Must be exactly 10 numeric digits
    const digits = (studentData.parentPhone || '').replace(/\D/g, '');
    const coreDigits = digits.length >= 10 ? digits.slice(-10) : digits;
    if (coreDigits.length !== 10) {
      res.status(400).json({ error: 'Parent Phone Number must be exactly 10 digits.' });
      return;
    }

    const email = studentData.email || `${studentData.name.toLowerCase().replace(/\s+/g, '.')}@school.edu`;

    // Check duplicate studentId
    const existingStudentId = await StudentModel.findOne({ studentId: studentData.studentId });
    if (existingStudentId) {
      res.status(400).json({ error: `Student ID ${studentData.studentId} already exists.` });
      return;
    }

    // Check duplicate email
    const existingEmail = await StudentModel.findOne({ email });
    if (existingEmail) {
      res.status(400).json({ error: `Email ${email} is already registered.` });
      return;
    }

    const term1 = Number(studentData.term1Fee || 0);
    const term2 = Number(studentData.term2Fee || 0);
    const paid = Number(studentData.paidAmount || 0);
    const pending = Math.max(0, term1 + term2 - paid);

    const newStudent = new StudentModel({
      ...studentData,
      id: studentData.id || 'st_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      email,
      parentPhone: `+91 ${coreDigits}`,
      address: studentData.address || 'Not Provided',
      password: studentData.password || 'password123',
      term1Fee: term1,
      term2Fee: term2,
      paidAmount: paid,
      pendingAmount: pending,
      status: paid >= (term1 + term2) && (term1 + term2) > 0 ? 'paid' : (paid > 0 ? 'partial' : 'pending'),
      feeStatus: paid >= (term1 + term2) && (term1 + term2) > 0 ? 'Paid' : (paid > 0 ? 'Partial' : 'Pending')
    });

    await newStudent.save();

    await db.logAction(
      'STUDENT_CREATED', 
      'Students', 
      `Registered new student: ${newStudent.name} (${newStudent.studentId})`, 
      req.user?.name || 'Admin'
    );

    res.status(201).json({ student: newStudent });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to register student', details: err.message });
  }
});

/**
 * PUT /api/students/:id
 * Update existing student record in MongoDB
 */
router.put('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.parentPhone) {
      const digits = updates.parentPhone.replace(/\D/g, '');
      const coreDigits = digits.length >= 10 ? digits.slice(-10) : digits;
      if (coreDigits.length !== 10) {
        res.status(400).json({ error: 'Parent Phone Number must be exactly 10 digits.' });
        return;
      }
      updates.parentPhone = `+91 ${coreDigits}`;
    }

    // Query by standard MongoDB id, our custom string id or studentId
    const student = await StudentModel.findOne({ $or: [{ id }, { studentId: id }] });
    if (!student) {
      res.status(404).json({ error: 'Student record not found' });
      return;
    }

    // Apply updates
    Object.assign(student, updates);
    
    // Recalculate pending amount and status based on terms
    const totalFee = (student.term1Fee || 0) + (student.term2Fee || 0);
    student.pendingAmount = Math.max(0, totalFee - (student.paidAmount || 0));
    if (student.paidAmount >= totalFee && totalFee > 0) {
      student.status = 'paid';
    } else if (student.paidAmount > 0) {
      student.status = 'partial';
    } else {
      student.status = 'pending';
    }

    await student.save();

    await db.logAction(
      'STUDENT_UPDATED', 
      'Students', 
      `Updated student profile: ${student.name}`, 
      req.user?.name || 'Admin'
    );

    res.json({ student });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update student profile', details: err.message });
  }
});

/**
 * DELETE /api/students/:id
 * Remove student record from MongoDB
 */
router.delete('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const student = await StudentModel.findOneAndDelete({ $or: [{ id }, { studentId: id }] });

    if (!student) {
      res.status(404).json({ error: 'Student record not found' });
      return;
    }

    await db.logAction(
      'STUDENT_DELETED', 
      'Students', 
      `Deleted student: ${student.name} (${student.studentId})`, 
      req.user?.name || 'Admin'
    );

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete student record', details: err.message });
  }
});

/**
 * POST /api/students/bulk-import
 * Bulk register students from CSV / Excel parser to MongoDB
 */
router.post('/bulk-import', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { students } = req.body;
    if (!Array.isArray(students)) {
      res.status(400).json({ error: 'Invalid payload: expected array of students' });
      return;
    }

    const imported: any[] = [];
    for (let idx = 0; idx < students.length; idx++) {
      const item = students[idx];
      const digits = (item.parentPhone || '').replace(/\D/g, '');
      const coreDigits = digits.length >= 10 ? digits.slice(-10) : '9876543210'; // Safe fallback
      const cleanPhone = `+91 ${coreDigits}`;
      
      const email = item.email || `${item.name.toLowerCase().replace(/\s+/g, '.')}@school.edu`;

      // Skip duplicate studentId or email in DB
      const exists = await StudentModel.findOne({ $or: [{ studentId: item.studentId }, { email }] });
      if (exists) continue;

      const term1 = Number(item.term1Fee || 0);
      const term2 = Number(item.term2Fee || 0);
      const paid = Number(item.paidAmount || 0);
      const pending = Math.max(0, term1 + term2 - paid);

      const statusVal = paid >= (term1 + term2) && (term1 + term2) > 0 ? 'paid' : (paid > 0 ? 'partial' : 'pending');
      const feeStatusVal = paid >= (term1 + term2) && (term1 + term2) > 0 ? 'Paid' : (paid > 0 ? 'Partial' : 'Pending');

      const newSt = new StudentModel({
        ...item,
        id: item.id || 'bulk_' + Date.now() + '_' + idx,
        email,
        parentPhone: cleanPhone,
        term1Fee: term1,
        term2Fee: term2,
        paidAmount: paid,
        pendingAmount: pending,
        status: statusVal,
        feeStatus: feeStatusVal
      });

      await newSt.save();
      imported.push(newSt);
    }

    await db.logAction(
      'BULK_IMPORT', 
      'Students', 
      `Successfully imported ${imported.length} student records into MongoDB`, 
      req.user?.name || 'Admin'
    );

    res.status(201).json({ count: imported.length, imported });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to perform bulk student import', details: err.message });
  }
});

export default router;
