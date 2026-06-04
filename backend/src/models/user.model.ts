import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'User' },
  dismissedNotifications: { type: [String], default: [] },
  meta: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() }
});

UserSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
