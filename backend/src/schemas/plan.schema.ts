import { z } from 'zod';

const planBody = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.number().optional(),
  freq: z.string().optional(),
  washes: z.number().optional(),
  vehicles: z.number().optional(),
  perks: z.array(z.string()).optional(),
  active: z.number().optional(),
});

export const createPlanSchema = z.object({
  body: planBody,
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const updatePlanSchema = z.object({
  body: planBody.partial(),
  query: z.object({}).passthrough(),
  params: z.object({ id: z.string().min(1) }),
});

export type PlanBody = z.infer<typeof planBody>;
