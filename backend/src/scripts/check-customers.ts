import mongoose, { connect } from '../config/database';
import { CustomerModel } from '../models/customer.model';

async function main() {
  await connect();
  const customers = await CustomerModel.find().lean();
  console.log(JSON.stringify(customers, null, 2));
  process.exit(0);
}

main().catch(console.error);
