import { Plan } from '../types';
import { PlanModel } from '../models/plan.model';
import { CustomerModel } from '../models/customer.model';
import mongoose from '../config/database';

export class PlanService {
  /**
   * List all plans with live `active` counts computed from CustomerModel.
   * The `active` field is dynamically calculated by counting customers
   * whose `plan` matches the plan name and whose `status` is 'active'.
   */
  async list(): Promise<Plan[]> {
    if (mongoose.connection.readyState !== 1) return [];

    const [plans, activeCounts] = await Promise.all([
      PlanModel.find().lean(),
      CustomerModel.aggregate<{ _id: string; count: number }>([
        { $match: { status: 'active' } },
        { $group: { _id: '$plan', count: { $sum: 1 } } },
      ]),
    ]);

    const countMap = Object.fromEntries(activeCounts.map(r => [r._id, r.count]));

    return plans.map((p: any) => ({
      ...p,
      active: countMap[p.name] ?? 0,
    })) as unknown as Plan[];
  }

  async get(id: string): Promise<Plan | undefined> {
    if (mongoose.connection.readyState !== 1) return undefined;
    return (await PlanModel.findOne({ id }).lean()) as unknown as Plan | undefined;
  }

  async create(payload: Record<string, unknown>) {
    return PlanModel.create(payload);
  }

  async update(id: string, payload: Record<string, unknown>) {
    return PlanModel.findOneAndUpdate({ id }, payload, { new: true }).lean();
  }

  async remove(id: string) {
    return PlanModel.deleteOne({ id });
  }
}

export const planService = new PlanService();
