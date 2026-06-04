
import { Router } from 'express';
import * as invoices from '../controllers/invoices.controller';
import { invoiceService } from '../services/invoice.service';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils';

const router = Router();

router.get('/', async (req, res) => sendSuccess(res, await invoiceService.list()));
router.get('/:id', async (req, res) => {
  const i = await invoiceService.get(req.params.id);
  if (!i) return sendError(res, 'Invoice not found', undefined, 404);
  return sendSuccess(res, i);
});

router.post('/', authenticate, requireRole(['Super Admin']), invoices.create);
router.put('/:id', authenticate, requireRole(['Super Admin']), invoices.update);
router.delete('/:id', authenticate, requireRole(['Super Admin']), invoices.remove);

export default router;