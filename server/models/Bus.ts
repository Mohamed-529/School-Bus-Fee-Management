import mongoose, { Schema } from 'mongoose';

const BusSchema = new Schema({
  id: { type: String, required: true, unique: true },
  busNumber: { type: String, required: true, unique: true },
  registrationNumber: { type: String, required: true },
  capacity: { type: Number, required: true },
  driverName: { type: String, required: true },
  driverPhone: { type: String, required: true },
  routeId: { type: String, default: '' },
  status: { type: String, default: 'active' }, // active, inactive
  startingLocation: { type: String, default: '' },
  startingTime: { type: String, default: '' },
  destination: { type: String, default: '' }
});

export const BusModel: any = mongoose.models.Bus || mongoose.model('Bus', BusSchema);

