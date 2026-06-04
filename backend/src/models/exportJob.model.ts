import mongoose, { Schema } from 'mongoose';

const ExportJobSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  template: { type: String },
  desc: { type: String },
  format: { type: String },
  fileName: { type: String },
  by: { type: String },
  size: { type: String },
  at: { type: String },
  status: { type: String, default: 'queued' }
});

export const ExportJobModel = mongoose.models.ExportJob || mongoose.model('ExportJob', ExportJobSchema);
