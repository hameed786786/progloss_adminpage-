import { Router } from 'express';
import { ApartmentModel } from '../models/apartment.model';
import { sendSuccess } from '../utils';
import { authenticate } from '../middleware/auth.middleware';
import { emit } from '../integrations/socket';

const router = Router();

router.get('/', async (_req, res) => {
  const data = await ApartmentModel.find().sort({ mrr: -1 }).lean();
  return sendSuccess(res, data, 'Apartments fetched successfully');
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const created = await ApartmentModel.create(req.body);
    const list = await ApartmentModel.find().sort({ mrr: -1 }).lean();
    emit('apartments:update', list);
    return sendSuccess(res, created, 'Apartment created', 201);
  } catch (err) {
    next(err);
  }
});

export default router;

