import { Ticket } from '../types';
import { TicketModel } from '../models/ticket.model';
import mongoose from '../config/database';

export class TicketService {
  async list(): Promise<Ticket[]> {
    if (mongoose.connection.readyState !== 1) return [];
    return (await TicketModel.find().lean()) as unknown as Ticket[];
  }

  async get(id: string): Promise<Ticket | undefined> {
    if (mongoose.connection.readyState !== 1) return undefined;
    return (await TicketModel.findOne({ id }).lean()) as unknown as Ticket | undefined;
  }

  async create(payload: Record<string, unknown>) {
    return TicketModel.create(payload);
  }

  async update(id: string, payload: Record<string, unknown>) {
    return TicketModel.findOneAndUpdate({ id }, payload, { new: true }).lean();
  }

  async remove(id: string) {
    return TicketModel.deleteOne({ id });
  }
}

export const ticketService = new TicketService();
