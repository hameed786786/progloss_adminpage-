import { Router } from 'express';
import auth from './auth.route';
import customers from './customers.route';
import invoices from './invoices.route';
import plans from './plans.route';
import staff from './staff.route';
import payments from './payments.route';
import tickets from './tickets.route';
import roles from './roles.route';
import setup from './setup.route';
import notificationTemplates from './notification-templates.route';
import exportJobs from './export-jobs.route';
import creditNotes from './credit-notes.route';
import dashboard from './dashboard.route';
import apartments from './apartments.route';
import audit from './audit.route';
import workOrders from './work-orders.route';
import analytics from './analytics.route';
import coupons from './coupons.route';
import ecommerce from './ecommerce.route';
import complaints from './complaints.route';
import gateways from './gateways.route';
import rbacMeta from './rbac-meta.route';
import users from './users.route';
import promotions from './promotions.route';


const router = Router();

router.use(auth);
router.use('/customers', customers);
router.use('/invoices', invoices);
router.use('/plans', plans);
router.use('/staff', staff);
router.use('/setup', setup);
router.use('/payments', payments);
router.use('/tickets', tickets);
router.use('/roles', roles);
router.use('/rbac', rbacMeta);
router.use('/notification-templates', notificationTemplates);
router.use('/export-jobs', exportJobs);
router.use('/credit-notes', creditNotes);
router.use('/dashboard', dashboard);
router.use('/apartments', apartments);
router.use('/audit', audit);
router.use('/work-orders', workOrders);
router.use('/analytics', analytics);
router.use('/coupons', coupons);
router.use('/ecommerce', ecommerce);
router.use('/complaints', complaints);
router.use('/gateways', gateways);
router.use('/promotions', promotions);
router.use('/users', users);


export default router;
