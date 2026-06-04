import { CreditNote } from '../types';
import { CreditNoteModel } from '../models/creditNote.model';
import mongoose from '../config/database';

export class CreditNoteService {
  async list(): Promise<CreditNote[]> {
    if (mongoose.connection.readyState !== 1) return [];
    return (await CreditNoteModel.find().lean()) as unknown as CreditNote[];
  }

  async get(id: string): Promise<CreditNote | undefined> {
    if (mongoose.connection.readyState !== 1) return undefined;
    return (await CreditNoteModel.findOne({ id }).lean()) as unknown as CreditNote | undefined;
  }

  async create(payload: Record<string, unknown>) {
    return CreditNoteModel.create(payload);
  }

  async update(id: string, payload: Record<string, unknown>) {
    return CreditNoteModel.findOneAndUpdate({ id }, payload, { new: true }).lean();
  }

  async remove(id: string) {
    return CreditNoteModel.deleteOne({ id });
  }
}

export const creditNoteService = new CreditNoteService();
