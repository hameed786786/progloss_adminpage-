import mongoose, { Schema } from 'mongoose';

const TicketSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  subject: { type: String, required: true },
  customer: { type: String, required: true },
  priority: { type: String },
  status: { type: String },
  sla: { type: String },
  assigned: { type: String },
  created: { type: String },
  description: { type: String, default: "" },
  replies: [
    {
      sender: { type: String, required: true },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }
  ]
});

export const TicketModel = mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);
