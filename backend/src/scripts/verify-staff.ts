import mongoose from 'mongoose';
import { connect } from '../config/database';
import { StaffModel } from '../models/staff.model';

async function main() {
  await connect();
  const staff = await StaffModel.find().lean();
  console.log(JSON.stringify(staff, null, 2));
  process.exit(0);
}

main().catch(console.error);
