import { Router } from 'express';
import { exportJobService } from '../services/exportJob.service';
import * as controller from '../controllers/export-jobs.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { sendSuccess } from '../utils';

const router = Router();

router.get('/', async (_req, res) => sendSuccess(res, await exportJobService.list()));
router.post('/', authenticate, requireRole(['Super Admin']), controller.create);
router.get('/:id/download', authenticate, controller.download);
router.put('/:id', authenticate, requireRole(['Super Admin']), controller.update);
router.delete('/:id', authenticate, requireRole(['Super Admin']), controller.remove);

export default router;