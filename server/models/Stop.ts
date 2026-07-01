import mongoose, { Schema } from 'mongoose';

const StopSchema = new Schema({
  id: { type: String, required: true, unique: true },
  routeId: { type: String, required: true },
  stopName: { type: String, required: true },
  pickupTime: { type: String, required: true },
  dropTime: { type: String, default: '' },
  feePerStop: { type: Number, default: 0 },
  order: { type: Number, required: true }
});

export const StopModel: any = mongoose.models.Stop || mongoose.model('Stop', StopSchema);

