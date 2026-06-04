import { ZodObject, ZodTypeAny } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils';

export const validate = (schema: ZodObject<Record<string, ZodTypeAny>>) => (req: Request, res: Response, next: NextFunction) => {
  const parsed = schema.safeParse({ body: req.body, query: req.query, params: req.params });
  if (!parsed.success) {
    return sendError(res, 'Validation failed', parsed.error.format(), 400);
  }
  req.body = parsed.data.body as any;
  req.query = parsed.data.query as any;
  req.params = parsed.data.params as any;
  next();
};