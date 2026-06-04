import mongoose, { Schema } from 'mongoose';

const RoleSchema = new Schema({
  id: { type: String, index: true },
  name: { type: String, required: true, unique: true, index: true },
  desc: { type: String },
  color: { type: String, default: 'neutral' },
  // stored user count for display; updated on seed / role assignment
  userCount: { type: Number, default: 0 },
  // permission matrix: { moduleName: { view, create, edit, delete, export, approve, manage } }
  matrix: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() }
});

RoleSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const RoleModel = mongoose.models.Role || mongoose.model('Role', RoleSchema);
