import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { StudentModel } from '../models/Student';
import { BusModel } from '../models/Bus';
import { RouteModel } from '../models/Route';
import { StopModel } from '../models/Stop';
import { PaymentModel } from '../models/Payment';
import { SettingModel } from '../models/Setting';
import { AuditLogModel } from '../models/AuditLog';

import {
  initialStudents,
  initialBuses,
  initialRoutes,
  initialStops,
  initialPayments,
  initialSettings,
  initialAuditLogs
} from '../../src/data/seedData';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

export const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

/**
 * Initialize MongoDB connection with optimal settings (Connection Pooling)
 */
export const initDatabase = async () => {
  if (!MONGODB_URI) {
    throw new Error('❌ MONGODB_URI environment variable is missing. It is required for the application to function.');
  }

  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 2,  // Keep at least 2 connections alive
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    console.log('✅ Successfully connected to MongoDB.');

    // Seed database if collections are empty
    await seedDatabaseIfNeeded();
  } catch (error: any) {
    console.error('❌ MongoDB connection could not be established:', error.message || error);
    throw error;
  }
};

/**
 * Seed MongoDB collections using initial seedData if they are currently empty
 */
async function seedDatabaseIfNeeded() {
  try {
    const oldStudent = await StudentModel.findOne({ studentId: { $regex: /^STU/ } });
    const studentCount = await StudentModel.countDocuments();
    
    if (studentCount === 0 || oldStudent) {
      console.log('🧹 Database is empty or contains legacy STU student IDs. Re-seeding with correct ST-class-number format...');
      await forceSeedDatabase();
    }
  } catch (err) {
    console.error('❌ Database seeding check failed:', err);
  }
}

/**
 * Clear and populate MongoDB collections with the pristine seed dataset
 */
export async function forceSeedDatabase() {
  await StudentModel.deleteMany({});
  await PaymentModel.deleteMany({});
  await RouteModel.deleteMany({});
  await BusModel.deleteMany({});
  await StopModel.deleteMany({});
  await SettingModel.deleteMany({});
  await AuditLogModel.deleteMany({});

  // 1. Seed Settings
  await SettingModel.create(initialSettings);

  // 2. Seed Buses
  await BusModel.create(initialBuses);

  // 3. Seed Routes
  await RouteModel.create(initialRoutes);

  // 4. Seed Stops
  await StopModel.create(initialStops);

  // 5. Seed Payments
  const mappedPayments = initialPayments.map(p => ({
    ...p,
    status: p.status || 'completed'
  }));
  await PaymentModel.create(mappedPayments);

  // 6. Seed Students (pre-save password hooks or defaults)
  const mappedStudents = initialStudents.map(s => {
    let phone = s.parentPhone || '';
    if (phone.startsWith('+1 (555)')) {
      phone = phone.replace('+1 (555) ', '+91 9');
    }
    return {
      ...s,
      parentPhone: phone,
      email: s.email || `${s.name.toLowerCase().replace(/\s+/g, '.')}@school.edu`,
      password: s.password || 'password123'
    };
  });
  await StudentModel.create(mappedStudents);

  // 7. Seed Audit Logs
  await AuditLogModel.create(initialAuditLogs.map(log => ({
    ...log,
    role: log.role || 'admin'
  })));

  console.log('✅ MongoDB database force-seeded successfully!');
}

/**
 * Legacy db object mapping helper for audit logging & compatibility
 */
export const db = {
  get: () => {
    // Legacy mapping fallback
    return {};
  },
  
  commit: () => {
    // Mongoose saves auto-commit
  },

  logAction: async (action: string, module: string, details: string, performedBy: string = 'System', role: 'admin' | 'student' = 'admin') => {
    try {
      await AuditLogModel.create({
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        timestamp: new Date().toISOString(),
        actor: performedBy,
        role,
        action,
        module,
        details
      });
    } catch (err) {
      console.error('Failed to write audit log to MongoDB:', err);
    }
  }
};
