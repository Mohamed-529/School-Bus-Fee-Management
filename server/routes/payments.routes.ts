import { Router, Response } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { db } from '../db/database';

const router = Router();

/**
 * GET /api/payments
 * Retrieve all payment records and fee receipts
 */
router.get('/', (req, res: Response) => {
  const state = db.get();
  res.json({ payments: state.payments });
});

/**
 * POST /api/payments
 * Record a new student fee payment transaction
 */
router.post('/', (req, res: Response) => {
  const state = db.get();
  const { studentId, amount, term, method } = req.body;

  if (!studentId || !amount) {
    res.status(400).json({ error: 'studentId and amount are required' });
    return;
  }

  const student = state.students.find(s => s.studentId === studentId || s.id === studentId);
  if (!student) {
    res.status(404).json({ error: 'Student profile not found' });
    return;
  }

  const receiptNo = 'RCP_' + Date.now().toString().slice(-6) + '_' + Math.random().toString(36).substr(2, 3).toUpperCase();
  
  const newReceipt = {
    id: 'pay_' + Date.now(),
    studentId: student.studentId || student.id,
    studentName: student.name,
    amount: Number(amount),
    term: term || 'both',
    method: method || 'Online Card',
    date: new Date().toISOString().split('T')[0],
    status: 'Completed',
    receiptNo
  };

  state.payments.unshift(newReceipt);

  // Update student fee status
  if (student) {
    const totalPaid = state.payments
      .filter(p => p.studentId === student.studentId && p.status === 'Completed')
      .reduce((acc, curr) => acc + curr.amount, 0);

    if (totalPaid >= (student.totalFees || 1200)) {
      student.feeStatus = 'Paid';
    } else if (totalPaid > 0) {
      student.feeStatus = 'Partial';
    }
  }

  db.logAction('PAYMENT_RECORDED', 'Finance', `Recorded fee payment of $${amount} for ${student.name} (${receiptNo})`, req.user?.name || 'Student/System');
  db.commit();

  res.status(201).json({ receipt: newReceipt });
});

/**
 * POST /api/payments/mark-paid
 * Admin quick action to mark fee status as paid
 */
router.post('/mark-paid', verifyToken, (req: AuthRequest, res: Response) => {
  const { studentId } = req.body;
  const state = db.get();

  const student = state.students.find(s => s.studentId === studentId || s.id === studentId);
  if (!student) {
    res.status(404).json({ error: 'Student not found' });
    return;
  }

  student.feeStatus = 'Paid';
  db.logAction('ADMIN_FEE_OVERRIDE', 'Finance', `Admin marked fees as fully Paid for ${student.name}`, req.user?.name || 'Admin');
  db.commit();

  res.json({ success: true, student });
});

export default router;
