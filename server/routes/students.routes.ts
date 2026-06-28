import { Router, Response } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { db } from '../db/database';

const router = Router();

/**
 * GET /api/students
 * Retrieve all registered and pending students
 */
router.get('/', (req, res: Response) => {
  const state = db.get();
  res.json({ students: state.students });
});

/**
 * POST /api/students
 * Register a new student
 */
router.post('/', verifyToken, (req: AuthRequest, res: Response) => {
  const state = db.get();
  const studentData = req.body;
  
  const newStudent = {
    ...studentData,
    id: 'st_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    status: studentData.status || 'Active',
    feeStatus: studentData.feeStatus || 'Pending'
  };

  state.students.push(newStudent);
  db.logAction('STUDENT_CREATED', 'Students', `Registered new student: ${newStudent.name} (${newStudent.studentId})`, req.user?.name || 'Admin');
  db.commit();

  res.status(201).json({ student: newStudent });
});

/**
 * PUT /api/students/:id
 * Update existing student record
 */
router.put('/:id', verifyToken, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const state = db.get();

  const index = state.students.findIndex(s => s.id === id || s.studentId === id);
  if (index === -1) {
    res.status(404).json({ error: 'Student record not found' });
    return;
  }

  state.students[index] = { ...state.students[index], ...updates };
  db.logAction('STUDENT_UPDATED', 'Students', `Updated student profile: ${state.students[index].name}`, req.user?.name || 'Admin');
  db.commit();

  res.json({ student: state.students[index] });
});

/**
 * DELETE /api/students/:id
 * Remove student record
 */
router.delete('/:id', verifyToken, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const state = db.get();

  const initialLen = state.students.length;
  const deleted = state.students.find(s => s.id === id || s.studentId === id);
  state.students = state.students.filter(s => s.id !== id && s.studentId !== id);

  if (state.students.length === initialLen) {
    res.status(404).json({ error: 'Student record not found' });
    return;
  }

  db.logAction('STUDENT_DELETED', 'Students', `Deleted student: ${deleted?.name || id}`, req.user?.name || 'Admin');
  db.commit();

  res.json({ success: true });
});

/**
 * POST /api/students/bulk-import
 * Bulk register students from CSV / Excel parser
 */
router.post('/bulk-import', verifyToken, (req: AuthRequest, res: Response) => {
  const { students } = req.body;
  if (!Array.isArray(students)) {
    res.status(400).json({ error: 'Invalid payload: expected array of students' });
    return;
  }

  const state = db.get();
  const imported: any[] = [];

  students.forEach((item: any, idx: number) => {
    const newSt = {
      ...item,
      id: 'bulk_' + Date.now() + '_' + idx,
      status: item.status || 'Active',
      feeStatus: item.feeStatus || 'Pending'
    };
    state.students.push(newSt);
    imported.push(newSt);
  });

  db.logAction('BULK_IMPORT', 'Students', `Successfully imported ${imported.length} student records into database`, req.user?.name || 'Admin');
  db.commit();

  res.status(201).json({ count: imported.length, imported });
});

export default router;
