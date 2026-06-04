import { Router } from 'express';
import { WorkOrderModel } from '../models/workOrder.model';
import { sendSuccess, sendError } from '../utils';

const router = Router();

router.get('/', async (_req, res) => {
  const data = await WorkOrderModel.find().sort({ id: 1 }).lean();
  return sendSuccess(res, data, 'Work orders fetched successfully');
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const update = req.body;
  const workOrder = await WorkOrderModel.findOneAndUpdate(
    { id },
    update,
    { new: true, lean: true }
  );
  if (!workOrder) {
    return sendError(res, 'Work order not found', null, 404);
  }
  return sendSuccess(res, workOrder, 'Work order updated successfully');
});

export default router;
