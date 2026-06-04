import { z } from 'zod';

const customerBody = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  community: z.string().optional(),
  vehicles: z.number().optional(),
  plan: z.string().optional(),
  status: z.string().optional(),
  since: z.preprocess(val => typeof val === 'string' && val ? new Date(val) : val, z.date().optional().nullable()),
  nextRenewal: z.preprocess(val => typeof val === 'string' && val ? new Date(val) : val, z.date().optional().nullable()),
  ltv: z.number().optional(),
  meta: z.any().optional(),
});

export const createCustomerSchema = z.object({
  body: customerBody,
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const updateCustomerSchema = z.object({
  body: customerBody.partial(),
  query: z.object({}).passthrough(),
  params: z.object({ id: z.string().min(1) }),
});

export type CustomerBody = z.infer<typeof customerBody>;
