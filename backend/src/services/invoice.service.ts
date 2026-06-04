import { Invoice } from '../types';
import { InvoiceModel } from '../models/invoice.model';
import mongoose from '../config/database';

export class InvoiceService {
  async list(): Promise<Invoice[]> {
    if (mongoose.connection.readyState !== 1) return [];
    return (await InvoiceModel.find().lean()) as unknown as Invoice[];
  }

  async get(id: string): Promise<Invoice | undefined> {
    if (mongoose.connection.readyState !== 1) return undefined;
    return (await InvoiceModel.findOne({ id }).lean()) as unknown as Invoice | undefined;
  }

  async create(payload: Record<string, unknown>) {
    return InvoiceModel.create(payload);
  }

  async update(id: string, payload: Record<string, unknown>) {
    return InvoiceModel.findOneAndUpdate({ id }, payload, { new: true }).lean();
  }

  async remove(id: string) {
    return InvoiceModel.deleteOne({ id });
  }
}

export const invoiceService = new InvoiceService();
