import { Router } from 'express';
import { planService } from '../services/plan.service';
import * as plansCtrl from '../controllers/plans.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { sendSuccess, sendError } from '../utils';
import { PlanModel } from '../models/plan.model';

const router = Router();

router.get('/', async (req, res) => sendSuccess(res, await planService.list()));

router.post('/', authenticate, requireRole(['Super Admin']), plansCtrl.create);
router.put('/:id', authenticate, requireRole(['Super Admin']), plansCtrl.update);
router.delete('/:id', authenticate, requireRole(['Super Admin']), plansCtrl.remove);

// Toggle billing cycle status (Paused ↔ Running/Scheduled)
router.patch('/:id/cycle-status', authenticate, async (req, res) => {
  const { id } = req.params;
  const { cycleStatus } = req.body as { cycleStatus: 'Running' | 'Paused' | 'Scheduled' };
  const allowed = ['Running', 'Paused', 'Scheduled'];
  if (!allowed.includes(cycleStatus)) {
    return sendError(res, 'Invalid cycleStatus', null, 400);
  }
  const plan = await PlanModel.findOneAndUpdate(
    { id },
    { cycleStatus },
    { new: true, lean: true }
  );
  if (!plan) return sendError(res, 'Plan not found', null, 404);
  return sendSuccess(res, plan, 'Cycle status updated');
});

export default router;