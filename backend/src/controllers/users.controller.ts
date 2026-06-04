import { Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { sendSuccess, sendError } from '../utils';
import { AuthRequest } from '../middleware/auth.middleware';

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return sendError(res, 'Unauthenticated', undefined, 401);
    const user = await userService.findById(req.user.sub);
    if (!user) return sendError(res, 'User not found', undefined, 404);

    return sendSuccess(res, {
      id: user._id?.toString() || user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      dismissedNotifications: user.dismissedNotifications || []
    });
  } catch (err) {
    next(err);
  }
};

export const updateDismissedNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return sendError(res, 'Unauthenticated', undefined, 401);
    const { dismissedNotifications } = req.body;
    if (!Array.isArray(dismissedNotifications)) {
      return sendError(res, 'Invalid dismissedNotifications format. Expected array of strings.', undefined, 400);
    }
    const updated = await userService.update(req.user.sub, { dismissedNotifications });
    if (!updated) return sendError(res, 'User not found', undefined, 404);

    return sendSuccess(res, {
      id: updated._id?.toString() || updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      dismissedNotifications: updated.dismissedNotifications || []
    });
  } catch (err) {
    next(err);
  }
};
