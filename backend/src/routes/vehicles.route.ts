import { Router } from 'express';
import { VehicleModel } from '../models/vehicle.model';
import { sendSuccess, sendError } from '../utils';
import mongoose from 'mongoose';

const router = Router();

router.get('/', async (req, res) => {
  if (mongoose.connection.readyState !== 1) return sendSuccess(res, []);
  
  const vehicles = await VehicleModel.find().populate('customer').lean();
  return sendSuccess(res, vehicles);
});

router.post('/', async (req, res) => {
  const v = await VehicleModel.create(req.body);
  return sendSuccess(res, v);
});

export default router;