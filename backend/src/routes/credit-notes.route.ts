import { Router } from 'express';
import { creditNoteService } from '../services/creditNote.service';
import * as controller from '../controllers/credit-notes.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { sendSuccess } from '../utils';

const router = Router();

router.get('/', async (_req, res) => sendSuccess(res, await creditNoteService.list()));
router.post('/', authenticate, requireRole(['Super Admin']), controller.create);
router.put('/:id', authenticate, requireRole(['Super Admin']), controller.update);
router.delete('/:id', authenticate, requireRole(['Super Admin']), controller.remove);

export default router;