import mongoose, { Schema } from 'mongoose';

const CreditNoteSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  invoice: { type: String, required: true },
  customer: { type: String, required: true },
  reason: { type: String },
  amount: { type: Number, default: 0 },
  vat: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  issued: { type: String },
  status: { type: String, default: 'pending' }
});

export const CreditNoteModel = mongoose.models.CreditNote || mongoose.model('CreditNote', CreditNoteSchema);
