import { Router } from "express";
import * as customers from '../controllers/customers.controller';
// data.service no longer used at top-level routes; domain services used instead
import { customerService } from '../services/customer.service';
import { invoiceService } from '../services/invoice.service';
import { planService } from '../services/plan.service';
import { staffService } from '../services/staff.service';
import { paymentService } from '../services/payment.service';
import { ticketService } from '../services/ticket.service';
import { notificationTemplateService } from '../services/notificationTemplate.service';
import { exportJobService } from '../services/exportJob.service';
import { creditNoteService } from '../services/creditNote.service';
import * as auth from '../controllers/auth.controller';
import * as rolesCtrl from '../controllers/roles.controller';
import * as invoicesCtrl from '../controllers/invoices.controller';
import * as paymentsCtrl from '../controllers/payments.controller';
import * as ticketsCtrl from '../controllers/tickets.controller';
import * as staffCtrl from '../controllers/staff.controller';
import * as notificationsCtrl from '../controllers/notification-templates.controller';
import * as exportJobsCtrl from '../controllers/export-jobs.controller';
import * as creditNotesCtrl from '../controllers/credit-notes.controller';
import * as usersCtrl from '../controllers/users.controller';
import vehiclesRoute from './vehicles.route';
import { authenticate, requireRole } from "../middleware/auth.middleware";
import { requirePermission } from '../middleware/requirePermissions.middleware';
import { UserModel } from '../models/user.model';
import { sendSuccess, sendError } from '../utils';

const router = Router();

// Auth
router.post('/auth/login', auth.login);
router.post('/auth/refresh', auth.refresh);

// User Profile
router.get('/users/me', authenticate, usersCtrl.getMe);
router.put('/users/me/dismissed-notifications', authenticate, usersCtrl.updateDismissedNotifications);

// Customers
router.get("/customers", authenticate, requirePermission('Customers', 'Read'), async (req, res) => {
  const data = await customerService.list();
  return sendSuccess(res, data);
});
router.get("/customers/:id", authenticate, requirePermission('Customers', 'Read'), async (req, res) => {
  const c = await customerService.get(req.params.id);
  if (!c) return sendError(res, 'Customer not found', undefined, 404);
  return sendSuccess(res, c);
});

// Customer write endpoints (protected)
router.post('/customers', authenticate, requirePermission('Customers', 'Create'), customers.create);
router.put('/customers/:id', authenticate, requirePermission('Customers', 'Update'), customers.update);
router.delete('/customers/:id', authenticate, requirePermission('Customers', 'Delete'), customers.remove);

// Invoices
router.get("/invoices", authenticate, requirePermission('Billing & VAT', 'Read'), async (req, res) => sendSuccess(res, await invoiceService.list()));
router.get("/invoices/:id", authenticate, requirePermission('Billing & VAT', 'Read'), async (req, res) => {
  const i = await invoiceService.get(req.params.id);
  if (!i) return sendError(res, 'Invoice not found', undefined, 404);
  return sendSuccess(res, i);
});

// Plans
router.get("/plans", authenticate, requirePermission('Subscriptions', 'Read'), async (req, res) => sendSuccess(res, await planService.list()));

// Invoice write endpoints
router.post('/invoices', authenticate, requirePermission('Billing & VAT', 'Create'), invoicesCtrl.create);
router.put('/invoices/:id', authenticate, requirePermission('Billing & VAT', 'Update'), invoicesCtrl.update);
router.delete('/invoices/:id', authenticate, requirePermission('Billing & VAT', 'Delete'), invoicesCtrl.remove);

// Staff
router.get("/staff", authenticate, requirePermission('Staff', 'Read'), async (req, res) => sendSuccess(res, await staffService.list()));
// Staff write endpoints
router.post('/staff', authenticate, requirePermission('Staff', 'Create'), staffCtrl.create);
router.put('/staff/:id', authenticate, requirePermission('Staff', 'Update'), staffCtrl.update);
router.delete('/staff/:id', authenticate, requirePermission('Staff', 'Delete'), staffCtrl.remove);

// Roles / permissions
router.get('/roles', authenticate, requirePermission('RBAC', 'Read'), rolesCtrl.listRoles);
router.post('/roles', authenticate, requirePermission('RBAC', 'Create'), rolesCtrl.createRole);
router.delete('/roles/:name', authenticate, requirePermission('RBAC', 'Delete'), rolesCtrl.deleteRole);
router.get('/roles/:name/permissions', authenticate, requirePermission('RBAC', 'Read'), rolesCtrl.getPermissions);
router.put('/roles/:name/permissions', authenticate, requirePermission('RBAC', 'Update'), rolesCtrl.setPermissions);

// Payments
router.get("/payments", authenticate, requirePermission('Payments', 'Read'), async (req, res) => sendSuccess(res, await paymentService.list()));
// Payments write endpoints
router.post('/payments', authenticate, requirePermission('Payments', 'Create'), paymentsCtrl.create);
router.put('/payments/:id', authenticate, requirePermission('Payments', 'Update'), paymentsCtrl.update);
router.delete('/payments/:id', authenticate, requirePermission('Payments', 'Delete'), paymentsCtrl.remove);

// Tickets
router.get("/tickets", authenticate, requirePermission('Operations', 'Read'), async (req, res) => sendSuccess(res, await ticketService.list()));
// Tickets write endpoints
router.post('/tickets', authenticate, requirePermission('Operations', 'Create'), ticketsCtrl.create);
router.put('/tickets/:id', authenticate, requirePermission('Operations', 'Update'), ticketsCtrl.update);
router.delete('/tickets/:id', authenticate, requirePermission('Operations', 'Delete'), ticketsCtrl.remove);

// Vehicles
router.use("/vehicles", vehiclesRoute);

// Notification templates
router.get('/notification-templates', authenticate, requirePermission('RBAC', 'Read'), async (req, res) => sendSuccess(res, await notificationTemplateService.list()));
router.post('/notification-templates', authenticate, requirePermission('RBAC', 'Create'), notificationsCtrl.create);
router.put('/notification-templates/:id', authenticate, requirePermission('RBAC', 'Update'), notificationsCtrl.update);
router.delete('/notification-templates/:id', authenticate, requirePermission('RBAC', 'Delete'), notificationsCtrl.remove);

// Export jobs
router.get('/export-jobs', authenticate, requirePermission('Audit', 'Read'), async (req, res) => sendSuccess(res, await exportJobService.list()));
router.post('/export-jobs', authenticate, requirePermission('Audit', 'Create'), exportJobsCtrl.create);
router.get('/export-jobs/:id/download', authenticate, requirePermission('Audit', 'Read'), exportJobsCtrl.download);
router.put('/export-jobs/:id', authenticate, requirePermission('Audit', 'Update'), exportJobsCtrl.update);
router.delete('/export-jobs/:id', authenticate, requirePermission('Audit', 'Delete'), exportJobsCtrl.remove);

// Credit notes
router.get('/credit-notes', authenticate, requirePermission('Billing & VAT', 'Read'), async (req, res) => sendSuccess(res, await creditNoteService.list()));
router.post('/credit-notes', authenticate, requirePermission('Billing & VAT', 'Create'), creditNotesCtrl.create);
router.put('/credit-notes/:id', authenticate, requirePermission('Billing & VAT', 'Update'), creditNotesCtrl.update);
router.delete('/credit-notes/:id', authenticate, requirePermission('Billing & VAT', 'Delete'), creditNotesCtrl.remove);

// Setup helper - small endpoint used by frontend to check initial state
router.get('/setup', async (req, res) => {
  try {
    const usersCount = await UserModel.countDocuments({});
    return sendSuccess(res, { usersCount });
  } catch (err) {
    return sendError(res, 'Failed to read setup state', (err as Error).message, 500);
  }
});

export default router;
