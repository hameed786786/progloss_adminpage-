import { z } from 'zod';

const exportJobBody = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  template: z.string().optional(),
  desc: z.string().optional(),
  format: z.string().optional(),
  fileName: z.string().optional(),
  by: z.string().optional(),
  size: z.string().optional(),
  at: z.string().optional(),
  status: z.string().optional(),
});

export const createExportJobSchema = z.object({
  body: exportJobBody,
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const updateExportJobSchema = z.object({
  body: exportJobBody.partial(),
  query: z.object({}).passthrough(),
  params: z.object({ id: z.string().min(1) }),
});

export type ExportJobBody = z.infer<typeof exportJobBody>;
