import mongoose, { Schema } from 'mongoose';

const AuditLogSchema = new Schema({
  ts: { type: String, required: true },
  actor: { type: String, required: true },
  role: { type: String },
  action: { type: String, required: true },
  ip: { type: String },
  createdAt: { type: Date, default: () => new Date(), index: true },
});

export const AuditLogModel = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
