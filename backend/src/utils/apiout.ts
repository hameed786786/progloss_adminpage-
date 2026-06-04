import type { Response } from 'express';

export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: unknown;
};

export function sendSuccess<T = unknown>(res: Response, data?: T, message?: string, status = 200) {
  const body: ApiResponse<T> = { success: true, message, data };
  return res.status(status).json(body);
}

export function sendError(res: Response, message?: string, error?: unknown, status = 500) {
  const body: ApiResponse = { success: false, message, error };
  return res.status(status).json(body);
}
