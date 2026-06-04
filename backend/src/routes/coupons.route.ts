import { Router } from 'express';
import { CouponModel } from '../models/coupon.model';
import { sendSuccess } from '../utils';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { emit } from '../integrations/socket';

const router = Router();

router.get('/', async (_req, res) => {
  const data = await CouponModel.find().sort({ code: 1 }).lean();
  return sendSuccess(res, data, 'Coupons fetched successfully');
});

router.post('/', authenticate, requireRole(['Super Admin']), async (req, res, next) => {
  try {
    const created = await CouponModel.create(req.body);
    const list = await CouponModel.find().sort({ code: 1 }).lean();
    emit('coupons:update', list);
    return sendSuccess(res, created, 'Coupon created', 201);
  } catch (err) {
    next(err);
  }
});

export default router;

