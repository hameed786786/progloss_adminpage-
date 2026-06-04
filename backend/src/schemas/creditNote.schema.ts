import { z } from 'zod';

const creditNoteBody = z.object({
  id: z.string().min(1),
  invoice: z.string().min(1),
  customer: z.string().min(1),
  reason: z.string().optional(),
  amount: z.number().optional(),
  vat: z.number().optional(),
  total: z.number().optional(),
  issued: z.string().optional(),
  status: z.string().optional(),
});

export const createCreditNoteSchema = z.object({
  body: creditNoteBody,
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const updateCreditNoteSchema = z.object({
  body: creditNoteBody.partial(),
  query: z.object({}).passthrough(),
  params: z.object({ id: z.string().min(1) }),
});

export type CreditNoteBody = z.infer<typeof creditNoteBody>;
