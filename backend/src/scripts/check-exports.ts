import mongoose from 'mongoose';
import { connect } from '../config/database';
import { ExportJobModel } from '../models/exportJob.model';

async function main() {
  await connect();
  const raw = await ExportJobModel.find().lean();
  console.log('Type of result:', typeof raw);
  console.log('Is array?', Array.isArray(raw));
  console.log('Raw result:', JSON.stringify(raw, null, 2));
  process.exit(0);
}

main().catch(console.error);
