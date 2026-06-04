import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { RequestHandler } from 'express';
import { env } from '../config/env';
import jwt from 'jsonwebtoken';

export const securityMiddleware: RequestHandler[] = [
  helmet(),
  compression(),
  cookieParser(),
  rateLimit({
    windowMs: Number(env.RATE_LIMIT_WINDOW_MS),
    limit: Number(env.RATE_LIMIT_MAX),
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    // Skip rate limiting for local development and localhost requests to avoid blocking frequent local reloads
    skip: (req) => {
      try {
        if (env.NODE_ENV !== 'production') return true;
        const ip = (req.ip || '').toString();
        if (ip === '::1' || ip === '127.0.0.1') return true;

        // If request has an Authorization bearer token, verify it and skip rate limiting for Super Admin
        const auth = (req.headers && (req.headers as any).authorization) || '';
        if (!auth) return false;
        const parts = auth.split(' ');
        if (parts.length !== 2) return false;
        const token = parts[1];
        try {
          const payload = jwt.verify(token, env.JWT_SECRET) as any;
          if (payload && payload.role === 'Super Admin') return true;
        } catch (e) {
          // ignore token errors and do not skip
        }
      } catch (e) {
        // any unexpected error -> do not skip
      }
      return false;
    }
  })
];
