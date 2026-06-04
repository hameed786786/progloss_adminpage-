import { connect } from '../config/database';
import { exportJobService } from '../services/exportJob.service';

async function main() {
  await connect();
  const listResult = await exportJobService.list();
  console.log('Result from exportJobService.list():');
  console.log('Type:', typeof listResult);
  console.log('Is array?', Array.isArray(listResult));
  console.log('Value:', JSON.stringify(listResult, null, 2));
  process.exit(0);
}

main().catch(console.error);
