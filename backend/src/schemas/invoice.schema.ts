import { z } from 'zod';

const invoiceBody = z.object({
  id: z.string().min(1),
  customer: z.string().min(1),
  community: z.string().optional(),
  plate: z.string().optional(),
  plan: z.string().optional(),
  subtotal: z.number().optional(),
  vat: z.number().optional(),
  total: z.number().optional(),
  status: z.string().optional(),
  date: z.string().optional(),
});

export const createInvoiceSchema = z.object({
  body: invoiceBody,
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const updateInvoiceSchema = z.object({
  body: invoiceBody.partial(),
  query: z.object({}).passthrough(),
  params: z.object({ id: z.string().min(1) }),
});

export type InvoiceBody = z.infer<typeof invoiceBody>;
