import mongoose, { Schema } from 'mongoose';

const AuditLogSchema = new Schema({
  id: { type: String, required: true, unique: true },
  timestamp: { type: String, required: true },
  actor: { type: String, required: true },
  role: { type: String, required: true }, // admin, student
  action: { type: String, required: true },
  module: { type: String, required: true },
  details: { type: String, required: true }
});

export const AuditLogModel: any = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);

