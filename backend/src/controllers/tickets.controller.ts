import { Request, Response, NextFunction } from 'express';
import { emit } from '../integrations/socket';
import { ticketService } from '../services/ticket.service';
import { sendSuccess, sendError } from '../utils';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const created = await ticketService.create(req.body as any);
    const list = await ticketService.list();
    emit('tickets:update', list);
    return sendSuccess(res, created, undefined, 201);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await ticketService.update(req.params.id, req.body as any);
    if (!updated) return sendError(res, 'Ticket not found', undefined, 404);
    const list = await ticketService.list();
    emit('tickets:update', list);
    return sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ticketService.remove(req.params.id);
    const list = await ticketService.list();
    emit('tickets:update', list);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};