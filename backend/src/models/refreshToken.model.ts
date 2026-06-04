import mongoose, { Schema } from 'mongoose';

const RefreshTokenSchema = new Schema({
  tokenId: { type: String, required: true, unique: true, index: true },
  tokenHash: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  revoked: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: () => new Date() }
});

export const RefreshTokenModel = mongoose.models.RefreshToken || mongoose.model('RefreshToken', RefreshTokenSchema);
