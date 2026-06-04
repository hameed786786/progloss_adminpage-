import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { sendSuccess } from '../utils';

export const getOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const range = typeof req.query.range === 'string' ? req.query.range : '12M';
    const data = await dashboardService.getOverview(range);
    return sendSuccess(res, data, 'Dashboard data fetched successfully');
  } catch (err) {
    next(err);
  }
};
