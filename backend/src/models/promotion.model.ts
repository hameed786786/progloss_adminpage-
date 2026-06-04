import mongoose, { Schema } from 'mongoose';

const PromotionSchema = new Schema({
  name: { type: String, required: true, unique: true, index: true },
  channels: [{ type: String }],
  starts: { type: String },
  ends: { type: String },
  reach: { type: Number, default: 0 },
  ctr: { type: Number, default: 0 },
  conv: { type: Number, default: 0 },
  status: { type: String, default: 'live' },
});

export const PromotionModel =
  mongoose.models.Promotion || mongoose.model('Promotion', PromotionSchema);
