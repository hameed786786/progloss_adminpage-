import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkOrder extends Document {
  id: string;
  plate: string;
  community: string;
  plan: string;
  slot: string;
  tech: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorkOrderSchema = new Schema<IWorkOrder>(
  {
    id: { type: String, required: true, unique: true, index: true },
    plate: { type: String },
    community: { type: String },
    plan: { type: String },
    slot: { type: String },
    tech: { type: String },
    status: { type: String, default: 'queued', enum: ['queued', 'in-progress', 'completed', 'delayed', 'cancelled'] },
  },
  { timestamps: true }
);

export const WorkOrderModel = mongoose.models.WorkOrder || mongoose.model<IWorkOrder>('WorkOrder', WorkOrderSchema);
