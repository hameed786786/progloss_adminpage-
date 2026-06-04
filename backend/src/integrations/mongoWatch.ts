import mongoose from '../config/database';
import { emit } from './socket';
import { CustomerModel } from '../models/customer.model';
import { StaffModel } from '../models/staff.model';
import { TicketModel } from '../models/ticket.model';
import { RoleModel } from '../models/role.model';
import { NotificationTemplateModel } from '../models/notificationTemplate.model';
import { InvoiceModel } from '../models/invoice.model';
import { PlanModel } from '../models/plan.model';
import { PaymentModel } from '../models/payment.model';
import { ExportJobModel } from '../models/exportJob.model';
import { CreditNoteModel } from '../models/creditNote.model';
import { CouponModel } from '../models/coupon.model';

function docIdString(id: any) {
  try { return id.toString(); } catch { return id; }
}

async function watchModel(model: any, channelName: string) {
  try {
    const changeStream = model.watch([], { fullDocument: 'updateLookup' });
    changeStream.on('change', async (change: any) => {
      const op = change.operationType;
      if (op === 'insert' || op === 'replace' || op === 'update') {
        const doc = change.fullDocument;
        // emit single document
        emit(`${channelName}:update`, doc);
      } else if (op === 'delete') {
        const id = docIdString(change.documentKey?._id);
        emit(`${channelName}:update`, { id });
      }
    });
  } catch (err) {
    // ignore if watching not supported
    const error = err as { message?: string };
    console.warn('watch not available for', channelName, error?.message ?? err);
  }
}

import { ApartmentModel } from '../models/apartment.model';
import { WorkOrderModel } from '../models/workOrder.model';
import { AuditLogModel } from '../models/auditLog.model';

export async function initMongoWatches() {
  if (mongoose.connection.readyState !== 1) return;
  await Promise.all([
    watchModel(CustomerModel, 'customers'),
    watchModel(StaffModel, 'staff'),
    watchModel(InvoiceModel, 'invoices'),
    watchModel(PlanModel, 'plans'),
    watchModel(PaymentModel, 'payments'),
    watchModel(TicketModel, 'tickets'),
    watchModel(RoleModel, 'roles'),
    watchModel(NotificationTemplateModel, 'notificationTemplates'),
    watchModel(ExportJobModel, 'exportJobs'),
    watchModel(CreditNoteModel, 'creditNotes'),
    watchModel(CouponModel, 'coupons'),
    watchModel(ApartmentModel, 'apartments'),
    watchModel(WorkOrderModel, 'workOrders'),
    watchModel(AuditLogModel, 'audit'),
    // additional models for realtime stats/visualizations
    watchModel(require('../models/analyticsSnapshot.model').AnalyticsSnapshotModel, 'analytics'),
    watchModel(require('../models/complaint.model').ComplaintModel, 'complaints'),
    watchModel(require('../models/ecommerceProduct.model').EcommerceProductModel, 'ecommerceProducts'),
    watchModel(require('../models/ecommerceOrder.model').EcommerceOrderModel, 'ecommerceOrders'),
    watchModel(require('../models/gateway.model').GatewayModel, 'gateways'),
    watchModel(require('../models/gateway.model').GatewayEventModel, 'gatewayEvents'),
    watchModel(require('../models/vehicle.model').VehicleModel, 'vehicles'),
  ]).catch(() => undefined);
}
