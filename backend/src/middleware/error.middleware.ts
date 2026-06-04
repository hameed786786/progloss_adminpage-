import { NextFunction, Request, Response } from 'express';
import { ApiError, createInternalServerError } from '../common/errors/api-error';
import { logger } from '../common/logger';
import type { ApiResponse } from '../utils';

interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response<ApiResponse<unknown>>,
  _next: NextFunction
) {
  const error = err instanceof ApiError ? err : createInternalServerError();

  logger.error(
    {
      err,
      path: req.path,
      method: req.method,
      requestId: (req as Request & { requestId?: string }).requestId
    },
    'request failed'
  );

  const payload: ApiErrorPayload = {
    code: error.code,
    message: error.message,
    details: error.details ?? undefined
  };

  return res.status(error.statusCode).json({
    success: false,
    error: payload
  });
}