import { Router } from 'express';
import { AnalyticsSnapshotModel } from '../models/analyticsSnapshot.model';
import { dashboardService } from '../services/dashboard.service';
import { sendSuccess, sendError } from '../utils';

const router = Router();

router.get('/', async (_req, res) => {
  const [overview, snapshots] = await Promise.all([
    dashboardService.getOverview(),
    AnalyticsSnapshotModel.find().lean()
  ]);
  const data = Object.fromEntries(snapshots.map((s) => [s.key, s.data]));
  
  // Overwrite with dynamic data
  data.revenueTrend = overview.revenueTrend;
  data.subscriptionGrowth = overview.subscriptionGrowth;
  data.complaintTrend = overview.complaintTrend;

  return sendSuccess(res, data, 'Analytics fetched successfully');
});

router.get('/:key', async (req, res) => {
  const key = req.params.key;
  if (key === 'revenueTrend' || key === 'subscriptionGrowth' || key === 'complaintTrend') {
    const overview = await dashboardService.getOverview();
    return sendSuccess(res, overview[key as keyof typeof overview], 'Analytics fetched successfully');
  }

  const snapshot = await AnalyticsSnapshotModel.findOne({ key }).lean<any>();
  if (!snapshot) return sendError(res, 'Analytics key not found', undefined, 404);
  return sendSuccess(res, snapshot.data, 'Analytics fetched successfully');
});

export default router;
