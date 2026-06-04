import { z } from 'zod';

const paymentBody = z.object({
  id: z.string().min(1),
  method: z.string().min(1),
  customer: z.string().min(1),
  gateway: z.string().optional(),
  amount: z.number().optional(),
  status: z.string().optional(),
  date: z.string().optional(),
});

export const createPaymentSchema = z.object({
  body: paymentBody,
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const updatePaymentSchema = z.object({
  body: paymentBody.partial(),
  query: z.object({}).passthrough(),
  params: z.object({ id: z.string().min(1) }),
});

export type PaymentBody = z.infer<typeof paymentBody>;
