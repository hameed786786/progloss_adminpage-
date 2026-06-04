import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { userService } from '../services/user.service';
import { logger } from '../common/logger';
import { sendError } from '../utils';

const JWT_SECRET = env.JWT_SECRET;

export interface AuthRequest extends Request {
  user?: { sub: string; role: string };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth) {
    logger.debug({ ip: req.ip, path: req.originalUrl }, 'auth: missing Authorization header');
    return sendError(res, 'Missing Authorization header', undefined, 401);
  }
  const [, token] = auth.split(' ');
  if (!token) {
    logger.debug({ ip: req.ip, path: req.originalUrl, authHeader: auth }, 'auth: malformed Authorization header');
    return sendError(res, 'Malformed Authorization header', undefined, 401);
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    let role = payload.role;
    if (!role && payload.sub) {
      const user = await userService.findById(payload.sub);
      const userObj: any = Array.isArray(user) ? user[0] : user;
      if (userObj) role = userObj.role || 'User';
    }
    req.user = { sub: payload.sub, role: role || 'User' };
    return next();
  } catch (e) {
    logger.debug({ ip: req.ip, path: req.originalUrl, err: (e as Error).message }, 'auth: invalid token');
    return sendError(res, 'Invalid token', (e as Error).message, 401);
  }
};

export const requireRole = (roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) return sendError(res, 'Unauthenticated', undefined, 401);
  if (!roles.includes(req.user.role)) return sendError(res, 'Forbidden', undefined, 403);
  next();
};