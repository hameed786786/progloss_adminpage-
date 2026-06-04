import { Request, Response, NextFunction } from 'express';
import { customerService } from '../services/customer.service';
import { emit } from '../integrations/socket';
import { logAudit, triggerNotification } from '../utils';
import { AuthRequest } from '../middleware/auth.middleware';

export const list = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await customerService.list();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await customerService.get(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const created = await customerService.create(req.body);
    const list = await customerService.list();
    emit('customers:update', list);

    // Audit log & trigger notifications
    const aReq = req as AuthRequest;
    await logAudit(aReq.user?.sub, aReq.user?.role, `Created customer · ${req.body.id || (created as any).id || (created as any)._id?.toString()}`, req.ip);
    await triggerNotification('customer.created');

    res.status(201).json({ success: true, data: created });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await customerService.update(req.params.id, req.body);
    const list = await customerService.list();
    emit('customers:update', list);

    // Audit log
    const aReq = req as AuthRequest;
    await logAudit(aReq.user?.sub, aReq.user?.role, `Updated customer · ${req.params.id}`, req.ip);

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await customerService.remove(req.params.id);
    const list = await customerService.list();
    emit('customers:update', list);

    // Audit log
    const aReq = req as AuthRequest;
    await logAudit(aReq.user?.sub, aReq.user?.role, `Deleted customer · ${req.params.id}`, req.ip);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};