import { z } from 'zod';

const roleBody = z.object({
  name: z.string().min(1),
  desc: z.string().optional(),
  matrix: z.any().optional(),
});

export const createRoleSchema = z.object({
  body: roleBody,
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const updateRoleSchema = z.object({
  body: roleBody.partial(),
  query: z.object({}).passthrough(),
  params: z.object({ name: z.string().min(1) }),
});

export type RoleBody = z.infer<typeof roleBody>;
