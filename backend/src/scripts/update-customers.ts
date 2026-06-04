import mongoose, { connect } from '../config/database';
import { CustomerModel } from '../models/customer.model';
import { CUSTOMERS } from '../data/seed-data';

function calculateNextRenewalDate(sinceDate: Date, planName: string, status: string): Date | null {
  if (status === 'paused' || status === 'cancelled') return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextRenewalDate = new Date(sinceDate.getTime());
  
  let freq = 'monthly';
  if (planName.includes('Weekly') && !planName.includes('Bi-weekly')) {
    freq = 'weekly';
  } else if (planName.includes('Bi-weekly')) {
    freq = 'bi-weekly';
  }

  let limit = 0;
  if (freq === 'weekly') {
    while (nextRenewalDate < today && limit < 1000) {
      nextRenewalDate.setDate(nextRenewalDate.getDate() + 7);
      limit++;
    }
  } else if (freq === 'bi-weekly') {
    while (nextRenewalDate < today && limit < 1000) {
      nextRenewalDate.setDate(nextRenewalDate.getDate() + 14);
      limit++;
    }
  } else {
    while (nextRenewalDate < today && limit < 1000) {
      nextRenewalDate.setMonth(nextRenewalDate.getMonth() + 1);
      limit++;
    }
  }

  return nextRenewalDate;
}

async function main() {
  await connect();
  console.log('Connected to database to seed customers only...');

  await CustomerModel.deleteMany({});
  
  const customersToSeed = CUSTOMERS.map(c => {
    let startDate = new Date(c.since);
    const today = new Date();
    // Shift specific customers to current month to show dynamic MTD KPIs
    if (c.id === 'CUS-10425') { // Priya Nair (active)
      startDate = new Date(today.getTime() - 3 * 24 * 3600 * 1000);
    } else if (c.id === 'CUS-10427') { // Aisha Mubarak (active)
      startDate = new Date(today.getTime() - 2 * 24 * 3600 * 1000);
    } else if (c.id === 'CUS-10428') { // Tom Pereira (cancelled)
      startDate = new Date(today.getTime() - 1 * 24 * 3600 * 1000);
    }
    const nextRenewal = calculateNextRenewalDate(startDate, c.plan, c.status);
    return {
      ...c,
      since: startDate,
      nextRenewal
    };
  });

  await CustomerModel.insertMany(customersToSeed);
  console.log(`Successfully seeded ${customersToSeed.length} customers with logically correct since and nextRenewal dates.`);
  
  process.exit(0);
}

void main().catch(err => {
  console.error('Failed to seed customers:', err);
  process.exit(1);
}).finally(() => mongoose.disconnect().catch(() => undefined));
