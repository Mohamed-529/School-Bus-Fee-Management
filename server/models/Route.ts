import mongoose, { Schema } from 'mongoose';

const RouteSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  assignedBusId: { type: String, default: '' },
  assignedDriverName: { type: String, default: '' },
  assignedDriverPhone: { type: String, default: '' }
});

export const RouteModel: any = mongoose.models.Route || mongoose.model('Route', RouteSchema);

