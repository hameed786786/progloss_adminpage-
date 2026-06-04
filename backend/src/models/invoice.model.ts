import mongoose, { Schema } from 'mongoose';

const InvoiceSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  customer: { type: String, required: true },
  community: { type: String },
  plate: { type: String },
  plan: { type: String },
  subtotal: { type: Number, default: 0 },
  vat: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  status: { type: String, default: 'pending' },
  date: { type: String }
});

export const InvoiceModel = mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
