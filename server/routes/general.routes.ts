import { Router, Response } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { db } from '../db/database';

const router = Router();

/**
 * GET /api/settings
 * Retrieve system settings & GPS tracking intervals
 */
router.get('/settings', (req, res: Response) => {
  const state = db.get();
  res.json({ settings: state.settings });
});

/**
 * PUT /api/settings
 * Update system settings
 */
router.put('/settings', verifyToken, (req: AuthRequest, res: Response) => {
  const state = db.get();
  state.settings = { ...state.settings, ...req.body };
  db.logAction('SETTINGS_UPDATED', 'System', 'Updated transport portal configurations', req.user?.name || 'Admin');
  db.commit();
  res.json({ settings: state.settings });
});

/**
 * GET /api/logs
 * Retrieve system audit logs
 */
router.get('/logs', verifyToken, (req: AuthRequest, res: Response) => {
  const state = db.get();
  res.json({ logs: state.auditLogs });
});

export default router;
