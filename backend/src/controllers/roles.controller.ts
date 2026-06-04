import { Request, Response, NextFunction } from 'express';
import { roleService } from '../services/role.service';
import { emit } from '../integrations/socket';
import { sendSuccess, sendError, logAudit } from '../utils';
import { AuthRequest } from '../middleware/auth.middleware';

export const createRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, desc, matrix } = req.body;
    if (!name) return sendError(res, 'Missing name', undefined, 400);
    const existing = await roleService.findByName(name);
    if (existing) return sendError(res, 'Role already exists', undefined, 409);
    const created = await roleService.create({ name, desc, matrix: matrix || {} });
    const list = await roleService.list();
    emit('roles:update', list);
    
    // Log audit action
    const aReq = req as AuthRequest;
    await logAudit(aReq.user?.sub, aReq.user?.role, `Created role · ${name}`, req.ip);

    return sendSuccess(res, created, undefined, 201);
  } catch (err) {
    next(err);
  }
};

export const listRoles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await roleService.list();
    return sendSuccess(res, list);
  } catch (err) {
    next(err);
  }
};

export const getPermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const name = req.params.name;
    const role = (await roleService.findByName(name)) as any;
    if (!role) return sendError(res, 'Role not found', undefined, 404);
    return sendSuccess(res, role.matrix || {});
  } catch (err) {
    next(err);
  }
};

export const setPermissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const name = req.params.name;
    const { matrix } = req.body;
    if (!matrix) return sendError(res, 'Missing matrix', undefined, 400);
    const updated = await roleService.updateMatrix(name, matrix);
    const list = await roleService.list();
    emit('roles:update', list);

    // Log audit action
    const aReq = req as AuthRequest;
    await logAudit(aReq.user?.sub, aReq.user?.role, `Updated permission matrix · ${name}`, req.ip);

    return sendSuccess(res, updated);
  } catch (err) {
    next(err);
  }
};

export const deleteRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const name = req.params.name;
    if (name === 'Super Admin') {
      return sendError(res, 'Super Admin cannot be deleted', undefined, 400);
    }

    const existing = await roleService.findByName(name);
    if (!existing) {
      return sendError(res, 'Role not found', undefined, 404);
    }

    await roleService.deleteByName(name);
    const list = await roleService.list();
    emit('roles:update', list);

    // Log audit action
    const aReq = req as AuthRequest;
    await logAudit(aReq.user?.sub, aReq.user?.role, `Deleted role · ${name}`, req.ip);

    return sendSuccess(res, { deleted: true, name });
  } catch (err) {
    next(err);
  }
};