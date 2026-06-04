import mongoose, { Schema } from 'mongoose';

const CouponSchema = new Schema({
  code: { type: String, required: true, unique: true, index: true },
  plan: { type: String },
  discount: { type: String },
  redeemed: { type: Number, default: 0 },
  cap: { type: Number, default: 0 },
  expires: { type: String },
  status: { type: String, default: 'active' },
});

export const CouponModel = mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
