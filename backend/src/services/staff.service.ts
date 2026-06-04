import { Staff } from '../types';
import { StaffModel } from '../models/staff.model';
import mongoose from '../config/database';
import { calculateAttendance } from '../utils';

export class StaffService {
  async list(): Promise<Staff[]> {
    if (mongoose.connection.readyState !== 1) return [];
    const staff = await StaffModel.find().lean();
    return staff.map((s: any) => {
      const { hours, attendanceState } = calculateAttendance(s.shift, s.clockIn, s.clockOut);
      return {
        ...s,
        hours,
        attendanceState,
      };
    }) as unknown as Staff[];
  }

  async get(id: string): Promise<Staff | undefined> {
    if (mongoose.connection.readyState !== 1) return undefined;
    const s = (await StaffModel.findOne({ id }).lean()) as any;
    if (!s) return undefined;
    const { hours, attendanceState } = calculateAttendance(s.shift, s.clockIn, s.clockOut);
    return {
      ...s,
      hours,
      attendanceState,
    } as unknown as Staff;
  }

  async create(payload: Record<string, unknown>) {
    const { hours, attendanceState } = calculateAttendance(
      payload.shift as string,
      payload.clockIn as string,
      payload.clockOut as string
    );
    payload.hours = hours;
    payload.attendanceState = attendanceState;

    return StaffModel.create(payload);
  }

  async update(id: string, payload: Record<string, unknown>) {
    const existing = await StaffModel.findOne({ id }).lean() as any;
    if (existing) {
      const merged = { ...existing, ...payload };
      const { hours, attendanceState } = calculateAttendance(
        merged.shift as string,
        merged.clockIn as string,
        merged.clockOut as string
      );
      payload.hours = hours;
      payload.attendanceState = attendanceState;
    }

    return StaffModel.findOneAndUpdate({ id }, payload, { new: true }).lean();
  }

  async remove(id: string) {
    return StaffModel.deleteOne({ id });
  }
}

export const staffService = new StaffService();
