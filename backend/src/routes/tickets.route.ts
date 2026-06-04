import { Router } from 'express';
import * as tickets from '../controllers/tickets.controller';
import { ticketService } from '../services/ticket.service';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { sendSuccess } from '../utils';

const router = Router();

router.get('/', async (req, res) => sendSuccess(res, await ticketService.list()));

router.post('/', authenticate, requireRole(['Super Admin']), tickets.create);
router.put('/:id', authenticate, requireRole(['Super Admin']), tickets.update);
router.delete('/:id', authenticate, requireRole(['Super Admin']), tickets.remove);

export default router;