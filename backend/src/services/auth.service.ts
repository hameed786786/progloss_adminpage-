import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userService } from '../services/user.service';
import { RefreshTokenModel } from '../models/refreshToken.model';
import { env } from '../config/env';
import { addDays } from 'date-fns';
import { randomUUID } from 'crypto';
import { ApiError } from '../common/errors/api-error';

const ACCESS_EXPIRES = env.JWT_ACCESS_EXPIRES;
const REFRESH_DAYS = Number(env.JWT_REFRESH_EXPIRES_DAYS || '30');
const ADMIN_ROLE = 'Super Admin';
const ADMIN_EMAIL = 'mohamedishaq499@gmail.com';

function signAccess(payload: object) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: ACCESS_EXPIRES });
}

export class AuthService {
  async register(email: string, password: string, name?: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await userService.findByEmail(normalizedEmail);
    if (existing) throw new ApiError(400, 'User already exists', 'BAD_REQUEST');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await userService.create({
      email: normalizedEmail,
      name,
      passwordHash,
      role: 'User'
    });

    return this.createTokens(user);
  }

  async login(email: string, password: string) {
    const user = (await userService.findByEmail(email.trim().toLowerCase())) as any;
    if (!user) throw new ApiError(401, 'Invalid credentials', 'UNAUTHORIZED');
    const ok = await bcrypt.compare(password, (user as any).passwordHash || user.passwordHash);
    if (!ok) throw new ApiError(401, 'Invalid credentials', 'UNAUTHORIZED');
    return this.createTokens(user as any);
  }

  private async createTokens(user: any) {
    const payload = { sub: user._id?.toString() || user.id, role: user.role || 'User' };
    const accessToken = signAccess(payload);
    const tokenId = randomUUID();
    const refreshToken = `${tokenId}.${randomUUID()}${randomUUID()}`;
    const expiresAt = addDays(new Date(), REFRESH_DAYS);
    const tokenHash = await bcrypt.hash(refreshToken, 12);
    await RefreshTokenModel.create({ tokenId, tokenHash, userId: user._id || user.id, expiresAt });
    return { accessToken, refreshToken, expiresAt };
  }

  async rotateRefreshToken(oldToken: string) {
    if (!oldToken) throw new ApiError(401, 'Invalid refresh token', 'UNAUTHORIZED');
    const [tokenId] = oldToken.split('.');
    if (!tokenId) throw new ApiError(401, 'Invalid refresh token', 'UNAUTHORIZED');

    const token = await RefreshTokenModel.findOne({ tokenId, revoked: false });
    if (!token) throw new ApiError(401, 'Invalid refresh token', 'UNAUTHORIZED');

    const matches = await bcrypt.compare(oldToken, token.tokenHash);
    if (!matches) throw new ApiError(401, 'Invalid refresh token', 'UNAUTHORIZED');

    token.revoked = true;
    await token.save();

    const user = await userService.findById(token.userId.toString());
    if (!user) throw new ApiError(404, 'User not found', 'NOT_FOUND');
    return this.createTokens(user);
  }
}

export const authService = new AuthService();
