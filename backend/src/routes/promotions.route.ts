import { Router } from 'express';
import { PromotionModel } from '../models/promotion.model';
import { sendSuccess } from '../utils';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const data = await PromotionModel.find().sort({ name: 1 }).lean();
    return sendSuccess(res, data, 'Promotions fetched successfully');
  } catch (err) {
    next(err);
  }
});

export default router;
