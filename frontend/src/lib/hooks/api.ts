import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const queryKeys = {
  customers: ['customers'] as const,
  customer: (id: string) => ['customers', id] as const,
  invoices: ['invoices'] as const,
  invoice: (id: string) => ['invoices', id] as const,
  plans: ['plans'] as const,
  staff: ['staff'] as const,
  payments: ['payments'] as const,
  tickets: ['tickets'] as const,
  workOrders: ['workOrders'] as const,
  apartments: ['apartments'] as const,
  vehicles: ['vehicles'] as const,
  audit: ['audit'] as const,
  dashboard: (range?: string) => ['dashboard', range] as const,
  analytics: ['analytics'] as const,
  roles: ['roles'] as const,
  rolePermissions: (name: string) => ['roles', name, 'permissions'] as const,
  creditNotes: ['creditNotes'] as const,
  notificationTemplates: ['notificationTemplates'] as const,
  exportJobs: ['exportJobs'] as const,
  coupons: ['coupons'] as const,
  ecommerceProducts: ['ecommerceProducts'] as const,
  ecommerceOrders: ['ecommerceOrders'] as const,
  complaints: ['complaints'] as const,
  gateways: ['gateways'] as const,
  promotions: ['promotions'] as const,
  me: ['me'] as const,
};

export const useCustomers = () => useQuery({ queryKey: queryKeys.customers, queryFn: api.customers });
export const useCustomer = (id: string) =>
  useQuery({ queryKey: queryKeys.customer(id), queryFn: () => api.customer(id), enabled: Boolean(id) });
export const useInvoices = () => useQuery({ queryKey: queryKeys.invoices, queryFn: api.invoices });
export const useInvoice = (id: string) =>
  useQuery({ queryKey: queryKeys.invoice(id), queryFn: () => api.invoice(id), enabled: Boolean(id) });
export const usePlans = () => useQuery({ queryKey: queryKeys.plans, queryFn: api.plans });
export const useStaff = () => useQuery({ queryKey: queryKeys.staff, queryFn: api.staff });
export const usePayments = () => useQuery({ queryKey: queryKeys.payments, queryFn: api.payments });
export const useTickets = () => useQuery({ queryKey: queryKeys.tickets, queryFn: api.tickets });
export const useApartments = () => useQuery({ queryKey: queryKeys.apartments, queryFn: api.apartments });
export const useWorkOrders = () => useQuery({ queryKey: queryKeys.workOrders, queryFn: api.workOrders });
export const useVehicles = () => useQuery({ queryKey: queryKeys.vehicles, queryFn: api.vehicles });
export const useAudit = () => useQuery({ queryKey: queryKeys.audit, queryFn: api.audit });
export const useDashboard = (range?: string) => useQuery({ queryKey: queryKeys.dashboard(range), queryFn: () => api.dashboard(range) });
export const useAnalytics = () => useQuery({ queryKey: queryKeys.analytics, queryFn: api.analytics });
export const useRoles = () => useQuery({ queryKey: queryKeys.roles, queryFn: api.roles });
export const useRolePermissions = (name: string) =>
  useQuery({
    queryKey: queryKeys.rolePermissions(name),
    queryFn: () => api.rolePermissions(name),
    enabled: Boolean(name),
  });
export const useCreditNotes = () => useQuery({ queryKey: queryKeys.creditNotes, queryFn: api.creditNotes });
export const useNotificationTemplates = () =>
  useQuery({ queryKey: queryKeys.notificationTemplates, queryFn: api.notificationTemplates });
export const useExportJobs = () => useQuery({ queryKey: queryKeys.exportJobs, queryFn: api.exportJobs });
export const useCoupons = () => useQuery({ queryKey: queryKeys.coupons, queryFn: api.coupons });
export const useEcommerceProducts = () =>
  useQuery({ queryKey: queryKeys.ecommerceProducts, queryFn: api.ecommerceProducts });
export const useEcommerceOrders = () =>
  useQuery({ queryKey: queryKeys.ecommerceOrders, queryFn: api.ecommerceOrders });
export const useComplaints = () => useQuery({ queryKey: queryKeys.complaints, queryFn: api.complaints });
export const useGateways = () => useQuery({ queryKey: queryKeys.gateways, queryFn: api.gateways });
export const usePromotions = () => useQuery({ queryKey: queryKeys.promotions, queryFn: api.promotions });
export const useMe = () => useQuery({ queryKey: queryKeys.me, queryFn: api.getMe });

export function useInvalidateAll() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries();
}
