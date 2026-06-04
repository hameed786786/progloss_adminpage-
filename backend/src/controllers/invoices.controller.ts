import { Request, Response, NextFunction } from 'express';
import { emit } from '../integrations/socket';
import { invoiceService } from '../services/invoice.service';
import { sendSuccess, sendError, logAudit, triggerNotification } from '../utils';
import { AuthRequest } from '../middleware/auth.middleware';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const created = await invoiceService.create(req.body as any);
    const list = await invoiceService.list();
    emit('invoices:update', list);

    // Audit log & trigger notifications
    const aReq = req as AuthRequest;
    await logAudit(aReq.user?.sub, aReq.user?.role, `Created invoice · ${req.body.id || (created as any).id}`, req.ip);
    await triggerNotification('invoice.issued');

    return sendSuccess(res, created, undefined, 201);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await invoiceService.update(req.params.id, req.body as any);
    if (!updated) return sendError(res, 'Invoice not found', undefined, 404);
    const list = await invoiceService.list();
    emit('invoices:update', list);

    // Audit log & trigger notifications
    const aReq = req as AuthRequest;
    await logAudit(aReq.user?.sub, aReq.user?.role, `Updated invoice status · ${req.params.id} to ${req.body.status || (updated as any).status}`, req.ip);
    if (req.body.status === 'refunded') {
      await triggerNotification('refund.completed');
    }

    return sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await invoiceService.remove(req.params.id);
    const list = await invoiceService.list();
    emit('invoices:update', list);

    // Audit log
    const aReq = req as AuthRequest;
    await logAudit(aReq.user?.sub, aReq.user?.role, `Deleted invoice · ${req.params.id}`, req.ip);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};