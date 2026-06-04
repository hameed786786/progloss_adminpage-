import { Router } from 'express';
import { ComplaintModel } from '../models/complaint.model';
import { sendSuccess } from '../utils';

const router = Router();

router.get('/', async (_req, res) => {
  const data = await ComplaintModel.find().sort({ id: -1 }).lean();
  return sendSuccess(res, data, 'Complaints fetched successfully');
});

export default router;
