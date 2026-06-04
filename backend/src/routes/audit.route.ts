import { Router } from 'express';
import { AuditLogModel } from '../models/auditLog.model';
import { sendSuccess } from '../utils';

const router = Router();

router.get('/', async (_req, res) => {
  const data = await AuditLogModel.find().sort({ createdAt: -1 }).lean();
  return sendSuccess(res, data, 'Audit logs fetched successfully');
});

export default router;
