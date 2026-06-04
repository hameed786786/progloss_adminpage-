import mongoose, { Schema } from 'mongoose';

const PlanSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  freq: { type: String, required: true },
  washes: { type: Number },
  vehicles: { type: Number },
  perks: { type: [String], default: [] },
  active: { type: Number, default: 0 },
  cycleStatus: { type: String, enum: ['Running', 'Paused', 'Scheduled'], default: 'Scheduled' },
});

export const PlanModel = mongoose.models.Plan || mongoose.model('Plan', PlanSchema);
