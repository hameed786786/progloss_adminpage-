import mongoose, { Schema } from 'mongoose';

const CustomerSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  community: { type: String },
  vehicles: { type: Number, default: 0 },
  plan: { type: String },
  status: { type: String, default: 'active' },
  since: { type: Date },
  nextRenewal: { type: Date },
  ltv: { type: Number, default: 0 },
  meta: { type: Schema.Types.Mixed, default: {} }
});

export const CustomerModel = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
