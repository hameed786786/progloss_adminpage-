import { NotificationTemplate } from '../types';
import { NotificationTemplateModel } from '../models/notificationTemplate.model';
import mongoose from '../config/database';

export class NotificationTemplateService {
  async list(): Promise<NotificationTemplate[]> {
    if (mongoose.connection.readyState !== 1) return [];
    return (await NotificationTemplateModel.find().lean()) as unknown as NotificationTemplate[];
  }

  async get(id: string): Promise<NotificationTemplate | undefined> {
    if (mongoose.connection.readyState !== 1) return undefined;
    return (await NotificationTemplateModel.findOne({ id }).lean()) as unknown as NotificationTemplate | undefined;
  }

  async create(payload: Record<string, unknown>) {
    return NotificationTemplateModel.create(payload);
  }

  async update(id: string, payload: Record<string, unknown>) {
    return NotificationTemplateModel.findOneAndUpdate({ id }, payload, { new: true }).lean();
  }

  async remove(id: string) {
    return NotificationTemplateModel.deleteOne({ id });
  }
}

export const notificationTemplateService = new NotificationTemplateService();
