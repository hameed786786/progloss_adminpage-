import { Response } from 'express';

export function ok(res: Response, data: any, meta?: any) {
  return res.json({ success: true, data, ...(meta ? { meta } : {}) });
}

export function created(res: Response, data: any) {
  return res.status(201).json({ success: true, data });
}

export function noContent(res: Response) {
  return res.status(204).send();
}
