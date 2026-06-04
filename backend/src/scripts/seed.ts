import bcrypt from 'bcrypt';
import mongoose, { connect } from '../config/database';
import { UserModel } from '../models/user.model';
import { CustomerModel } from '../models/customer.model';
import { InvoiceModel } from '../models/invoice.model';
import { StaffModel } from '../models/staff.model';
import { calculateAttendance } from '../utils';
import { TicketModel } from '../models/ticket.model';
import { PlanModel } from '../models/plan.model';
import { PaymentModel } from '../models/payment.model';
import { RoleModel } from '../models/role.model';
import { ApartmentModel } from '../models/apartment.model';
import { AuditLogModel } from '../models/auditLog.model';
import { WorkOrderModel } from '../models/workOrder.model';
import { AnalyticsSnapshotModel } from '../models/analyticsSnapshot.model';
import { CreditNoteModel } from '../models/creditNote.model';
import { NotificationTemplateModel } from '../models/notificationTemplate.model';
import { ExportJobModel } from '../models/exportJob.model';
import { CouponModel } from '../models/coupon.model';
import { EcommerceProductModel } from '../models/ecommerceProduct.model';
import { EcommerceOrderModel } from '../models/ecommerceOrder.model';
import { ComplaintModel } from '../models/complaint.model';
import { GatewayModel, GatewayEventModel } from '../models/gateway.model';
import { PromotionModel } from '../models/promotion.model';
import { VehicleModel } from '../models/vehicle.model';

import {
  CUSTOMERS,
  INVOICES,
  STAFF,
  TICKETS,
  PLANS,
  APARTMENTS,
  REVENUE_TREND,
  COMPLAINT_TREND,
  SUBSCRIPTION_GROWTH,
  PAYMENTS,
  AUDIT,
  ROLES,
  PERM_MATRIX,
  DISPATCH_QUEUE,
  CREDIT_NOTES,
  NOTIFICATION_TEMPLATES,
  EXPORT_JOBS,
  COUPONS,
  ECOMMERCE_PRODUCTS,
  ECOMMERCE_ORDERS,
  COMPLAINTS,
  GATEWAYS,
  GATEWAY_EVENTS,
  PROMOTIONS,
} from '../data/seed-data';

const ADMIN_ROLE = 'Super Admin';
const DEFAULT_ADMIN_EMAIL = 'admin786@gmail.com';
const DEFAULT_ADMIN_PASSWORD = 'admin786';

async function upsertMany<T extends Record<string, unknown>>(
  model: { deleteMany: (filter: object) => Promise<unknown>; insertMany: (docs: T[]) => Promise<unknown> },
  docs: T[],
) {
  if (docs.length === 0) return;
  await model.deleteMany({});
  await model.insertMany(docs);
}

async function main() {
  const email = (process.env.ADMIN_EMAIL?.trim() || DEFAULT_ADMIN_EMAIL).toLowerCase();
  const password = process.env.ADMIN_PASSWORD?.trim() || DEFAULT_ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || 'Super Admin';

  await connect();

  const passwordHash = await bcrypt.hash(password, 12);
  await UserModel.findOneAndUpdate(
    { email },
    { email, name, passwordHash, role: ADMIN_ROLE },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  const customersToSeed = CUSTOMERS.map(c => {
    let freq = 'monthly';
    const planName = c.plan;
    if (planName.includes('Weekly') && !planName.includes('Bi-weekly')) {
      freq = 'weekly';
    } else if (planName.includes('Bi-weekly')) {
      freq = 'bi-weekly';
    }

    let startDate = new Date(c.since);
    const today = new Date();
    // Shift specific customers to current month to show dynamic MTD KPIs
    if (c.id === 'CUS-10425') { // Priya Nair (active)
      startDate = new Date(today.getTime() - 3 * 24 * 3600 * 1000);
    } else if (c.id === 'CUS-10427') { // Aisha Mubarak (active)
      startDate = new Date(today.getTime() - 2 * 24 * 3600 * 1000);
    } else if (c.id === 'CUS-10428') { // Tom Pereira (cancelled)
      startDate = new Date(today.getTime() - 1 * 24 * 3600 * 1000);
    }
    let nextRenewal: Date | null = null;
    if (c.status !== 'paused' && c.status !== 'cancelled' && !isNaN(startDate.getTime())) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextRenewalDate = new Date(startDate.getTime());
      let limit = 0;
      if (freq === 'weekly') {
        while (nextRenewalDate < today && limit < 1000) {
          nextRenewalDate.setDate(nextRenewalDate.getDate() + 7);
          limit++;
        }
      } else if (freq === 'bi-weekly') {
        while (nextRenewalDate < today && limit < 1000) {
          nextRenewalDate.setDate(nextRenewalDate.getDate() + 14);
          limit++;
        }
      } else {
        while (nextRenewalDate < today && limit < 1000) {
          nextRenewalDate.setMonth(nextRenewalDate.getMonth() + 1);
          limit++;
        }
      }
      nextRenewal = nextRenewalDate;
    }

    return {
      ...c,
      since: startDate,
      nextRenewal
    };
  });

  await upsertMany(CustomerModel, customersToSeed);

  // Seed vehicles dynamically based on customer accounts
  const customersInDb = await CustomerModel.find().lean();
  const vehiclesToSeed = [];
  let ci = 0;
  for (const c of customersInDb) {
    const numVehicles = c.vehicles || 0;
    for (let i = 0; i < numVehicles; i++) {
      vehiclesToSeed.push({
        plate: `${["P","R","Q","T","S","O","M","N"][(ci+i)%8]}-${10+ci*7+i}-${30000+ci*1100+i*173}`,
        make: ["Range Rover","Lexus LX","Audi Q8","Mercedes G","BMW X5","Tesla Model Y","Porsche Cayenne"][(ci+i)%7],
        color: ["Obsidian Black","Pearl White","Silver","Midnight Blue","Champagne"][(ci+i)%5],
        customer: c._id,
        community: c.community,
        plan: c.plan,
        lastWash: new Date(Date.now() - (ci + i) * 24 * 3600 * 1000),
        status: i === 0 ? "active" : (i % 3 === 0 ? "queued" : "active"),
      });
    }
    ci++;
  }
  await VehicleModel.deleteMany({});
  await VehicleModel.insertMany(vehiclesToSeed);

  await upsertMany(InvoiceModel, INVOICES);
  const computedStaff = STAFF.map(s => {
    const { hours, attendanceState } = calculateAttendance(s.shift, s.clockIn, s.clockOut);
    return {
      ...s,
      hours,
      attendanceState,
    };
  });
  await upsertMany(StaffModel, computedStaff);
  await upsertMany(TicketModel, TICKETS);
  await upsertMany(PlanModel, PLANS);
  await upsertMany(PaymentModel, PAYMENTS.map(p => ({ ...p, createdAt: new Date(), updatedAt: new Date() })));
  await upsertMany(ApartmentModel, APARTMENTS);
  await upsertMany(WorkOrderModel, DISPATCH_QUEUE);
  await upsertMany(CreditNoteModel, CREDIT_NOTES);
  await upsertMany(NotificationTemplateModel, NOTIFICATION_TEMPLATES);
  await upsertMany(ExportJobModel, EXPORT_JOBS);
  await upsertMany(CouponModel, COUPONS);
  await upsertMany(EcommerceProductModel, ECOMMERCE_PRODUCTS);
  await upsertMany(EcommerceOrderModel, ECOMMERCE_ORDERS);
  await upsertMany(ComplaintModel, COMPLAINTS);
  await upsertMany(GatewayModel, GATEWAYS);
  await upsertMany(GatewayEventModel, GATEWAY_EVENTS);
  await upsertMany(PromotionModel, PROMOTIONS);

  await AuditLogModel.deleteMany({});
  await AuditLogModel.insertMany(AUDIT);

  await RoleModel.deleteMany({});
  await RoleModel.insertMany(
    ROLES.map((role) => ({
      id: role.id,
      name: role.name,
      desc: role.desc,
      color: role.color,
      userCount: role.users,
      matrix: PERM_MATRIX[role.name] ?? {},
    })),
  );

  await AnalyticsSnapshotModel.deleteMany({});
  await AnalyticsSnapshotModel.insertMany([
    { key: 'revenueTrend', data: REVENUE_TREND },
    { key: 'subscriptionGrowth', data: SUBSCRIPTION_GROWTH },
    { key: 'complaintTrend', data: COMPLAINT_TREND },
  ]);

  console.log(
    JSON.stringify(
      {
        success: true,
        message: 'Database seeded successfully',
        collections: {
          customers: CUSTOMERS.length,
          invoices: INVOICES.length,
          staff: STAFF.length,
          tickets: TICKETS.length,
          plans: PLANS.length,
          apartments: APARTMENTS.length,
          workOrders: DISPATCH_QUEUE.length,
          roles: ROLES.length,
        },
        admin: { email, role: ADMIN_ROLE },
      },
      null,
      2,
    ),
  );

  process.exit(0);
}

void main().catch((error) => {
  console.error('Seed failed');
  console.error(error);
  process.exit(1);
}).finally(() => mongoose.disconnect().catch(() => undefined));
