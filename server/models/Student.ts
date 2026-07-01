import mongoose, { Schema } from 'mongoose';

const StudentSchema = new Schema({
  id: { type: String, required: true, unique: true },
  studentId: { type: String, required: true, unique: true },
  admissionNumber: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, default: 'password123' },
  class: { type: String, required: true },
  section: { type: String, required: true },
  routeId: { type: String, default: '' },
  busId: { type: String, default: '' },
  stopId: { type: String, default: '' },
  parentName: { type: String, required: true },
  parentPhone: { type: String, required: true },
  address: { type: String, default: 'Not Provided' },
  term1Fee: { type: Number, default: 0 },
  term2Fee: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 },
  pendingAmount: { type: Number, default: 0 },
  status: { type: String, default: 'pending' }, // paid, pending, partial
  avatar: { type: String, default: '' },
  academicYear: { type: String, default: '2026 - 2027' }
});

export const StudentModel: any = mongoose.models.Student || mongoose.model('Student', StudentSchema);

