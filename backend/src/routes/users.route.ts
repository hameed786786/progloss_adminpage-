import { Router } from 'express';
import * as usersCtrl from '../controllers/users.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/me', authenticate, usersCtrl.getMe);
router.put('/me/dismissed-notifications', authenticate, usersCtrl.updateDismissedNotifications);

export default router;
