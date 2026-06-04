import mongoose, { Schema } from 'mongoose';

const EcommerceOrderSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  customer: { type: String, required: true },
  items: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  status: { type: String, default: 'processing' },
  date: { type: String },
  channel: { type: String, default: 'Web' },
});

export const EcommerceOrderModel =
  mongoose.models.EcommerceOrder || mongoose.model('EcommerceOrder', EcommerceOrderSchema);
