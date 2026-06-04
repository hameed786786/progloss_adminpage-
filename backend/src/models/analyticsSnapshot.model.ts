import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalyticsSnapshot extends Document {
  key: string;
  data: any;
  updatedAt: Date;
}

const AnalyticsSnapshotSchema = new Schema<IAnalyticsSnapshot>({
  key: { type: String, required: true, unique: true, index: true },
  data: { type: Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: () => new Date() },
});

export const AnalyticsSnapshotModel =
  mongoose.models.AnalyticsSnapshot || mongoose.model<IAnalyticsSnapshot>('AnalyticsSnapshot', AnalyticsSnapshotSchema);
