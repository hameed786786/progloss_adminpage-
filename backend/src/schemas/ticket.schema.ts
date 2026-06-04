import { z } from 'zod';

const ticketBody = z.object({
  id: z.string().min(1),
  subject: z.string().min(1),
  customer: z.string().min(1),
  priority: z.string().optional(),
  status: z.string().optional(),
  sla: z.string().optional(),
  assigned: z.string().optional(),
  created: z.string().optional(),
});

export const createTicketSchema = z.object({
  body: ticketBody,
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const updateTicketSchema = z.object({
  body: ticketBody.partial(),
  query: z.object({}).passthrough(),
  params: z.object({ id: z.string().min(1) }),
});

export type TicketBody = z.infer<typeof ticketBody>;
