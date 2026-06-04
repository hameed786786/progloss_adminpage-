import mongoose, { Schema, Document } from 'mongoose';

export interface IVehicle extends Document {
  plate: string;
  make: string;
  color: string;
  customer: mongoose.Types.ObjectId | string;
  community: string;
  plan: string;
  lastWash?: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    plate: { type: String, required: true, index: true },
    make: { type: String, required: true },
    color: { type: String, required: true },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    community: { type: String },
    plan: { type: String },
    lastWash: { type: Date },
    status: { type: String, default: 'active', enum: ['active', 'queued', 'inactive'] },
  },
  { timestamps: true }
);

export const VehicleModel = mongoose.models.Vehicle || mongoose.model<IVehicle>('Vehicle', VehicleSchema);
