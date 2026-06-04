import { ApiError } from '../common/errors/api-error';
import { CustomerModel } from '../models/customer.model';
import { PlanModel } from '../models/plan.model';
import mongoose from '../config/database';

function calculateNextRenewalDate(since: any, planName: any, status: any): Date | null {
  if (status === 'paused' || status === 'cancelled') return null;
  if (!since) return null;
  const startDate = new Date(since);
  if (isNaN(startDate.getTime())) return null;

  startDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let freq = 'monthly';
  if (planName) {
    const pName = String(planName);
    if (pName.includes('Weekly') && !pName.includes('Bi-weekly')) {
      freq = 'weekly';
    } else if (pName.includes('Bi-weekly')) {
      freq = 'bi-weekly';
    }
  }

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

  return nextRenewalDate;
}

export class CustomerService {
  async list() {
    const customers = await CustomerModel.find().sort({ id: 1 }).lean();
    const plans = await PlanModel.find().lean();
    return customers.map((c: any) => {
      const matchedPlan = plans.find(p => p.name === c.plan || p.id === c.plan);
      const mrr = matchedPlan ? matchedPlan.price : 260;
      return {
        ...c,
        subscriptionId: c.id ? c.id.replace('CUS-', 'SUB-') : undefined,
        mrr,
      };
    });
  }

  async get(id: string) {
    if (mongoose.connection.readyState !== 1) return undefined;
    const customer = await CustomerModel.findOne({ id }).lean() as any;
    if (!customer) throw new ApiError(404, 'Customer not found', 'CUSTOMER_NOT_FOUND');
    const plans = await PlanModel.find().lean();
    const matchedPlan = plans.find(p => p.name === customer.plan || p.id === customer.plan);
    const mrr = matchedPlan ? matchedPlan.price : 260;
    return {
      ...customer,
      subscriptionId: customer.id ? customer.id.replace('CUS-', 'SUB-') : undefined,
      mrr,
    };
  }

  create(payload: Record<string, any>) {
    if (payload.since && payload.nextRenewal === undefined) {
      payload.nextRenewal = calculateNextRenewalDate(payload.since, payload.plan, payload.status);
    }
    return CustomerModel.create(payload);
  }

  async update(id: string, payload: Record<string, any>) {
    const existing = await CustomerModel.findOne({ id }).lean() as any;
    if (existing) {
      const since = payload.since !== undefined ? payload.since : existing.since;
      const plan = payload.plan !== undefined ? payload.plan : existing.plan;
      const status = payload.status !== undefined ? payload.status : existing.status;
      if (payload.nextRenewal === undefined) {
        payload.nextRenewal = calculateNextRenewalDate(since, plan, status);
      }
    }
    const updated = await CustomerModel.findOneAndUpdate({ id }, payload, { new: true }).lean();
    if (!updated) throw new ApiError(404, 'Customer not found', 'CUSTOMER_NOT_FOUND');
    return updated;
  }

  async remove(id: string) {
    const result = await CustomerModel.deleteOne({ id });
    if (result.deletedCount === 0) throw new ApiError(404, 'Customer not found', 'CUSTOMER_NOT_FOUND');
    return result;
  }
}

export const customerService = new CustomerService();
