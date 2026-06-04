import mongoose, { connect } from '../config/database';
import { WorkOrderModel } from '../models/workOrder.model';

async function main() {
  try {
    await connect();
    const workOrders = await WorkOrderModel.find().sort({ id: 1 }).lean();
    console.log(JSON.stringify(workOrders, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('MongoDB connection check failed');
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.disconnect().catch(() => undefined);
  }
}

void main();