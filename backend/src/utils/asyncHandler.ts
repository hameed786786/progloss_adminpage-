import type { Request, Response, NextFunction, RequestHandler } from 'express';

export function asyncHandler<T extends RequestHandler>(fn: T): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = (fn as any)(req, res, next);
      if (result && typeof (result as Promise<any>).catch === 'function') {
        (result as Promise<any>).catch(next);
      }
    } catch (err) {
      next(err);
    }
  };
}
