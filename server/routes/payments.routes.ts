import { Router, Response } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { PaymentModel } from '../models/Payment';
import { StudentModel } from '../models/Student';
import { db } from '../db/database';

const router = Router();

/**
 * GET /api/payments
 * Retrieve all payment records from MongoDB
 */
router.get('/', async (req, res: Response) => {
  try {
    const payments = await PaymentModel.find().sort({ paymentDate: -1 });
    res.json({ payments });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve payment directory', details: err.message });
  }
});

/**
 * POST /api/payments
 * Record a new student fee payment transaction in MongoDB
 */
router.post('/', async (req: any, res: Response) => {
  try {
    const { studentId, amount, term, method, remarks, academicYear } = req.body;

    if (!studentId || amount === undefined) {
      res.status(400).json({ error: 'studentId and amount are required' });
      return;
    }

    // Retrieve student by standard Mongo _id, custom string id, or studentId
    const student = await StudentModel.findOne({ $or: [{ id: studentId }, { studentId }] });
    if (!student) {
      res.status(404).json({ error: 'Student profile not found' });
      return;
    }

    const receiptNumber = 'RCP_' + Date.now().toString().slice(-6) + '_' + Math.random().toString(36).substr(2, 3).toUpperCase();
    
    const newReceipt = new PaymentModel({
      id: 'pay_' + Date.now(),
      receiptNumber,
      studentId: student.studentId,
      studentName: student.name,
      classSection: `${student.class} - ${student.section}`,
      amount: Number(amount),
      term: term || 'both',
      paymentDate: new Date().toISOString(),
      method: method || 'Online Card',
      status: 'completed',
      remarks: remarks || `Paid via ${method} (${(term || 'both').toUpperCase()})`,
      academicYear: academicYear || student.academicYear || '2026 - 2027'
    });

    await newReceipt.save();

    // Dynamically recalculate paidAmount & pendingAmount in MongoDB
    const studentPayments = await PaymentModel.find({ studentId: student.studentId, status: 'completed' });
    const totalPaid = studentPayments.reduce((sum, record) => sum + record.amount, 0);
    const totalFees = (student.term1Fee || 0) + (student.term2Fee || 0);

    student.paidAmount = totalPaid;
    student.pendingAmount = Math.max(0, totalFees - totalPaid);

    if (student.paidAmount >= totalFees && totalFees > 0) {
      student.status = 'paid';
    } else if (student.paidAmount > 0) {
      student.status = 'partial';
    } else {
      student.status = 'pending';
    }

    await student.save();

    await db.logAction(
      'PAYMENT_RECORDED', 
      'Finance', 
      `Recorded fee payment of ${amount} for ${student.name} (Receipt: ${receiptNumber})`, 
      req.user?.name || 'Student/System'
    );

    res.status(201).json({ receipt: newReceipt });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to record payment transaction', details: err.message });
  }
});

/**
 * POST /api/payments/mark-paid
 * Admin quick action to override student fee status to Paid
 */
router.post('/mark-paid', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, term, method, remarks } = req.body;
    const selectedTerm = term || 'both';
    const payMethod = method || 'Cash';

    const student = await StudentModel.findOne({ $or: [{ id: studentId }, { studentId }] });
    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    // Retrieve all completed payments for this student to see what has been paid
    const studentPayments = await PaymentModel.find({ studentId: student.studentId, status: 'completed' });
    
    const isT1Paid = studentPayments.some(p => p.term === 'term1' || p.term === 'both');
    const isT2Paid = studentPayments.some(p => p.term === 'term2' || p.term === 'both');

    let amountToPay = 0;
    let actualTerm: 'term1' | 'term2' | 'both' = 'both';

    if (selectedTerm === 'term1') {
      if (isT1Paid) {
        res.status(400).json({ error: 'Term 1 fees have already been fully paid.' });
        return;
      }
      amountToPay = student.term1Fee || 0;
      actualTerm = 'term1';
    } else if (selectedTerm === 'term2') {
      if (isT2Paid) {
        res.status(400).json({ error: 'Term 2 fees have already been fully paid.' });
        return;
      }
      amountToPay = student.term2Fee || 0;
      actualTerm = 'term2';
    } else {
      // both
      if (isT1Paid && isT2Paid) {
        res.status(400).json({ error: 'All term fees have already been fully paid.' });
        return;
      }
      if (!isT1Paid) amountToPay += student.term1Fee || 0;
      if (!isT2Paid) amountToPay += student.term2Fee || 0;
      actualTerm = (isT1Paid ? 'term2' : (isT2Paid ? 'term1' : 'both'));
    }

    if (amountToPay > 0) {
      const receiptNumber = 'RCP_ADJ_' + Date.now().toString().slice(-6) + '_' + Math.random().toString(36).substr(2, 3).toUpperCase();
      const adjustment = new PaymentModel({
        id: 'pay_adj_' + Date.now(),
        receiptNumber,
        studentId: student.studentId,
        studentName: student.name,
        classSection: `${student.class} - ${student.section}`,
        amount: amountToPay,
        term: actualTerm,
        paymentDate: new Date().toISOString(),
        method: payMethod,
        status: 'completed',
        remarks: remarks || `Administrative override for ${actualTerm.toUpperCase()}`,
        academicYear: student.academicYear || '2026 - 2027'
      });
      await adjustment.save();

      // Recalculate student paid & pending
      const updatedPayments = await PaymentModel.find({ studentId: student.studentId, status: 'completed' });
      const totalPaid = updatedPayments.reduce((sum, record) => sum + record.amount, 0);
      const totalFees = (student.term1Fee || 0) + (student.term2Fee || 0);

      student.paidAmount = totalPaid;
      student.pendingAmount = Math.max(0, totalFees - totalPaid);

      if (student.paidAmount >= totalFees && totalFees > 0) {
        student.status = 'paid';
      } else if (student.paidAmount > 0) {
        student.status = 'partial';
      } else {
        student.status = 'pending';
      }

      await student.save();
    } else {
      // Just ensure status is correct if amount is 0 but it's marked
      const totalFees = (student.term1Fee || 0) + (student.term2Fee || 0);
      if (student.paidAmount >= totalFees && totalFees > 0) {
        student.status = 'paid';
      }
      await student.save();
    }

    await db.logAction(
      'ADMIN_FEE_OVERRIDE', 
      'Finance', 
      `Admin marked ${selectedTerm.toUpperCase()} as Paid for ${student.name}`, 
      req.user?.name || 'Admin'
    );

    res.json({ success: true, student });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to mark student fee status', details: err.message });
  }
});

export default router;
