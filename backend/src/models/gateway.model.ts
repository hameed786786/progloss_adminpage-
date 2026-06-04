import mongoose, { Schema } from 'mongoose';

const GatewaySchema = new Schema({
  name: { type: String, required: true, unique: true, index: true },
  region: { type: String },
  uptime: { type: Number },
  volume: { type: Number },
  success: { type: Number },
  status: { type: String, default: 'operational' },
});

export const GatewayModel = mongoose.models.Gateway || mongoose.model('Gateway', GatewaySchema);

const GatewayEventSchema = new Schema({
  ts: { type: String, required: true },
  gw: { type: String, required: true },
  event: { type: String, required: true },
  payload: { type: String },
  level: { type: String, default: 'info' },
  createdAt: { type: Date, default: () => new Date(), index: true },
});

export const GatewayEventModel =
  mongoose.models.GatewayEvent || mongoose.model('GatewayEvent', GatewayEventSchema);
