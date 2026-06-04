import { CustomerModel } from '../models/customer.model';
import { StaffModel } from '../models/staff.model';
import { TicketModel } from '../models/ticket.model';
import { PaymentModel } from '../models/payment.model';
import { PlanModel } from '../models/plan.model';
import { ApartmentModel } from '../models/apartment.model';
import { AnalyticsSnapshotModel } from '../models/analyticsSnapshot.model';
import { ComplaintModel } from '../models/complaint.model';
import { WorkOrderModel } from '../models/workOrder.model';
import { InvoiceModel } from '../models/invoice.model';
import { VehicleModel } from '../models/vehicle.model';

// ────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Parse loose date strings like "12 May 2026", "Today 11:02", "Jan 2024" into a Date. */
function parseLooseDate(raw?: string | Date): Date | null {
  if (!raw) return null;
  if (raw instanceof Date) return raw;
  const s = String(raw).trim();

  // "Today ..." / "Yesterday ..."
  if (s.toLowerCase().startsWith('today')) {
    return new Date();
  }
  if (s.toLowerCase().startsWith('yesterday')) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  }

  // "12 May 2026" or "08 May 2026"
  const fullDate = new Date(s);
  if (!isNaN(fullDate.getTime())) return fullDate;

  // "May 2026" or "Jan 2024"
  const monthYear = s.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (monthYear) {
    const d = new Date(`${monthYear[1]} 1, ${monthYear[2]}`);
    if (!isNaN(d.getTime())) return d;
  }

  return null;
}

/** Get "YYYY-MM" key from a Date */
function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Get "YYYY-MM-DD" key from a Date */
function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Get ISO-week key "YYYY-Www" */
function weekKey(d: Date): string {
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

// ────────────────────────────────────────────────────────────────
// Service
// ────────────────────────────────────────────────────────────────

export class DashboardService {
  async getOverview(range: string = '12M') {
    const now = new Date();

    const [
      customers,
      staff,
      plans,
      apartments,
      payments,
      invoices,
      workOrders,
      complaints,
      openTickets,
      complaintTrendSnapshot,
      revenueTrendSnapshot,
      subscriptionGrowthSnapshot,
      vehicleCount,
    ] = await Promise.all([
      CustomerModel.find().lean<any[]>(),
      StaffModel.find().lean<any[]>(),
      PlanModel.find().lean<any[]>(),
      ApartmentModel.find().sort({ mrr: -1 }).lean<any[]>(),
      PaymentModel.find().lean<any[]>(),
      InvoiceModel.find().lean<any[]>(),
      WorkOrderModel.find().lean<any[]>(),
      ComplaintModel.find().lean<any[]>(),
      TicketModel.countDocuments({ status: { $in: ['open', 'escalated', 'in-progress'] } }),
      AnalyticsSnapshotModel.findOne({ key: 'complaintTrend' }).lean<any>(),
      AnalyticsSnapshotModel.findOne({ key: 'revenueTrend' }).lean<any>(),
      AnalyticsSnapshotModel.findOne({ key: 'subscriptionGrowth' }).lean<any>(),
      VehicleModel.countDocuments(),
    ]);

    // ═══════════════════════════════════════════════════════════
    //  KPIs — all computed from real DB records
    // ═══════════════════════════════════════════════════════════

    const totalMrr = apartments.reduce((sum: number, a: any) => sum + (a.mrr ?? 0), 0);
    const activeCustomers = customers.filter((c: any) => c.status === 'active');
    const activeCustomerCount = activeCustomers.length;
    const churnRiskCount = customers.filter((c: any) => c.status === 'churn-risk').length;
    const pausedCount = customers.filter((c: any) => c.status === 'paused').length;
    const cancelledCount = customers.filter((c: any) => c.status === 'cancelled').length;
    const totalCustomerCount = customers.length;

    const planActiveCounts: Record<string, number> = {};
    for (const c of customers) {
      if (c.status === 'active' && c.plan) {
        planActiveCounts[c.plan] = (planActiveCounts[c.plan] ?? 0) + 1;
      }
    }
    const plansWithActive = plans.map(p => ({
      ...p,
      active: planActiveCounts[p.name] ?? 0
    }));
    const totalActiveSubscriptions = plansWithActive.reduce((s: number, p: any) => s + (p.active ?? 0), 0);
    const planBreakdown = plansWithActive
      .filter((p: any) => (p.active ?? 0) > 0)
      .map((p: any) => `${p.active} ${p.name.split(' ')[0]}`)
      .join(' · ');

    const openComplaints = complaints.filter((c: any) => c.status && c.status !== 'resolved').length;
    const resolvedComplaints = complaints.filter((c: any) => c.status === 'resolved').length;

    const completedWashes = workOrders.filter((w: any) => w.status === 'completed').length;
    const inProgressWashes = workOrders.filter((w: any) => w.status === 'in-progress').length;
    const carsCleanedToday = completedWashes + inProgressWashes;

    const onlineStaff = staff.filter((s: any) => s.status !== 'Offline');
    const onBreak = staff.filter((s: any) => s.status === 'Break').length;

    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysLaterMidnight = new Date(todayMidnight);
    sevenDaysLaterMidnight.setDate(todayMidnight.getDate() + 7);
    sevenDaysLaterMidnight.setHours(23, 59, 59, 999);

    const renewalsDue = customers.filter((c: any) => {
      if (c.status === 'cancelled' || c.status === 'paused' || !c.nextRenewal) return false;
      const nextRenewal = new Date(c.nextRenewal);
      const renewalMidnight = new Date(nextRenewal.getFullYear(), nextRenewal.getMonth(), nextRenewal.getDate());
      return renewalMidnight <= sevenDaysLaterMidnight;
    }).length;

    const failedPayments = payments.filter((p: any) => p.status === 'failed').length;
    const totalPayments = payments.length;

    const pendingWashes = workOrders.filter((w: any) => w.status === 'queued').length;
    const delayedWashes = workOrders.filter((w: any) => w.status === 'delayed').length;
    const escalatedTickets = await TicketModel.countDocuments({ status: 'escalated' });

    // ═══════════════════════════════════════════════════════════
    //  CHARTS — built from real invoice + customer DB records
    // ═══════════════════════════════════════════════════════════

    // Parse all invoice dates and amounts for revenue charting
    const invoiceRecords = invoices.map((inv: any) => ({
      date: parseLooseDate(inv.date),
      total: inv.total ?? 0,
      status: inv.status,
    })).filter(r => r.date !== null) as { date: Date; total: number; status: string }[];

    // Parse all customer join dates for subscription charting
    const customerRecords = customers.map((c: any) => ({
      date: parseLooseDate(c.since),
      status: c.status,
      plan: c.plan,
    })).filter(r => r.date !== null) as { date: Date; status: string; plan: string }[];

    let trendData: { m: string; mrr: number }[] = [];
    let growthData: { m: string; new: number; churn: number }[] = [];

    if (range === '7D') {
      // ── 7 Day: group invoices by day, customers by day ──
      const buckets: string[] = [];
      const labels: string[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        buckets.push(dayKey(d));
        labels.push(`${DAY_NAMES[d.getDay()]} ${d.getDate()}`);
      }

      const revByDay: Record<string, number> = {};
      const newByDay: Record<string, number> = {};
      const churnByDay: Record<string, number> = {};
      for (const b of buckets) { revByDay[b] = 0; newByDay[b] = 0; churnByDay[b] = 0; }

      for (const inv of invoiceRecords) {
        const k = dayKey(inv.date);
        if (revByDay[k] !== undefined) {
          revByDay[k] += inv.total;
        }
      }
      for (const cust of customerRecords) {
        const k = dayKey(cust.date);
        if (newByDay[k] !== undefined) {
          newByDay[k]++;
        }
        if ((cust.status === 'cancelled' || cust.status === 'churn-risk') && churnByDay[k] !== undefined) {
          churnByDay[k]++;
        }
      }

      trendData = buckets.map((b, i) => ({ m: labels[i], mrr: parseFloat((revByDay[b] / 1000).toFixed(1)) }));
      growthData = buckets.map((b, i) => ({ m: labels[i], new: newByDay[b], churn: churnByDay[b] }));

    } else if (range === '30D') {
      // ── 30 Day: group invoices by day ──
      const buckets: string[] = [];
      const labels: string[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        buckets.push(dayKey(d));
        labels.push(d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }));
      }

      const revByDay: Record<string, number> = {};
      const newByDay: Record<string, number> = {};
      const churnByDay: Record<string, number> = {};
      for (const b of buckets) { revByDay[b] = 0; newByDay[b] = 0; churnByDay[b] = 0; }

      for (const inv of invoiceRecords) {
        const k = dayKey(inv.date);
        if (revByDay[k] !== undefined) {
          revByDay[k] += inv.total;
        }
      }
      for (const cust of customerRecords) {
        const k = dayKey(cust.date);
        if (newByDay[k] !== undefined) {
          newByDay[k]++;
        }
        if ((cust.status === 'cancelled' || cust.status === 'churn-risk') && churnByDay[k] !== undefined) {
          churnByDay[k]++;
        }
      }

      trendData = buckets.map((b, i) => ({ m: labels[i], mrr: parseFloat((revByDay[b] / 1000).toFixed(1)) }));
      growthData = buckets.map((b, i) => ({ m: labels[i], new: newByDay[b], churn: churnByDay[b] }));

    } else if (range === '90D') {
      // ── 90 Day: group by week ──
      const buckets: string[] = [];
      const labels: string[] = [];
      for (let i = 12; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i * 7);
        buckets.push(weekKey(d));
        labels.push(d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }));
      }

      const revByWeek: Record<string, number> = {};
      const newByWeek: Record<string, number> = {};
      const churnByWeek: Record<string, number> = {};
      for (const b of buckets) { revByWeek[b] = 0; newByWeek[b] = 0; churnByWeek[b] = 0; }

      for (const inv of invoiceRecords) {
        const k = weekKey(inv.date);
        if (revByWeek[k] !== undefined) {
          revByWeek[k] += inv.total;
        }
      }
      for (const cust of customerRecords) {
        const k = weekKey(cust.date);
        if (newByWeek[k] !== undefined) {
          newByWeek[k]++;
        }
        if ((cust.status === 'cancelled' || cust.status === 'churn-risk') && churnByWeek[k] !== undefined) {
          churnByWeek[k]++;
        }
      }

      trendData = buckets.map((b, i) => ({ m: labels[i], mrr: parseFloat((revByWeek[b] / 1000).toFixed(1)) }));
      growthData = buckets.map((b, i) => ({ m: labels[i], new: newByWeek[b], churn: churnByWeek[b] }));

    } else {
      // ── 12M: group by month ──
      if (revenueTrendSnapshot?.data && subscriptionGrowthSnapshot?.data) {
        trendData = revenueTrendSnapshot.data;
        growthData = subscriptionGrowthSnapshot.data;
      } else {
        const buckets: string[] = [];
        const labels: string[] = [];
        for (let i = 11; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          buckets.push(monthKey(d));
          labels.push(MONTH_NAMES[d.getMonth()]);
        }

        const revByMonth: Record<string, number> = {};
        const newByMonth: Record<string, number> = {};
        const churnByMonth: Record<string, number> = {};
        for (const b of buckets) { revByMonth[b] = 0; newByMonth[b] = 0; churnByMonth[b] = 0; }

        for (const inv of invoiceRecords) {
          const k = monthKey(inv.date);
          if (revByMonth[k] !== undefined) {
            revByMonth[k] += inv.total;
          }
        }
        for (const cust of customerRecords) {
          const k = monthKey(cust.date);
          if (newByMonth[k] !== undefined) {
            newByMonth[k]++;
          }
          if (cust.status === 'cancelled' || cust.status === 'churn-risk') {
            // Attribute churn to current month (we don't track exact churn date)
            const currentKey = monthKey(now);
            if (churnByMonth[currentKey] !== undefined) {
              churnByMonth[currentKey]++;
            }
          }
        }

        trendData = buckets.map((b, i) => ({ m: labels[i], mrr: parseFloat((revByMonth[b] / 1000).toFixed(1)) }));
        growthData = buckets.map((b, i) => ({ m: labels[i], new: newByMonth[b], churn: churnByMonth[b] }));
      }
    }

    // ═══════════════════════════════════════════════════════════
    //  Complaint Trend — from snapshot + overlay new complaints
    // ═══════════════════════════════════════════════════════════

    const baseComplaintTrend = complaintTrendSnapshot?.data || [
      { d: 'Mon', c: 7 }, { d: 'Tue', c: 4 }, { d: 'Wed', c: 9 },
      { d: 'Thu', c: 5 }, { d: 'Fri', c: 12 }, { d: 'Sat', c: 8 }, { d: 'Sun', c: 3 },
    ];
    const seedComplaintIds = new Set(['CMP-3041', 'CMP-3040', 'CMP-3039']);
    const complaintCounts: Record<string, number> = {};
    for (const item of baseComplaintTrend) {
      complaintCounts[item.d] = item.c;
    }
    for (const comp of complaints) {
      if (!seedComplaintIds.has(comp.id)) {
        const day = this.getDayOfWeek(comp.opened);
        complaintCounts[day] = (complaintCounts[day] ?? 0) + 1;
      }
    }
    const dynamicComplaintTrend = baseComplaintTrend.map((item: any) => ({
      d: item.d,
      c: complaintCounts[item.d] ?? item.c,
    }));

    // ═══════════════════════════════════════════════════════════
    //  Response
    // ═══════════════════════════════════════════════════════════

    const currentMonthKey = monthKey(now);
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthKey = monthKey(prevMonthDate);

    let currentMonthInvoiced = 0;
    let prevMonthInvoiced = 0;
    for (const inv of invoiceRecords) {
      const k = monthKey(inv.date);
      if (k === currentMonthKey) {
        currentMonthInvoiced += inv.total;
      } else if (k === prevMonthKey) {
        prevMonthInvoiced += inv.total;
      }
    }

    let currentMonthNew = 0;
    let prevMonthNew = 0;
    for (const cust of customerRecords) {
      const k = monthKey(cust.date);
      if (k === currentMonthKey) {
        currentMonthNew++;
      } else if (k === prevMonthKey) {
        prevMonthNew++;
      }
    }

    const mrrDelta = prevMonthInvoiced > 0
      ? parseFloat((((currentMonthInvoiced - prevMonthInvoiced) / prevMonthInvoiced) * 100).toFixed(1))
      : 0;

    const activeSubsDelta = prevMonthNew > 0
      ? parseFloat((((currentMonthNew - prevMonthNew) / prevMonthNew) * 100).toFixed(1))
      : 0;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0, 0);
    const yesterdayEnd = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);

    const completedYesterday = workOrders.filter((w: any) => 
      w.status === 'completed' && 
      w.updatedAt && 
      new Date(w.updatedAt) >= yesterdayStart && 
      new Date(w.updatedAt) <= yesterdayEnd
    ).length;

    const carsCleanedDelta = completedYesterday > 0
      ? parseFloat((((carsCleanedToday - completedYesterday) / completedYesterday) * 100).toFixed(1))
      : 0;

    return {
      kpis: {
        mrr: {
          value: `AED ${totalMrr.toLocaleString()}`,
          delta: mrrDelta,
          hint: `From ${apartments.length} communities`,
        },
        activeCustomers: {
          value: String(activeCustomerCount),
          delta: parseFloat(((activeCustomerCount / Math.max(totalCustomerCount, 1)) * 100).toFixed(1)),
          hint: churnRiskCount > 0 ? `${churnRiskCount} churn-risk · ${pausedCount} paused` : `${pausedCount} paused`,
        },
        activeSubscriptions: {
          value: totalActiveSubscriptions.toLocaleString(),
          delta: activeSubsDelta,
          hint: planBreakdown || 'No active plans',
        },
        openComplaints: {
          value: String(openComplaints),
          delta: resolvedComplaints > 0 ? -parseFloat(((resolvedComplaints / Math.max(openComplaints + resolvedComplaints, 1)) * 100).toFixed(1)) : 0,
          hint: `${resolvedComplaints} resolved · ${openTickets} tickets`,
        },
        carsCleanedToday: {
          value: String(carsCleanedToday),
          delta: carsCleanedDelta,
          hint: `${inProgressWashes} in progress · ${completedWashes} done`,
        },
        techniciansOnline: {
          value: `${onlineStaff.length} / ${staff.length}`,
          delta: 0,
          hint: `${onBreak} on break`,
        },
        renewalsDue: {
          value: String(renewalsDue),
          delta: 0,
          hint: 'Next 7 days',
        },
        failedPayments24h: {
          value: String(failedPayments),
          delta: failedPayments > 0 ? parseFloat(((failedPayments / Math.max(totalPayments, 1)) * 100).toFixed(1)) : 0,
          hint: `${failedPayments} of ${totalPayments} transactions`,
        },
      },
      revenueTrend: trendData,
      subscriptionGrowth: growthData,
      complaintTrend: dynamicComplaintTrend,
      apartments,
      staff,
      liveOps: {
        pendingWashes,
        delayedWashes,
        supportEscalations: escalatedTickets,
        techniciansActive: onlineStaff.length,
      },
    };
  }

  private getDayOfWeek(openedStr?: string): string {
    if (!openedStr) return 'Mon';
    const clean = openedStr.trim().toLowerCase();
    if (clean.startsWith('today')) return DAY_NAMES[new Date().getDay()];
    if (clean.startsWith('yesterday')) {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return DAY_NAMES[d.getDay()];
    }
    try {
      const d = new Date(`${openedStr.trim()} ${new Date().getFullYear()}`);
      if (!isNaN(d.getTime())) return DAY_NAMES[d.getDay()];
    } catch { }
    return 'Mon';
  }
}

export const dashboardService = new DashboardService();
