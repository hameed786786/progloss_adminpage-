import { Request, Response, NextFunction } from 'express';
import { emit } from '../integrations/socket';
import { paymentService } from '../services/payment.service';
import { sendSuccess, sendError, logAudit, triggerNotification } from '../utils';
import { AuthRequest } from '../middleware/auth.middleware';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const created = await paymentService.create(req.body as any);
    const list = await paymentService.list();
    emit('payments:update', list);

    // Audit log & trigger notifications
    const aReq = req as AuthRequest;
    await logAudit(aReq.user?.sub, aReq.user?.role, `Created payment · ${req.body.id || (created as any).id}`, req.ip);
    if (req.body.status === 'failed') {
      await triggerNotification('payment.failed');
    }

    return sendSuccess(res, created, undefined, 201);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await paymentService.update(req.params.id, req.body as any);
    if (!updated) return sendError(res, 'Payment not found', undefined, 404);
    const list = await paymentService.list();
    emit('payments:update', list);

    // Audit log & trigger notifications
    const aReq = req as AuthRequest;
    await logAudit(aReq.user?.sub, aReq.user?.role, `Updated payment status · ${req.params.id} to ${req.body.status || (updated as any).status}`, req.ip);
    if (req.body.status === 'failed') {
      await triggerNotification('payment.failed');
    }

    return sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await paymentService.remove(req.params.id);
    const list = await paymentService.list();
    emit('payments:update', list);

    // Audit log
    const aReq = req as AuthRequest;
    await logAudit(aReq.user?.sub, aReq.user?.role, `Deleted payment · ${req.params.id}`, req.ip);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};