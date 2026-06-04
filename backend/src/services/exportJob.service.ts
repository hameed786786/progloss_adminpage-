import { ExportJob } from '../types';
import { ExportJobModel } from '../models/exportJob.model';
import mongoose from '../config/database';

export class ExportJobService {
  async list(): Promise<ExportJob[]> {
    if (mongoose.connection.readyState !== 1) return [];
    return (await ExportJobModel.find().lean()) as unknown as ExportJob[];
  }

  async get(id: string): Promise<ExportJob | undefined> {
    if (mongoose.connection.readyState !== 1) return undefined;
    return (await ExportJobModel.findOne({ id }).lean()) as unknown as ExportJob | undefined;
  }

  async create(payload: Record<string, unknown>) {
    return ExportJobModel.create(payload);
  }

  async update(id: string, payload: Record<string, unknown>) {
    return ExportJobModel.findOneAndUpdate({ id }, payload, { new: true }).lean();
  }

  async remove(id: string) {
    return ExportJobModel.deleteOne({ id });
  }
}

export const exportJobService = new ExportJobService();
