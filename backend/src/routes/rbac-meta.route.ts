import { Router } from 'express';
import { PERM_MODULES, PERM_ACTIONS } from '../constants/rbac';
import { sendSuccess } from '../utils';

const router = Router();

router.get('/meta', (_req, res) => {
  return sendSuccess(res, { modules: PERM_MODULES, actions: PERM_ACTIONS }, 'RBAC metadata fetched');
});

export default router;
