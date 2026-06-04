import mongoose, { Schema } from 'mongoose';
import { calculateAttendance } from '../utils';

const StaffSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  role: { type: String },
  zone: { type: String },
  status: { type: String },
  building: { type: String },
  plate: { type: String },
  shift: { type: String },
  eta: { type: String },
  clockIn: { type: String },
  clockOut: { type: String },
  hours: { type: String },
  attendanceState: { type: String }
});

StaffSchema.pre('save', function (this: any, next) {
  const { hours, attendanceState } = calculateAttendance(this.shift, this.clockIn, this.clockOut);
  this.hours = hours;
  this.attendanceState = attendanceState;
  next();
});

StaffSchema.pre('findOneAndUpdate', async function (this: any, next) {
  const update = this.getUpdate() as any;
  if (update) {
    const query = this.getQuery();
    const doc = await this.model.findOne(query).lean() as any;
    if (doc) {
      const shift = update.shift !== undefined ? update.shift : (update.$set?.shift !== undefined ? update.$set.shift : doc.shift);
      const clockIn = update.clockIn !== undefined ? update.clockIn : (update.$set?.clockIn !== undefined ? update.$set.clockIn : doc.clockIn);
      const clockOut = update.clockOut !== undefined ? update.clockOut : (update.$set?.clockOut !== undefined ? update.$set.clockOut : doc.clockOut);
      const { hours, attendanceState } = calculateAttendance(shift, clockIn, clockOut);

      if (update.$set) {
        update.$set.hours = hours;
        update.$set.attendanceState = attendanceState;
      } else {
        update.hours = hours;
        update.attendanceState = attendanceState;
      }
    }
  }
  next();
});

export const StaffModel = mongoose.models.Staff || mongoose.model('Staff', StaffSchema);

