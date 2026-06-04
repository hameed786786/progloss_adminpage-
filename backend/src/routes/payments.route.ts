import { Router } from 'express';
import * as payments from '../controllers/payments.controller';
import { paymentService } from '../services/payment.service';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { sendSuccess } from '../utils';

const router = Router();

router.get('/', async (req, res) => sendSuccess(res, await paymentService.list()));

router.post('/', authenticate, requireRole(['Super Admin']), payments.create);
router.put('/:id', authenticate, requireRole(['Super Admin']), payments.update);
router.delete('/:id', authenticate, requireRole(['Super Admin']), payments.remove);

export default router;