import mongoose, { Schema } from 'mongoose';

const PaymentSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    method: { type: String, required: true },
    customer: { type: String, required: true },
    gateway: { type: String },
    amount: { type: Number, default: 0 },
    status: { type: String, default: 'pending' },
    date: { type: String }
  },
  { timestamps: true }
);

export const PaymentModel = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
