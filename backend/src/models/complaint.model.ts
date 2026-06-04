import mongoose, { Schema } from 'mongoose';

const ComplaintSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  subject: { type: String, required: true },
  customer: { type: String, required: true },
  community: { type: String },
  severity: { type: String },
  status: { type: String },
  sla: { type: String },
  owner: { type: String },
  opened: { type: String },
});

export const ComplaintModel = mongoose.models.Complaint || mongoose.model('Complaint', ComplaintSchema);
