import { Router } from 'express';
import * as staffCtrl from '../controllers/staff.controller';
import { staffService } from '../services/staff.service';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { env } from '../config/env';
import { validate } from '../middleware/validate.middleware';
import { createStaffSchema, updateStaffSchema } from '../schemas';
import { sendSuccess } from '../utils';

const router = Router();

const allowCreateStaff = async (req: any, res: any, next: any) => {
	if (env.NODE_ENV !== 'production') {
		return next();
	}

	return authenticate(req, res, (err?: any) => {
		if (err) return;
		return requireRole(['Super Admin'])(req, res, next);
	});
};

router.get('/', async (req, res) => sendSuccess(res, await staffService.list()));

router.post('/', allowCreateStaff, validate(createStaffSchema), staffCtrl.create);
router.put('/:id', authenticate, requireRole(['Super Admin']), validate(updateStaffSchema), staffCtrl.update);
router.delete('/:id', authenticate, requireRole(['Super Admin']), staffCtrl.remove);

export default router;