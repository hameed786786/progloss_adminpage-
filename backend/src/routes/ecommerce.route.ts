import { Router } from 'express';
import { EcommerceProductModel } from '../models/ecommerceProduct.model';
import { EcommerceOrderModel } from '../models/ecommerceOrder.model';
import { sendSuccess } from '../utils';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/products', async (_req, res) => {
  const data = await EcommerceProductModel.find().sort({ sku: 1 }).lean();
  return sendSuccess(res, data, 'Products fetched successfully');
});

router.post('/products', authenticate, requireRole(['Super Admin']), async (req, res, next) => {
  try {
    const created = await EcommerceProductModel.create(req.body);
    return sendSuccess(res, created, 'Product created successfully', 201);
  } catch (err) {
    next(err);
  }
});


router.get('/orders', async (_req, res) => {
  const data = await EcommerceOrderModel.find().sort({ id: -1 }).lean();
  return sendSuccess(res, data, 'Orders fetched successfully');
});

export default router;
