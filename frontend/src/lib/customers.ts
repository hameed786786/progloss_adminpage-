export type Customer = {
  id: string;
  name?: string;
  status?: string;
  since?: string;
  ltv?: number;
};

export function parseSince(since?: string): Date | null {
  if (!since) return null;
  const asDate = Date.parse(String(since));
  if (!Number.isNaN(asDate)) return new Date(asDate);
  const tryMonth = Date.parse(`1 ${since}`);
  if (!Number.isNaN(tryMonth)) return new Date(tryMonth);
  return null;
}

export function computeCustomerBuckets(customers: Customer[]) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const counts = {
    lead: 0,
    trial: 0,
    active: 0,
    loyal: 0,
    'churn-risk': 0,
    churned: 0,
  } as Record<string, number>;

  const buckets: Record<string, Customer[]> = { lead: [], trial: [], active: [], loyal: [], 'churn-risk': [], churned: [] };

  let newThisMonth = 0;
  let churnedThisMonth = 0;
  let ltvSum = 0;

  for (const c of customers) {
    const statusRaw = (c.status ?? '').toString().toLowerCase().trim();
    const sinceDate = parseSince(c.since);
    const tenureDays = sinceDate ? Math.floor((Date.now() - sinceDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    // new this month
    if (sinceDate && sinceDate >= monthStart) newThisMonth++;

    // churned this month if status is cancelled/churned and since in month
    if ((statusRaw === 'cancelled' || statusRaw === 'cancel' || statusRaw === 'churned') && (sinceDate ? sinceDate >= monthStart : true)) churnedThisMonth++;

    // LTV
    ltvSum += Number(c.ltv || 0);

    // Classification: explicit status authoritative, otherwise tenure
    if (statusRaw === 'cancelled' || statusRaw === 'cancel' || statusRaw === 'churned') {
      counts.churned++;
      buckets.churned.push(c);
    } else if (statusRaw === 'churn-risk' || statusRaw === 'churn risk') {
      counts['churn-risk']++;
      buckets['churn-risk'].push(c);
    } else if (statusRaw === 'lead' || statusRaw.includes('lead')) {
      counts.lead++;
      buckets.lead.push(c);
    } else if (statusRaw === 'trial' || statusRaw.includes('trial')) {
      counts.trial++;
      buckets.trial.push(c);
    } else if (statusRaw === 'active' || statusRaw === '') {
      if (tenureDays >= 180) {
        counts.loyal++;
        buckets.loyal.push(c);
      } else {
        counts.active++;
        buckets.active.push(c);
      }
    } else {
      // paused or unrecognized statuses: do not count in active/loyal/churn-risk/churned
    }
  }

  const avgLtv = customers.length ? Math.round(ltvSum / customers.length) : 0;

  return {
    counts,
    buckets,
    newThisMonth,
    churnedThisMonth,
    avgLtv,
    total: customers.length,
  };
}

export function computeCustomerBucketsDetailed(customers: Customer[]) {
  const summary = computeCustomerBuckets(customers);
  // build buckets arrays using the same logic for membership
  const buckets: Record<string, Customer[]> = { lead: [], trial: [], active: [], loyal: [], 'churn-risk': [], churned: [] };
  for (const c of customers) {
    const statusRaw = (c.status ?? '').toString().toLowerCase().trim();
    const sinceDate = parseSince(c.since);
    const tenureDays = sinceDate ? Math.floor((Date.now() - sinceDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    if (statusRaw === 'cancelled' || statusRaw === 'cancel' || statusRaw === 'churned') buckets.churned.push(c);
    else if (statusRaw === 'churn-risk' || statusRaw === 'churn risk') buckets['churn-risk'].push(c);
    else if (statusRaw === 'lead' || statusRaw.includes('lead')) buckets.lead.push(c);
    else if (statusRaw === 'trial' || statusRaw.includes('trial')) buckets.trial.push(c);
    else if (statusRaw === 'active' || statusRaw === '') {
      if (tenureDays >= 180) buckets.loyal.push(c);
      else buckets.active.push(c);
    }
  }

  return { ...summary, buckets };
}

export default { parseSince, computeCustomerBuckets };
