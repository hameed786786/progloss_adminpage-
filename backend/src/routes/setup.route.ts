import { Router } from 'express';
import { UserModel } from '../models/user.model';
import { env } from '../config/env';
import { sendSuccess } from '../utils';

const router = Router();

// Returns whether the application has zero users in the DB.
// This endpoint is intentionally permissive in non-production to aid local setup.
router.get('/', async (_req, res, next) => {
  try {
    const count = await UserModel.countDocuments();
    return sendSuccess(res, { noUsers: count === 0, nodeEnv: env.NODE_ENV });
  } catch (err) {
    next(err);
  }
});

export default router;