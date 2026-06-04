import { z } from 'zod';

const userBody = z.object({
  email: z.string().email('Valid email is required'),
  name: z.string().optional().or(z.literal('')),
  passwordHash: z.string().min(6, 'Password hash is required'),
  role: z.string().optional(),
  meta: z.any().optional(),
});

export const createUserSchema = z.object({
  body: userBody,
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const updateUserSchema = z.object({
  body: userBody.partial(),
  query: z.object({}).passthrough(),
  params: z.object({ id: z.string().optional() }).partial().passthrough(),
});

export type UserBody = z.infer<typeof userBody>;
