import { Router } from 'express';
import { GatewayModel, GatewayEventModel } from '../models/gateway.model';
import { sendSuccess } from '../utils';

const router = Router();

router.get('/', async (_req, res) => {
  const gateways = await GatewayModel.find().lean();
  const events = await GatewayEventModel.find().sort({ createdAt: -1 }).limit(50).lean();
  return sendSuccess(res, { gateways, events }, 'Gateways fetched successfully');
});

export default router;
