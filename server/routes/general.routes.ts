import { Router, Response } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { SettingModel } from '../models/Setting';
import { AuditLogModel } from '../models/AuditLog';
import { db, forceSeedDatabase } from '../db/database';

const router = Router();

/**
 * POST /api/settings/reset
 * Unconditionally clear and seed MongoDB database with factory default data
 */
router.post('/settings/reset', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    await forceSeedDatabase();
    await db.logAction(
      'DATABASE_RESET', 
      'System', 
      'Initiated system-wide database reset & factory seed', 
      req.user?.name || 'Admin'
    );
    res.json({ success: true, message: 'Database reset and factory seeded successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reset and seed database', details: err.message });
  }
});

/**
 * GET /api/settings
 * Retrieve system settings from MongoDB
 */
router.get('/settings', async (req, res: Response) => {
  try {
    let settings = await SettingModel.findOne();
    if (!settings) {
      settings = new SettingModel({
        schoolName: 'School Bus Transportation',
        academicYear: '2026 - 2027',
        logoUrl: '',
        currency: '$',
        supportPhone: '9876543210',
        supportEmail: 'support@school.edu',
        term1DueDate: '2026-10-31',
        term2DueDate: '2027-03-31',
        paymentGatewaysEnabled: true
      });
      await settings.save();
    }
    res.json({ settings });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve portal configurations', details: err.message });
  }
});

/**
 * PUT /api/settings
 * Update system settings in MongoDB
 */
router.put('/settings', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const updates = req.body;
    let settings = await SettingModel.findOne();
    if (!settings) {
      settings = new SettingModel(updates);
    } else {
      Object.assign(settings, updates);
    }
    await settings.save();

    await db.logAction(
      'SETTINGS_UPDATED', 
      'System', 
      'Updated transport portal configurations in MongoDB', 
      req.user?.name || 'Admin'
    );

    res.json({ settings });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update school configurations', details: err.message });
  }
});

/**
 * GET /api/logs
 * Retrieve system audit logs from MongoDB
 */
router.get('/logs', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const logs = await AuditLogModel.find().sort({ timestamp: -1 }).limit(500);
    res.json({ logs });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load system log history', details: err.message });
  }
});

export default router;
