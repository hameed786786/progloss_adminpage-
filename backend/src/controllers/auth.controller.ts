import { NextFunction, Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { env } from '../config/env';

function setRefreshCookie(res: Response, refreshToken: string) {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/api/auth/refresh'
  });
}

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body;
    const tokens = await authService.register(email, password, name);
    setRefreshCookie(res, tokens.refreshToken);
    res.status(201).json({ success: true, data: tokens });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const tokens = await authService.login(email, password);
    setRefreshCookie(res, tokens.refreshToken);
    res.json({ success: true, data: tokens });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Missing refresh token' });
    }
    const tokens = await authService.rotateRefreshToken(refreshToken);
    setRefreshCookie(res, tokens.refreshToken);
    res.json({ success: true, data: tokens });
  } catch (error) {
    next(error);
  }
};