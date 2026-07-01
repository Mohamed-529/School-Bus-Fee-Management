import mongoose, { Schema } from 'mongoose';

const SettingSchema = new Schema({
  schoolName: { type: String, default: 'School Bus Transportation' },
  academicYear: { type: String, default: '2026 - 2027' },
  logoUrl: { type: String, default: '' },
  currency: { type: String, default: '$' },
  supportPhone: { type: String, default: '' },
  supportEmail: { type: String, default: '' },
  term1DueDate: { type: String, default: '' },
  term2DueDate: { type: String, default: '' },
  paymentGatewaysEnabled: { type: Boolean, default: true }
});

export const SettingModel: any = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);

