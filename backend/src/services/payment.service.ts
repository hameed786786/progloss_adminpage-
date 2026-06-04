import { Payment } from '../types';
import { PaymentModel } from '../models/payment.model';
import mongoose from '../config/database';

export class PaymentService {
  async list(): Promise<Payment[]> {
    if (mongoose.connection.readyState !== 1) return [];
    return (await PaymentModel.find().lean()) as unknown as Payment[];
  }

  async get(id: string): Promise<Payment | undefined> {
    if (mongoose.connection.readyState !== 1) return undefined;
    return (await PaymentModel.findOne({ id }).lean()) as unknown as Payment | undefined;
  }

  async create(payload: Record<string, unknown>) {
    return PaymentModel.create(payload);
  }

  async update(id: string, payload: Record<string, unknown>) {
    return PaymentModel.findOneAndUpdate({ id }, payload, { new: true }).lean();
  }

  async remove(id: string) {
    return PaymentModel.deleteOne({ id });
  }
}

export const paymentService = new PaymentService();
