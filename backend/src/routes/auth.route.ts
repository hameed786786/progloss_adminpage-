import { Router } from 'express';
import * as auth from '../controllers/auth.controller';

const router = Router();

router.post('/auth/login', auth.login);
router.post('/auth/refresh', auth.refresh);

export default router;