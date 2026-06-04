import { Request, Response, NextFunction } from 'express';
import { roleService } from '../services/role.service';
import { sendError, can, PermissionAction, logAudit } from '../utils';

export interface AuthRequest extends Request {
  user?: { sub: string; role: string };
}

export const requirePermission = (moduleName: string, actionName: string) => async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return sendError(res, 'Unauthenticated', undefined, 401);
  }

  const roleName = req.user.role || 'User';

  try {
    const role = await roleService.findByName(roleName);

    // Map incoming action strings to canonical PermissionAction keys
    const actionKeyMap: Record<string, PermissionAction> = {
      Read: 'VIEW', View: 'VIEW', VIEW: 'VIEW',
      Create: 'CREATE', CREATE: 'CREATE',
      Update: 'EDIT', Edit: 'EDIT', EDIT: 'EDIT',
      Delete: 'DELETE', DELETE: 'DELETE',
      Export: 'EXPORT', EXPORT: 'EXPORT',
      Billing: 'APPROVE', Approve: 'APPROVE', APPROVE: 'APPROVE',
      Analytics: 'MANAGE', Admin: 'MANAGE', MANAGE: 'MANAGE'
    };

    const actionKey = actionKeyMap[actionName] || 'VIEW';
    const allowed = can(role, moduleName, actionKey);

    if (!allowed) {
      // Log unauthorized access attempts in the audit log
      await logAudit(
        req.user.sub,
        roleName,
        `UNAUTHORIZED attempt to perform action: ${actionName} on module: ${moduleName} (Failed)`,
        req.ip
      );
      return sendError(res, `Forbidden: Missing ${actionKey} permission for module ${moduleName}`, undefined, 403);
    }

    // Log successful action for permission-sensitive mutation actions
    if (actionKey !== 'VIEW') {
      await logAudit(
        req.user.sub,
        roleName,
        `Successful action: ${actionName} on module: ${moduleName} (Success)`,
        req.ip
      );
    }

    return next();
  } catch (err) {
    console.error('RBAC authorization middleware error', err);
    return sendError(res, 'Authorization Error', (err as Error).message, 500);
  }
};