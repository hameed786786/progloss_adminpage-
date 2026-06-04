import { Router } from 'express';
import * as dashboard from '../controllers/dashboard.controller';

const router = Router();

router.get('/overview', dashboard.getOverview);

export default router;
