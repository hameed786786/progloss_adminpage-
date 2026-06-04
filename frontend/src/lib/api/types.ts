export type Customer = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  community?: string;
  vehicles?: number;
  plan?: string;
  status?: string;
  since?: string | Date;
  nextRenewal?: string | Date;
  subscriptionId?: string;
  mrr?: number;
  ltv?: number;
};

export type Invoice = {
  id: string;
  customer: string;
  community?: string;
  plate?: string;
  plan?: string;
  subtotal?: number;
  vat?: number;
  total?: number;
  status?: string;
  date?: string;
};

export type StaffMember = {
  id: string;
  name: string;
  role?: string;
  zone?: string;
  status?: string;
  building?: string;
  plate?: string;
  shift?: string;
  eta?: string;
  clockIn?: string;
  clockOut?: string;
  hours?: string;
  attendanceState?: string;
};

export type Ticket = {
  id: string;
  subject: string;
  customer: string;
  priority?: string;
  status?: string;
  sla?: string;
  assigned?: string;
  created?: string;
  description?: string;
  replies?: Array<{
    sender: string;
    text: string;
    timestamp?: string | Date;
  }>;
};

export type Plan = {
  id: string;
  name: string;
  price: number;
  freq: string;
  washes?: number;
  vehicles?: number;
  perks?: string[];
  active?: number;
  cycleStatus?: 'Running' | 'Paused' | 'Scheduled';
};

export type Payment = {
  id: string;
  method: string;
  customer: string;
  gateway?: string;
  amount?: number;
  status?: string;
  date?: string;
};

export type Apartment = {
  name: string;
  units?: number;
  residents?: number;
  vehicles?: number;
  staff?: number;
  mrr?: number;
  complaints?: number;
  occupancy?: number;
};

export type WorkOrder = {
  id: string;
  plate?: string;
  community?: string;
  plan?: string;
  slot?: string;
  tech?: string;
  status?: string;
};

export type AuditEntry = {
  ts: string;
  actor: string;
  role?: string;
  action: string;
  ip?: string;
};

export type ModulePermissions = {
  view: boolean; create: boolean; edit: boolean; delete: boolean;
  export: boolean; approve: boolean; manage: boolean;
};

export type RoleRecord = {
  id: string;
  name: string;
  users: number;
  color: string;
  desc: string;
  matrix?: Record<string, ModulePermissions>;
};

export type DashboardOverview = {
  kpis: Record<string, { value: string; delta: number; hint: string }>;
  revenueTrend: { m: string; mrr: number; churn: number }[];
  subscriptionGrowth: { m: string; new: number; churn: number }[];
  complaintTrend: { d: string; c: number }[];
  apartments: Apartment[];
  staff: StaffMember[];
  liveOps: {
    pendingWashes: number;
    delayedWashes: number;
    supportEscalations: number;
    techniciansActive: number;
  };
};

export type CreditNote = {
  id: string;
  invoice: string;
  customer: string;
  reason?: string;
  amount?: number;
  vat?: number;
  total?: number;
  issued?: string;
  status?: string;
};

export type NotificationTemplate = {
  id: string;
  type: string;
  name: string;
  subject?: string;
  body?: string;
  sender?: string;
  trigger?: string;
  sent?: number;
  sent24h?: number;
  open?: number;
  click?: number;
  delivered?: number;
  status?: string;
};

export type ExportJob = {
  id: string;
  name: string;
  template?: string;
  desc?: string;
  format?: string;
  fileName?: string;
  by?: string;
  size?: string;
  at?: string;
  status?: string;
};

export type Coupon = {
  code: string;
  plan?: string;
  discount?: string;
  redeemed?: number;
  cap?: number;
  expires?: string;
  status?: string;
};

export type EcommerceProduct = {
  sku: string;
  name: string;
  category?: string;
  price?: number;
  stock?: number;
  sold?: number;
  status?: string;
};

export type EcommerceOrder = {
  id: string;
  customer: string;
  items?: number;
  total?: number;
  status?: string;
  date?: string;
  channel?: string;
};

export type Promotion = {
  name: string;
  channels: string[];
  starts?: string;
  ends?: string;
  reach?: number;
  ctr?: number;
  conv?: number;
  status?: string;
};


export type Complaint = {
  id: string;
  subject: string;
  customer: string;
  community?: string;
  severity?: string;
  status?: string;
  sla?: string;
  owner?: string;
  opened?: string;
};

export type GatewayData = {
  gateways: { name: string; region?: string; uptime?: number; volume?: number; success?: number; status?: string }[];
  events: { ts: string; gw: string; event: string; payload?: string; level?: string }[];
};

export type AnalyticsData = {
  revenueTrend?: { m: string; mrr: number; churn: number }[];
  subscriptionGrowth?: { m: string; new: number; churn: number }[];
  complaintTrend?: { d: string; c: number }[];
};
export type Vehicle = { id?: string; plate: string; make: string; color: string; customer?: string | any; community?: string; plan?: string; lastWash?: string; status: string; };
export type UserProfile = {
  id: string;
  email: string;
  name?: string;
  role: string;
  dismissedNotifications: string[];
};
