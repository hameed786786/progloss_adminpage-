import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/hooks/api';

const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL as string | undefined) ?? '';

const channelToQueryKeys: Record<string, readonly (readonly unknown[])[]> = {
  'customers:update': [queryKeys.customers, queryKeys.dashboard, queryKeys.analytics, queryKeys.rolePermissions('Super Admin')],
  'staff:update': [queryKeys.staff, queryKeys.dashboard],
  'invoices:update': [queryKeys.invoices, queryKeys.dashboard, queryKeys.analytics, queryKeys.payments, queryKeys.creditNotes],
  'plans:update': [queryKeys.plans, queryKeys.dashboard, queryKeys.analytics, queryKeys.rolePermissions('Super Admin')],
  'payments:update': [queryKeys.payments, queryKeys.dashboard, queryKeys.analytics, queryKeys.invoices],
  'tickets:update': [queryKeys.tickets, queryKeys.dashboard, queryKeys.complaints],
  'roles:update': [queryKeys.roles],
  'apartments:update': [queryKeys.apartments, queryKeys.dashboard, queryKeys.analytics],
  'workOrders:update': [queryKeys.workOrders, queryKeys.dashboard],
  'audit:update': [queryKeys.audit],
  'creditNotes:update': [queryKeys.creditNotes, queryKeys.dashboard],
  'coupons:update': [queryKeys.coupons, queryKeys.dashboard],
  'notificationTemplates:update': [queryKeys.notificationTemplates],
  'exportJobs:update': [queryKeys.exportJobs],
  'complaints:update': [queryKeys.complaints, queryKeys.dashboard, queryKeys.analytics],
  'ecommerceProducts:update': [queryKeys.ecommerceProducts],
  'ecommerceOrders:update': [queryKeys.ecommerceOrders],
  'gateways:update': [queryKeys.gateways, queryKeys.payments],
  'gatewayEvents:update': [queryKeys.gateways, queryKeys.payments],
  'vehicles:update': [queryKeys.vehicles, queryKeys.customers, queryKeys.dashboard],
  'dashboard:update': [queryKeys.dashboard],
  'analytics:update': [queryKeys.analytics, queryKeys.dashboard],
};

export function useRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!SOCKET_URL || typeof window === 'undefined') return;

    let socket: { on: (e: string, cb: () => void) => void; disconnect: () => void } | null = null;
    let cancelled = false;

    void import('socket.io-client').then(({ io }) => {
      if (cancelled) return;
      socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
      for (const [channel, keys] of Object.entries(channelToQueryKeys)) {
        socket.on(channel, (payload?: any) => {
          try {
            const uniqueKeys = [...new Set(keys.map((key) => JSON.stringify(key)))].map((serialized) => JSON.parse(serialized) as readonly unknown[]);

            // If the server sent full data, update the cache directly for the primary key
            if (payload && typeof payload === 'object' && !Array.isArray(payload) && Object.keys(payload).length > 0) {
              void queryClient.setQueryData(keys[0], (old: any) => {
                if (old === undefined) return undefined;
                // if payload is single doc, try to merge into array cache
                if (Array.isArray(old)) {
                  const idx = old.findIndex((o: any) => o.id === payload.id || o._id === payload._id);
                  if (idx === -1) return [payload, ...old];
                  const copy = [...old]; copy[idx] = { ...copy[idx], ...payload }; return copy;
                }
                return payload;
              });
            }

            for (const queryKey of uniqueKeys) {
              void queryClient.invalidateQueries({ queryKey });
            }
          } catch (e) {
            for (const queryKey of keys) {
              void queryClient.invalidateQueries({ queryKey });
            }
          }
        });
      }
    });

    return () => {
      cancelled = true;
      socket?.disconnect();
    };
  }, [queryClient]);
}
