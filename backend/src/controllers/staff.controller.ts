import { Request, Response, NextFunction } from 'express';
import { emit } from '../integrations/socket';
import { staffService } from '../services/staff.service';
import { roleService } from '../services/role.service';
import { sendSuccess, sendError } from '../utils';

async function assertRoleExists(role: unknown) {
  if (typeof role !== 'string' || !role.trim()) {
    return false;
  }

  const existing = await roleService.findByName(role.trim());
  return Boolean(existing);
}

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!(await assertRoleExists(req.body.role))) {
      return sendError(res, 'Role does not exist', undefined, 400);
    }
    const created = await staffService.create(req.body as any);
    const list = await staffService.list();
    emit('staff:update', list);
    return sendSuccess(res, created, undefined, 201);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.body.role !== undefined && !(await assertRoleExists(req.body.role))) {
      return sendError(res, 'Role does not exist', undefined, 400);
    }
    const updated = await staffService.update(req.params.id, req.body as any);
    if (!updated) return sendError(res, 'Staff not found', undefined, 404);
    const list = await staffService.list();
    emit('staff:update', list);
    return sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await staffService.remove(req.params.id);
    const list = await staffService.list();
    emit('staff:update', list);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};