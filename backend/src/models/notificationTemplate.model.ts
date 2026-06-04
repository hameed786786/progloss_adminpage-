import mongoose, { Schema } from 'mongoose';

const NotificationTemplateSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  type: { type: String, required: true },
  name: { type: String, required: true },
  subject: { type: String },
  body: { type: String },
  trigger: { type: String },
  sender: { type: String },
  status: { type: String, default: 'draft' },
  sent: { type: Number, default: 0 },
  sent24h: { type: Number, default: 0 },
  open: { type: Number, default: 0 },
  click: { type: Number, default: 0 },
  delivered: { type: Number, default: 0 }
});

export const NotificationTemplateModel =
  mongoose.models.NotificationTemplate || mongoose.model('NotificationTemplate', NotificationTemplateSchema);
