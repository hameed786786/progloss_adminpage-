/** Canonical seed payloads — mirrors former frontend mock data. */
export const COMMUNITIES = [
  'Marina Gate 2', 'Burj Vista 1', 'Damac Heights', 'JBR Sadaf 5',
  'Bay Central', 'Park Island Sanibel', 'Princess Tower', 'Cayan Tower',
  'Emirates Hills Villa 47', 'Arabian Ranches III', 'Dubai Hills Estate',
];

export const CUSTOMERS = [
  { id: 'CUS-10421', name: 'Maryam Al Hashimi', email: 'maryam.h@meraas.ae', phone: '+971 50 412 8821', community: 'Marina Gate 2', vehicles: 2, plan: 'Royal Monthly', status: 'active', since: '2024-01-01T00:00:00.000Z', ltv: 8420 },
  { id: 'CUS-10422', name: 'Omar Hourani', email: 'o.hourani@gmail.com', phone: '+971 56 220 7733', community: 'Damac Heights', vehicles: 1, plan: 'Premium Bi-weekly', status: 'active', since: '2024-03-01T00:00:00.000Z', ltv: 3120 },
  { id: 'CUS-10423', name: 'Sophia Chen', email: 'sophia.chen@axios.io', phone: '+971 52 880 1180', community: 'Burj Vista 1', vehicles: 3, plan: 'Fleet Care', status: 'active', since: '2023-08-01T00:00:00.000Z', ltv: 14210 },
  { id: 'CUS-10424', name: 'Hamdan Al Suwaidi', email: 'hamdan.s@etisalat.ae', phone: '+971 50 110 4477', community: 'Emirates Hills Villa 47', vehicles: 4, plan: 'Royal Monthly', status: 'paused', since: '2022-10-01T00:00:00.000Z', ltv: 21450 },
  { id: 'CUS-10425', name: 'Priya Nair', email: 'priya.nair@accenture.com', phone: '+971 54 661 0098', community: 'JBR Sadaf 5', vehicles: 1, plan: 'Eco Weekly', status: 'active', since: '2025-05-01T00:00:00.000Z', ltv: 740 },
  { id: 'CUS-10426', name: 'Karim Boutros', email: 'k.boutros@aramex.com', phone: '+971 50 718 3290', community: 'Park Island Sanibel', vehicles: 2, plan: 'Premium Bi-weekly', status: 'churn-risk', since: '2023-02-01T00:00:00.000Z', ltv: 6280 },
  { id: 'CUS-10427', name: 'Aisha Mubarak', email: 'aisha.m@adq.ae', phone: '+971 56 909 1212', community: 'Dubai Hills Estate', vehicles: 1, plan: 'Eco Weekly', status: 'active', since: '2024-11-01T00:00:00.000Z', ltv: 1180 },
  { id: 'CUS-10428', name: 'Tom Pereira', email: 'tom.p@dpworld.com', phone: '+971 52 311 7745', community: 'Bay Central', vehicles: 1, plan: 'Premium Bi-weekly', status: 'cancelled', since: '2023-09-01T00:00:00.000Z', ltv: 2640 },
];

export const INVOICES = [
  { id: 'INV-2026-04812', customer: 'Maryam Al Hashimi', community: 'Marina Gate 2', plate: 'P-12-34892', plan: 'Royal Monthly', subtotal: 420.0, vat: 21.0, total: 441.0, status: 'paid', date: '12 May 2026' },
  { id: 'INV-2026-04813', customer: 'Omar Hourani', community: 'Damac Heights', plate: 'R-77-21034', plan: 'Premium Bi-weekly', subtotal: 260.0, vat: 13.0, total: 273.0, status: 'paid', date: '12 May 2026' },
  { id: 'INV-2026-04814', customer: 'Sophia Chen', community: 'Burj Vista 1', plate: 'Q-15-67120', plan: 'Fleet Care', subtotal: 1240.0, vat: 62.0, total: 1302.0, status: 'overdue', date: '08 May 2026' },
  { id: 'INV-2026-04815', customer: 'Hamdan Al Suwaidi', community: 'Emirates Hills 47', plate: 'T-44-90211', plan: 'Royal Monthly', subtotal: 720.0, vat: 36.0, total: 756.0, status: 'pending', date: '14 May 2026' },
  { id: 'INV-2026-04816', customer: 'Priya Nair', community: 'JBR Sadaf 5', plate: 'S-28-44102', plan: 'Eco Weekly', subtotal: 145.0, vat: 7.25, total: 152.25, status: 'paid', date: '13 May 2026' },
  { id: 'INV-2026-04817', customer: 'Karim Boutros', community: 'Park Island', plate: 'O-91-55103', plan: 'Premium Bi-weekly', subtotal: 260.0, vat: 13.0, total: 273.0, status: 'failed', date: '11 May 2026' },
  { id: 'INV-2026-04818', customer: 'Aisha Mubarak', community: 'Dubai Hills', plate: 'M-12-77321', plan: 'Eco Weekly', subtotal: 145.0, vat: 7.25, total: 152.25, status: 'paid', date: '15 May 2026' },
  { id: 'INV-2026-04819', customer: 'Tom Pereira', community: 'Bay Central', plate: 'N-66-31049', plan: 'Premium Bi-weekly', subtotal: 260.0, vat: 13.0, total: 273.0, status: 'refunded', date: '07 May 2026' },
];

export const STAFF = [
  { id: 'PRG-T-012', name: 'Imran Saeed', role: 'Senior Technician', zone: 'Marina', status: 'Cleaning', building: 'Marina Gate 2', plate: 'P-12-34892', shift: '06:00–14:00', eta: '11m', clockIn: '06:02', clockOut: '14:05', hours: '8.0h', attendanceState: 'On time' },
  { id: 'PRG-T-018', name: 'Joseph Mwangi', role: 'Technician', zone: 'Downtown', status: 'En Route', building: 'Burj Vista 1', plate: 'Q-15-67120', shift: '06:00–14:00', eta: '4m', clockIn: '06:00', clockOut: '14:00', hours: '8.0h', attendanceState: 'On time' },
  { id: 'PRG-T-021', name: 'Rohit Sharma', role: 'Technician', zone: 'JBR', status: 'Available', building: '—', plate: '—', shift: '10:00–18:00', eta: '—', clockIn: '10:05', clockOut: '18:01', hours: '8.0h', attendanceState: 'On time' },
  { id: 'PRG-T-027', name: 'Abdellah Naciri', role: 'Lead Technician', zone: 'Emirates Hills', status: 'Cleaning', building: 'Villa 47', plate: 'T-44-90211', shift: '06:00–14:00', eta: '22m', clockIn: '05:55', clockOut: '14:02', hours: '8.0h', attendanceState: 'On time' },
  { id: 'PRG-T-031', name: 'Maxim Volkov', role: 'Technician', zone: 'Dubai Hills', status: 'Break', building: 'Hub-3', plate: '—', shift: '10:00–18:00', eta: '8m', clockIn: '10:15', clockOut: '17:00', hours: '6.8h', attendanceState: 'Late' },
  { id: 'PRG-T-035', name: 'Daniel Okafor', role: 'Technician', zone: 'Damac Heights', status: 'Cleaning', building: 'Tower B', plate: 'R-77-21034', shift: '10:00–18:00', eta: '9m', clockIn: '09:58', clockOut: '18:00', hours: '8.0h', attendanceState: 'On time' },
  { id: 'PRG-T-038', name: 'Ali Rida', role: 'Technician', zone: 'Bay Central', status: 'Offline', building: '—', plate: '—', shift: '—', eta: '—', clockIn: '—', clockOut: '—', hours: '—', attendanceState: 'Absent' },
];

export const TICKETS = [
  {
    id: 'TKT-9821',
    subject: 'Water spots on rear windshield',
    customer: 'Maryam Al Hashimi',
    priority: 'high',
    status: 'open',
    sla: '2h 14m',
    assigned: 'Imran Saeed',
    created: 'Today, 09:42',
    description: "The rear windshield has noticeable water marks and streaks after today's wash. Please have the technician wipe it down again.",
    replies: []
  },
  {
    id: 'TKT-9822',
    subject: 'Wrong plate marked as completed',
    customer: 'Sophia Chen',
    priority: 'urgent',
    status: 'escalated',
    sla: 'Breached',
    assigned: 'Operations Admin',
    created: 'Today, 07:10',
    description: "My car plate is Q-15-67120, but the app shows plate P-12-34892 was washed instead. Please check the logs.",
    replies: []
  },
  {
    id: 'TKT-9823',
    subject: 'Reschedule weekend slot',
    customer: 'Aisha Mubarak',
    priority: 'low',
    status: 'in-progress',
    sla: '11h 02m',
    assigned: 'Support Agent',
    created: 'Yesterday',
    description: "I need to reschedule my wash slot this weekend from Saturday 9 AM to Sunday 2 PM.",
    replies: []
  },
  {
    id: 'TKT-9824',
    subject: 'VAT receipt missing in app',
    customer: 'Omar Hourani',
    priority: 'medium',
    status: 'open',
    sla: '5h 31m',
    assigned: 'Finance Admin',
    created: 'Today, 11:08',
    description: "I completed my payment yesterday but haven't received the VAT invoice in the app or my email.",
    replies: []
  },
  {
    id: 'TKT-9825',
    subject: 'Subscription paused but charged',
    customer: 'Hamdan Al Suwaidi',
    priority: 'urgent',
    status: 'in-progress',
    sla: '1h 09m',
    assigned: 'Finance Admin',
    created: 'Today, 08:55',
    description: "I paused my subscription on May 10, but I was still charged AED 756 today.",
    replies: []
  },
  {
    id: 'TKT-9826',
    subject: 'Eco-foam smells different today',
    customer: 'Priya Nair',
    priority: 'low',
    status: 'resolved',
    sla: '—',
    assigned: 'Imran Saeed',
    created: '12 May',
    description: "The eco-foam used on my car today had a very strong chemical scent, unlike the usual pleasant lavender smell.",
    replies: [
      { sender: 'Priya Nair', text: 'The eco-foam used on my car today had a very strong chemical scent, unlike the usual pleasant lavender smell.', timestamp: new Date('2026-05-12T10:00:00.000Z') },
      { sender: 'Imran Saeed', text: 'Hi Priya, we recently updated our supplier batch. I will check with operations to ensure the formulation is correct.', timestamp: new Date('2026-05-12T10:30:00.000Z') }
    ]
  },
];

export const PLANS = [
  { id: 'PLN-ECO', name: 'Eco Weekly', price: 145, freq: 'weekly', washes: 4, vehicles: 1, perks: ['Waterless eco wash', 'Tyre dressing', 'Interior vacuum'], active: 412 },
  { id: 'PLN-PRE', name: 'Premium Bi-weekly', price: 260, freq: 'bi-weekly', washes: 2, vehicles: 1, perks: ['Premium foam', 'Interior detail', 'Glass treatment', 'Dashboard polish'], active: 638 },
  { id: 'PLN-ROY', name: 'Royal Monthly', price: 420, freq: 'monthly', washes: 4, vehicles: 2, perks: ['Ceramic top-up', 'Engine bay clean', 'Leather conditioning', 'Priority slots'], active: 281 },
  { id: 'PLN-FLT', name: 'Fleet Care', price: 1240, freq: 'monthly', washes: 16, vehicles: 8, perks: ['Dedicated technician', 'SLA 4h', 'Custom reports', 'Quarterly detail'], active: 47 },
];

export const APARTMENTS = [
  { name: 'Marina Gate 2', units: 248, residents: 142, vehicles: 168, staff: 4, mrr: 38420, complaints: 2, occupancy: 87 },
  { name: 'Burj Vista 1', units: 312, residents: 188, vehicles: 221, staff: 5, mrr: 52110, complaints: 4, occupancy: 91 },
  { name: 'Damac Heights', units: 280, residents: 167, vehicles: 198, staff: 4, mrr: 44280, complaints: 1, occupancy: 84 },
  { name: 'JBR Sadaf 5', units: 196, residents: 98, vehicles: 112, staff: 3, mrr: 24180, complaints: 0, occupancy: 76 },
  { name: 'Park Island Sanibel', units: 168, residents: 91, vehicles: 108, staff: 3, mrr: 21940, complaints: 3, occupancy: 81 },
  { name: 'Emirates Hills Villa 47', units: 1, residents: 6, vehicles: 9, staff: 1, mrr: 4280, complaints: 0, occupancy: 100 },
];

export const REVENUE_TREND = [
  { m: 'Dec', mrr: 168, churn: 1.8 },
  { m: 'Jan', mrr: 184, churn: 1.6 },
  { m: 'Feb', mrr: 198, churn: 1.4 },
  { m: 'Mar', mrr: 221, churn: 1.5 },
  { m: 'Apr', mrr: 247, churn: 1.2 },
  { m: 'May', mrr: 268, churn: 1.1 },
];

export const COMPLAINT_TREND = [
  { d: 'Mon', c: 7 }, { d: 'Tue', c: 4 }, { d: 'Wed', c: 9 },
  { d: 'Thu', c: 5 }, { d: 'Fri', c: 12 }, { d: 'Sat', c: 8 }, { d: 'Sun', c: 3 },
];

export const SUBSCRIPTION_GROWTH = [
  { m: 'Dec', new: 88, churn: 22 },
  { m: 'Jan', new: 104, churn: 18 },
  { m: 'Feb', new: 121, churn: 24 },
  { m: 'Mar', new: 138, churn: 19 },
  { m: 'Apr', new: 156, churn: 26 },
  { m: 'May', new: 172, churn: 21 },
];

export const PAYMENTS = [
  { id: 'TXN-2026-9001', method: 'Visa •• 4421', customer: 'Maryam Al Hashimi', gateway: 'Network Intl', amount: 441.0, status: 'captured', date: 'Today 11:02' },
  { id: 'TXN-2026-9002', method: 'Mastercard •• 7710', customer: 'Omar Hourani', gateway: 'Network Intl', amount: 273.0, status: 'captured', date: 'Today 10:48' },
  { id: 'TXN-2026-9003', method: 'Apple Pay', customer: 'Sophia Chen', gateway: 'Stripe', amount: 1302.0, status: 'failed', date: 'Today 09:11' },
  { id: 'TXN-2026-9004', method: 'AED Wallet', customer: 'Hamdan Al Suwaidi', gateway: 'Telr', amount: 756.0, status: 'pending', date: 'Today 08:32' },
  { id: 'TXN-2026-9005', method: 'Visa •• 0098', customer: 'Priya Nair', gateway: 'Network Intl', amount: 152.25, status: 'captured', date: 'Today 07:55' },
  { id: 'TXN-2026-9006', method: 'Mastercard •• 1209', customer: 'Karim Boutros', gateway: 'Stripe', amount: 273.0, status: 'failed', date: 'Today 07:21' },
];

export const AUDIT = [
  { ts: 'Today 11:42', actor: 'Rashid Al Mansoori', role: 'Super Admin', action: 'Updated permission matrix · Finance Admin · billing.refund.create', ip: '94.200.12.41' },
  { ts: 'Today 10:18', actor: 'Layla Hassan', role: 'Finance Admin', action: 'Issued refund AED 273.00 on INV-2026-04817', ip: '31.215.6.118' },
  { ts: 'Today 09:51', actor: 'System', role: 'AutoBilling', action: 'Generated 412 invoices for Eco Weekly cycle', ip: '—' },
  { ts: 'Today 08:33', actor: 'Khalid Noor', role: 'Dispatcher', action: 'Reassigned PRG-T-018 → Burj Vista 1 (TKT-9822)', ip: '94.200.18.7' },
  { ts: 'Yesterday 19:02', actor: 'Sara Khoury', role: 'Operations Admin', action: 'Created plan PLN-ROY revision v3.2', ip: '31.215.6.74' },
  { ts: 'Yesterday 17:46', actor: 'System', role: 'Gateway', action: 'Webhook failure retry · Stripe · payment_intent.failed', ip: '—' },
];

export const PERM_MODULES = [
  'Dashboard', 'Customers', 'Subscriptions', 'Operations', 'Staff', 'Apartments',
  'Billing & VAT', 'Payments', 'Analytics', 'Ecommerce', 'RBAC', 'Audit',
];

export const PERM_ACTIONS = ['view', 'create', 'edit', 'delete', 'export', 'approve', 'manage'];

export type ModulePermissions = {
  view: boolean; create: boolean; edit: boolean; delete: boolean;
  export: boolean; approve: boolean; manage: boolean;
};

const ALL_ON: ModulePermissions  = { view: true,  create: true,  edit: true,  delete: true,  export: true,  approve: true,  manage: true  };
const VIEW_ONLY: ModulePermissions = { view: true,  create: false, edit: false, delete: false, export: false, approve: false, manage: false };
const NO_ACCESS: ModulePermissions = { view: false, create: false, edit: false, delete: false, export: false, approve: false, manage: false };

export const PERM_MATRIX: Record<string, Record<string, ModulePermissions>> = {
  'Super Admin': Object.fromEntries(PERM_MODULES.map((m) => [m, ALL_ON])),

  'Operations Admin': Object.fromEntries(PERM_MODULES.map((m) => [
    m,
    (m === 'Billing & VAT' || m === 'RBAC')
      ? { view: true,  create: false, edit: false, delete: false, export: true,  approve: false, manage: true  }
      : { view: true,  create: true,  edit: true,  delete: m !== 'Audit', export: true, approve: false, manage: true  },
  ])),

  'Finance Admin': Object.fromEntries(PERM_MODULES.map((m) => [
    m,
    (m === 'Billing & VAT' || m === 'Payments')
      ? { view: true,  create: true,  edit: true,  delete: false, export: true,  approve: true,  manage: true  }
      : { view: true,  create: false, edit: false, delete: false, export: true,  approve: true,  manage: true  },
  ])),

  Dispatcher: Object.fromEntries(PERM_MODULES.map((m) => [
    m,
    m === 'Operations'
      ? { view: true,  create: true,  edit: true,  delete: false, export: false, approve: false, manage: false }
      : VIEW_ONLY,
  ])),

  'Support Agent': Object.fromEntries(PERM_MODULES.map((m) => [
    m,
    m === 'Customers'
      ? { view: true,  create: true,  edit: true,  delete: false, export: false, approve: false, manage: false }
      : VIEW_ONLY,
  ])),

  'Inventory Manager': Object.fromEntries(PERM_MODULES.map((m) => [
    m,
    { view: true, create: false, edit: false, delete: false, export: false, approve: false, manage: false },
  ])),

  Supervisor: Object.fromEntries(PERM_MODULES.map((m) => [
    m,
    m === 'Staff'
      ? { view: true,  create: false, edit: true,  delete: false, export: false, approve: false, manage: false }
      : VIEW_ONLY,
  ])),

  Staff: Object.fromEntries(PERM_MODULES.map((m) => [
    m,
    m === 'Operations'
      ? { view: true,  create: false, edit: false, delete: false, export: false, approve: false, manage: false }
      : NO_ACCESS,
  ])),
};

export const ROLES = [
  { id: 'ROL-SUP', name: 'Super Admin', users: 2, color: 'primary', desc: 'Full access across every module and workspace.' },
  { id: 'ROL-OPS', name: 'Operations Admin', users: 4, color: 'info', desc: 'Oversees dispatch, daily ops and staff productivity.' },
  { id: 'ROL-FIN', name: 'Finance Admin', users: 3, color: 'warning', desc: 'Owns billing, VAT, refunds and gateway reconciliation.' },
  { id: 'ROL-DSP', name: 'Dispatcher', users: 6, color: 'info', desc: 'Assigns technicians and manages the live queue.' },
  { id: 'ROL-SUP2', name: 'Support Agent', users: 8, color: 'neutral', desc: 'Handles tickets, complaints and reschedules.' },
  { id: 'ROL-INV', name: 'Inventory Manager', users: 2, color: 'neutral', desc: 'Stock, consumables and supplier orders.' },
  { id: 'ROL-SPV', name: 'Supervisor', users: 5, color: 'neutral', desc: 'Building-level supervision and QC sign-off.' },
  { id: 'ROL-STF', name: 'Staff', users: 84, color: 'neutral', desc: 'Field technicians executing wash orders.' },
];

export const DISPATCH_QUEUE = [
  { id: 'WO-12041', plate: 'P-12-34892', community: 'Marina Gate 2', plan: 'Royal', slot: '08:00–09:00', tech: 'Imran Saeed', status: 'in-progress' },
  { id: 'WO-12042', plate: 'R-77-21034', community: 'Damac Heights', plan: 'Premium', slot: '08:00–09:00', tech: 'Daniel Okafor', status: 'in-progress' },
  { id: 'WO-12043', plate: 'Q-15-67120', community: 'Burj Vista 1', plan: 'Fleet', slot: '09:00–10:00', tech: 'Joseph Mwangi', status: 'in-progress' },
  { id: 'WO-12044', plate: 'T-44-90211', community: 'Emirates Hills 47', plan: 'Royal', slot: '09:00–10:30', tech: 'Abdellah Naciri', status: 'in-progress' },
  { id: 'WO-12045', plate: 'S-28-44102', community: 'JBR Sadaf 5', plan: 'Eco', slot: '10:00–10:30', tech: 'Unassigned', status: 'queued' },
  { id: 'WO-12046', plate: 'M-12-77321', community: 'Dubai Hills', plan: 'Eco', slot: '10:30–11:00', tech: 'Unassigned', status: 'queued' },
  { id: 'WO-12047', plate: 'N-66-31049', community: 'Bay Central', plan: 'Premium', slot: '11:00–12:00', tech: 'Unassigned', status: 'queued' },
];

export const CREDIT_NOTES = [
  { id: 'CN-2026-0118', invoice: 'INV-2026-04814', customer: 'Sophia Chen', reason: 'Service downgrade', amount: 240.0, vat: 12.0, total: 252.0, issued: '12 May 2026', status: 'applied' },
  { id: 'CN-2026-0117', invoice: 'INV-2026-04812', customer: 'Maryam Al Hashimi', reason: 'Goodwill credit', amount: 90.0, vat: 4.5, total: 94.5, issued: '11 May 2026', status: 'applied' },
  { id: 'CN-2026-0116', invoice: 'INV-2026-04809', customer: 'Omar Hourani', reason: 'Plan correction', amount: 65.0, vat: 3.25, total: 68.25, issued: '09 May 2026', status: 'pending' },
  { id: 'CN-2026-0115', invoice: 'INV-2026-04802', customer: 'Hamdan Al Suwaidi', reason: 'SLA breach compensation', amount: 200.0, vat: 10.0, total: 210.0, issued: '07 May 2026', status: 'applied' },
];

export const NOTIFICATION_TEMPLATES = [
  { id: 'EML-INV', type: 'email', name: 'VAT Invoice', subject: 'Your Progloss invoice {{invoice}}', trigger: 'invoice.issued', sent: 1378, open: 72.4, click: 38.2, status: 'active' },
  { id: 'EML-RFD', type: 'email', name: 'Refund confirmation', subject: 'Refund processed · {{amount}} AED', trigger: 'refund.completed', sent: 22, open: 88.1, click: 12.4, status: 'active' },
  { id: 'EML-WLC', type: 'email', name: 'Welcome onboarding', subject: 'Welcome to Progloss, {{name}}', trigger: 'customer.created', sent: 142, open: 64.8, click: 41.2, status: 'active' },
  { id: 'EML-DUN', type: 'email', name: 'Dunning · payment failed', subject: 'Action needed · payment for {{invoice}}', trigger: 'payment.failed', sent: 38, open: 58.2, click: 28.4, status: 'active' },
  { id: 'SMS-WASH', type: 'sms', name: 'Wash complete', subject: 'Your {{plate}} wash is complete', trigger: 'wash.completed', sent: 2840, delivered: 99.2, status: 'active' },
  { id: 'SMS-ETA', type: 'sms', name: 'Technician ETA', subject: 'Technician arriving in {{eta}}', trigger: 'dispatch.eta', sent: 1920, delivered: 98.8, status: 'active' },
  { id: 'PUSH-REM', type: 'push', name: 'Renewal reminder', subject: 'Your plan renews in {{days}} days', trigger: 'subscription.renewal', sent: 1840, open: 54.2, click: 22.1, status: 'active' },
];

export const EXPORT_JOBS = [
  { id: 'EXP-2026-0412', name: 'May VAT return', template: 'VAT summary', desc: 'FTA quarterly export', format: 'CSV', fileName: 'vat-may-2026.csv', by: 'Layla Hassan', size: '248 KB', at: 'Today 10:18', status: 'ready' },
  { id: 'EXP-2026-0411', name: 'Customer LTV cohort', template: 'Customer analytics', desc: 'All active customers', format: 'CSV', fileName: 'ltv-cohort.csv', by: 'Rashid Al Mansoori', size: '1.2 MB', at: 'Yesterday 19:02', status: 'ready' },
];

export const COUPONS = [
  { code: 'ECO50', plan: 'Eco Weekly', discount: '50% off first month', redeemed: 218, cap: 500, expires: '30 Jun 2026', status: 'active' },
  { code: 'ROYAL3M', plan: 'Royal Monthly', discount: 'AED 200 off · 3 months', redeemed: 42, cap: 150, expires: '31 Jul 2026', status: 'active' },
  { code: 'FLEET20', plan: 'Fleet Care', discount: '20% off annual prepay', redeemed: 8, cap: 30, expires: '31 Dec 2026', status: 'active' },
  { code: 'WINBACK', plan: 'Any plan', discount: '1 free wash + 15% off', redeemed: 88, cap: 200, expires: '30 Sep 2026', status: 'active' },
  { code: 'NYE2026', plan: 'Premium Bi-weekly', discount: 'AED 100 off', redeemed: 412, cap: 412, expires: '31 Jan 2026', status: 'expired' },
];

export const ECOMMERCE_PRODUCTS = [
  { sku: 'PG-WAX-01', name: 'Progloss Ceramic Wax 500ml', category: 'Detailing', price: 220, stock: 84, sold: 312, status: 'active' },
  { sku: 'PG-FOM-02', name: 'Eco Snow Foam Concentrate 1L', category: 'Wash', price: 95, stock: 218, sold: 1142, status: 'active' },
  { sku: 'PG-INT-04', name: 'Interior Detail Kit (5 pcs)', category: 'Detailing', price: 380, stock: 42, sold: 188, status: 'active' },
  { sku: 'PG-AIR-08', name: 'Oud Air Freshener', category: 'Cabin', price: 65, stock: 412, sold: 920, status: 'active' },
  { sku: 'PG-SHN-11', name: 'Tyre Shine Spray 750ml', category: 'Wash', price: 78, stock: 6, sold: 642, status: 'low-stock' },
  { sku: 'PG-MIC-12', name: 'Microfibre Towel Pack ×6', category: 'Accessories', price: 110, stock: 0, sold: 480, status: 'out-of-stock' },
];

export const ECOMMERCE_ORDERS = [
  { id: 'ORD-8821', customer: 'Maryam Al Hashimi', items: 2, total: 315, status: 'delivered', date: '14 May 2026', channel: 'App' },
  { id: 'ORD-8820', customer: 'Omar Hourani', items: 1, total: 95, status: 'shipped', date: '13 May 2026', channel: 'Web' },
  { id: 'ORD-8819', customer: 'Sophia Chen', items: 4, total: 780, status: 'processing', date: '12 May 2026', channel: 'App' },
];

export const COMPLAINTS = [
  { id: 'CMP-3041', subject: 'Damage to alloy rim during wash', customer: 'Maryam Al Hashimi', community: 'Marina Gate 2', severity: 'high', status: 'investigating', sla: '1h 12m', owner: 'Sara Khoury', opened: 'Today 09:42' },
  { id: 'CMP-3040', subject: 'Wash skipped 3 weeks in a row', customer: 'Sophia Chen', community: 'Burj Vista 1', severity: 'urgent', status: 'escalated', sla: 'Breached', owner: 'Operations Lead', opened: 'Today 07:10' },
  { id: 'CMP-3039', subject: 'Foam left on side mirrors', customer: 'Aisha Mubarak', community: 'Dubai Hills', severity: 'low', status: 'resolved', sla: '—', owner: 'Imran Saeed', opened: 'Yesterday' },
];

export const GATEWAYS = [
  { name: 'Network Intl', region: 'UAE', uptime: 99.98, volume: 268420, success: 98.4, status: 'operational' },
  { name: 'Stripe', region: 'EU', uptime: 99.94, volume: 84120, success: 96.8, status: 'degraded' },
  { name: 'Telr', region: 'UAE', uptime: 99.99, volume: 32180, success: 99.1, status: 'operational' },
];

export const GATEWAY_EVENTS = [
  { ts: 'Today 11:42', gw: 'Stripe', event: 'payment_intent.payment_failed', payload: 'TXN-2026-9003 · card_declined', level: 'error' },
  { ts: 'Today 11:18', gw: 'Network Intl', event: 'charge.captured', payload: 'TXN-2026-9002 · AED 273.00', level: 'info' },
  { ts: 'Today 10:48', gw: 'Network Intl', event: 'charge.captured', payload: 'TXN-2026-9001 · AED 441.00', level: 'info' },
];

export const PROMOTIONS = [
  { name: "Summer Detail Festival", channels: ["Push","Email","In-app"], starts: "20 May", ends: "30 Jun", reach: 12420, ctr: 8.4, conv: 312, status: "live" },
  { name: "Fleet Care quarterly bundle", channels: ["Email","Concierge"], starts: "01 May", ends: "30 Jun", reach: 184, ctr: 14.2, conv: 18, status: "live" },
  { name: "Ramadan Royale", channels: ["Push","SMS","Email"], starts: "10 Mar", ends: "10 Apr", reach: 18920, ctr: 11.1, conv: 482, status: "ended" },
  { name: "Eco upgrade nudge", channels: ["In-app"], starts: "15 May", ends: "Ongoing", reach: 412, ctr: 6.8, conv: 38, status: "live" },
];

