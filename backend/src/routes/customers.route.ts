import { Router } from 'express';
import * as customers from '../controllers/customers.controller';
import { customerService } from '../services/customer.service';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils';

const router = Router();

router.get('/', async (req, res) => {
	const data = await customerService.list();
	return sendSuccess(res, data);
});

router.get('/:id', async (req, res) => {
	const c = await customerService.get(req.params.id);
	if (!c) return sendError(res, 'Customer not found', undefined, 404);
	return sendSuccess(res, c);
});

router.post('/', authenticate, requireRole(['Super Admin']), customers.create);
router.put('/:id', authenticate, requireRole(['Super Admin']), customers.update);
router.delete('/:id', authenticate, requireRole(['Super Admin']), customers.remove);

export default router;