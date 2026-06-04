import { Router } from 'express';
import * as rolesCtrl from '../controllers/roles.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/', rolesCtrl.listRoles);
router.post('/', authenticate, requireRole(['Super Admin']), rolesCtrl.createRole);
router.get('/:name/permissions', rolesCtrl.getPermissions);
router.put('/:name/permissions', authenticate, requireRole(['Super Admin']), rolesCtrl.setPermissions);
router.delete('/:name', authenticate, requireRole(['Super Admin']), rolesCtrl.deleteRole);

export default router;