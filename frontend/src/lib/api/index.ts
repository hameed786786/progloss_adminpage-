import { apiFetch, API_BASE, getAccessToken } from './client';
import type {
  AnalyticsData,
  Apartment,
  AuditEntry,
  Complaint,
  Coupon,
  CreditNote,
  Customer,
  DashboardOverview,
  EcommerceOrder,
  EcommerceProduct,
  ExportJob,
  GatewayData,
  Invoice,
  NotificationTemplate,
  Payment,
  Plan,
  Promotion,
  RoleRecord,
  StaffMember,
  Ticket,
  UserProfile,
  WorkOrder,
} from './types';

export const api = {
  login: (email: string, password: string) =>
    apiFetch<{ accessToken: string; refreshToken?: string; user?: { email: string; role: string } }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
    ),
  refresh: () => apiFetch<{ accessToken: string; refreshToken?: string; expiresAt?: string }>('/auth/refresh', { method: 'POST' }),
  customers: () => apiFetch<Customer[]>('/customers'),
  customer: (id: string) => apiFetch<Customer>(`/customers/${id}`),
  createCustomer: (payload: { id?: string; name: string; email?: string; phone?: string; community?: string; vehicles?: number; plan?: string; status?: string; since?: string; ltv?: number }) =>
    apiFetch<Customer>('/customers', { method: 'POST', body: JSON.stringify(payload) }),
  invoices: () => apiFetch<Invoice[]>('/invoices'),
  invoice: (id: string) => apiFetch<Invoice>(`/invoices/${id}`),
  createInvoice: (payload: { id?: string; customer: string; community?: string; plate?: string; plan?: string; subtotal: number; vat: number; total: number; status: string; date: string }) =>
    apiFetch<Invoice>('/invoices', { method: 'POST', body: JSON.stringify(payload) }),
  plans: () => apiFetch<Plan[]>('/plans'),
  createPlan: (payload: { id?: string; name: string; price: number; freq: string; washes?: number; vehicles?: number; perks?: string[] }) =>
    apiFetch<Plan>('/plans', { method: 'POST', body: JSON.stringify(payload) }),
  updatePlan: (id: string, payload: Partial<{ name: string; price: number; freq: string; washes?: number; vehicles?: number; perks?: string[] }>) =>
    apiFetch<Plan>(`/plans/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(payload) }),
  updatePlanCycleStatus: (id: string, cycleStatus: 'Running' | 'Paused' | 'Scheduled') =>
    apiFetch<Plan>(`/plans/${encodeURIComponent(id)}/cycle-status`, { method: 'PATCH', body: JSON.stringify({ cycleStatus }) }),
  staff: () => apiFetch<StaffMember[]>('/staff'),
  createStaff: (payload: { id?: string; name: string; role?: string; zone?: string; status?: string; building?: string; plate?: string; shift?: string; eta?: string }) =>
    apiFetch<StaffMember>('/staff', { method: 'POST', body: JSON.stringify(payload) }),
  updateStaff: (id: string, payload: Partial<StaffMember>) =>
    apiFetch<StaffMember>(`/staff/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(payload) }),
  payments: () => apiFetch<Payment[]>('/payments'),
  updatePayment: (id: string, payload: Partial<Payment>) =>
    apiFetch<Payment>(`/payments/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(payload) }),
  tickets: () => apiFetch<Ticket[]>('/tickets'),
  updateTicket: (id: string, payload: Partial<Ticket>) =>
    apiFetch<Ticket>(`/tickets/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(payload) }),
  apartments: () => apiFetch<Apartment[]>('/apartments'),
  createApartment: (payload: { name: string; units: number; residents: number; vehicles: number; staff: number; mrr: number; complaints: number; occupancy: number }) =>
    apiFetch<Apartment>('/apartments', { method: 'POST', body: JSON.stringify(payload) }),
  workOrders: () => apiFetch<WorkOrder[]>('/work-orders'),
  updateWorkOrder: (id: string, payload: Partial<WorkOrder>) =>
    apiFetch<WorkOrder>(`/work-orders/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(payload) }),
  vehicles: () => apiFetch<import('./types').Vehicle[]>('/vehicles'),
  audit: () => apiFetch<AuditEntry[]>('/audit'),
  dashboard: (range?: string) => apiFetch<DashboardOverview>(range ? `/dashboard/overview?range=${encodeURIComponent(range)}` : '/dashboard/overview'),
  analytics: () => apiFetch<AnalyticsData>('/analytics'),
  roles: () => apiFetch<RoleRecord[]>('/roles'),
  createRole: (payload: { name: string; desc?: string; matrix?: Record<string, import('./types').ModulePermissions> }) =>
    apiFetch<RoleRecord>('/roles', { method: 'POST', body: JSON.stringify(payload) }),
  updateRolePermissions: (name: string, matrix: Record<string, import('./types').ModulePermissions>) =>
    apiFetch<unknown>(`/roles/${encodeURIComponent(name)}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ matrix }),
    }),
  deleteRole: (name: string) =>
    apiFetch<{ deleted: boolean }>(`/roles/${encodeURIComponent(name)}`, { method: 'DELETE' }),
  rolePermissions: (name: string) => apiFetch<Record<string, import('./types').ModulePermissions>>(`/roles/${encodeURIComponent(name)}/permissions`),
  rbacMeta: () => apiFetch<{ modules: string[]; actions: string[] }>('/rbac/meta'),
  creditNotes: () => apiFetch<CreditNote[]>('/credit-notes'),
  createCreditNote: (payload: { id?: string; invoice: string; customer: string; reason?: string; amount?: number; vat?: number; total?: number; issued?: string; status?: string }) =>
    apiFetch<CreditNote>('/credit-notes', { method: 'POST', body: JSON.stringify(payload) }),
  notificationTemplates: () => apiFetch<NotificationTemplate[]>('/notification-templates'),
  createNotificationTemplate: (payload: { id: string; type: string; name: string; subject?: string; body?: string; trigger?: string; sender?: string; status?: string }) =>
    apiFetch<NotificationTemplate>('/notification-templates', { method: 'POST', body: JSON.stringify(payload) }),
  exportJobs: () => apiFetch<ExportJob[]>('/export-jobs'),
  createExportJob: (payload: { id?: string; name: string; template: string; desc?: string; format: string; fileName?: string; by?: string; size?: string; at?: string; status?: string }) =>
    apiFetch<ExportJob>('/export-jobs', { method: 'POST', body: JSON.stringify(payload) }),
  downloadExport: async (id: string, fileName: string) => {
    const token = getAccessToken();
    const headers = new Headers();
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const response = await fetch(`${API_BASE}/export-jobs/${id}/download`, {
      headers,
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Download failed');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
  coupons: () => apiFetch<Coupon[]>('/coupons'),
  createCoupon: (payload: { code: string; plan?: string; discount?: string; redeemed?: number; cap?: number; expires?: string; status?: string }) =>
    apiFetch<Coupon>('/coupons', { method: 'POST', body: JSON.stringify(payload) }),
  ecommerceProducts: () => apiFetch<EcommerceProduct[]>('/ecommerce/products'),
  createEcommerceProduct: (payload: { sku: string; name: string; category?: string; price: number; stock: number; sold?: number; status?: string }) =>
    apiFetch<EcommerceProduct>('/ecommerce/products', { method: 'POST', body: JSON.stringify(payload) }),
  ecommerceOrders: () => apiFetch<EcommerceOrder[]>('/ecommerce/orders'),
  complaints: () => apiFetch<Complaint[]>('/complaints'),
  gateways: () => apiFetch<GatewayData>('/gateways'),
  promotions: () => apiFetch<Promotion[]>('/promotions'),
  getMe: () => apiFetch<UserProfile>('/users/me'),
  updateDismissedNotifications: (dismissedNotifications: string[]) =>
    apiFetch<UserProfile>('/users/me/dismissed-notifications', {
      method: 'PUT',
      body: JSON.stringify({ dismissedNotifications }),
    }),
};
