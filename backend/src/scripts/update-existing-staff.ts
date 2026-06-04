import mongoose from 'mongoose';
import { connect } from '../config/database';
import { StaffModel } from '../models/staff.model';
import { calculateAttendance } from '../utils';

async function main() {
  await connect();
  
  const staffMembers = await StaffModel.find();
  console.log(`Found ${staffMembers.length} staff members in database.`);
  
  let updatedCount = 0;
  for (const s of staffMembers) {
    const { hours, attendanceState } = calculateAttendance(s.shift, s.clockIn, s.clockOut);
    
    // Check if the values are different before updating
    if (s.hours !== hours || s.attendanceState !== attendanceState) {
      s.hours = hours;
      s.attendanceState = attendanceState;
      await s.save();
      console.log(`Updated Staff ${s.id} (${s.name}): hours=${hours}, state=${attendanceState}`);
      updatedCount++;
    }
  }
  
  console.log(`Migration complete. Updated ${updatedCount} staff members.`);
  process.exit(0);
}

main().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
