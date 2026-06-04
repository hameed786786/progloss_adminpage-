import mongoose, { connect } from '../config/database';
import { ApartmentModel } from '../models/apartment.model';

async function main() {
  try {
    await connect();
    const list = await ApartmentModel.find().lean();
    console.log('APARTMENTS_IN_DB:');
    console.log(JSON.stringify(list, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

void main();
