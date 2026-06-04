export interface Customer {
  id: string;
  name: string;
  email: string;
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
}

export interface Invoice {
  id: string;
  customer: string;
  community?: string;
  plate?: string;
  plan?: string;
  subtotal: number;
  vat: number;
  total: number;
  status: string;
  date: string;
}

export interface Staff {
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
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  freq: string;
}

export interface Payment {
  id: string;
  method: string;
  customer: string;
  gateway?: string;
  amount: number;
  status: string;
  date: string;
}

export interface Ticket {
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
}

export interface NotificationTemplate {
  id: string;
  type: string;
  name: string;
  subject?: string;
  body?: string;
  trigger?: string;
  sender?: string;
  status?: string;
  sent?: number;
  sent24h?: number;
  open?: number;
  click?: number;
  delivered?: number;
}

export interface ExportJob {
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
}

export interface CreditNote {
  id: string;
  invoice: string;
  customer: string;
  reason?: string;
  amount: number;
  vat: number;
  total: number;
  issued?: string;
  status?: string;
}