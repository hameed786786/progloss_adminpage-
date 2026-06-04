import mongoose from 'mongoose';
import { StaffModel } from '../models/staff.model';

async function main() {
  const localUrl = 'mongodb://localhost:27017/progloss';
  console.log(`Connecting to local DB: ${localUrl}`);
  try {
    await mongoose.connect(localUrl, { serverSelectionTimeoutMS: 2000 });
    console.log('Connected to local MongoDB.');
    const staff = await StaffModel.find().lean();
    console.log(`Found ${staff.length} staff members in local DB.`);
    if (staff.length > 0) {
      console.log('Sample staff:', JSON.stringify(staff.slice(0, 2), null, 2));
    }
  } catch (err: any) {
    console.log('Failed to connect to local MongoDB:', err.message);
  }
  process.exit(0);
}

main();
