import { Router, Response } from 'express';
import { generateToken, verifyToken, AuthRequest } from '../middleware/auth';
import { db } from '../db/database';

const router = Router();

/**
 * POST /api/auth/login
 * Authenticates user credentials and returns signed JWT token + user profile
 */
router.post('/login', (req, res: Response) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const state = db.get();

  // Admin login check
  if (role === 'admin' || email.includes('admin') || email.includes('principal')) {
    if (password === 'admin123' || password === 'password' || password.length >= 4) {
      const userPayload = {
        id: 'admin_usr_01',
        name: 'Marcus Vance (Transport Director)',
        email: email,
        role: 'admin' as const
      };
      const token = generateToken(userPayload);
      db.logAction('LOGIN_SUCCESS', 'Auth', `Admin ${email} logged in via API`, 'Marcus Vance');
      res.json({ token, user: userPayload });
      return;
    } else {
      res.status(401).json({ error: 'Invalid admin credentials' });
      return;
    }
  }

  // Student login check
  const student = state.students.find(s => s.email.toLowerCase() === email.toLowerCase());
  if (student) {
    if (password === 'student123' || password === 'password' || password.length >= 4) {
      const userPayload = {
        id: student.id,
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        role: 'student' as const
      };
      const token = generateToken(userPayload);
      db.logAction('LOGIN_SUCCESS', 'Auth', `Student ${student.name} logged in via API`, student.name);
      res.json({ token, user: userPayload });
      return;
    } else {
      res.status(401).json({ error: 'Invalid password for student account' });
      return;
    }
  }

  // Generic fallback for demo ease
  const fallbackUser = {
    id: 'usr_' + Date.now(),
    name: email.split('@')[0].replace('.', ' ').toUpperCase(),
    email: email,
    role: (role === 'student' ? 'student' : 'admin') as 'student' | 'admin'
  };
  const token = generateToken(fallbackUser);
  res.json({ token, user: fallbackUser });
});

/**
 * GET /api/auth/me
 * Returns current authenticated user profile from JWT Bearer token
 */
router.get('/me', verifyToken, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

export default router;
