import mongoose, { Schema } from 'mongoose';

const PaymentSchema = new Schema({
  id: { type: String, required: true, unique: true },
  receiptNumber: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  classSection: { type: String, required: true },
  amount: { type: Number, required: true },
  term: { type: String, required: true }, // term1, term2, both
  paymentDate: { type: String, required: true },
  method: { type: String, required: true }, // Online Card, UPI, Net Banking, Cash, Cheque
  status: { type: String, default: 'completed' }, // completed, failed, refunded, pending
  remarks: { type: String, default: '' },
  academicYear: { type: String, default: '2026 - 2027' },
  razorpayOrderId: { type: String, default: '' },
  razorpayPaymentId: { type: String, default: '' },
  razorpaySignature: { type: String, default: '' }
});

export const PaymentModel: any = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);

