import { z } from 'zod';

const notificationTemplateBody = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  name: z.string().min(1),
  subject: z.string().optional(),
  body: z.string().optional(),
  trigger: z.string().optional(),
  sender: z.string().optional(),
  status: z.string().optional(),
  sent: z.number().optional(),
  sent24h: z.number().optional(),
  open: z.number().optional(),
  click: z.number().optional(),
  delivered: z.number().optional(),
});

export const createNotificationTemplateSchema = z.object({
  body: notificationTemplateBody,
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const updateNotificationTemplateSchema = z.object({
  body: notificationTemplateBody.partial(),
  query: z.object({}).passthrough(),
  params: z.object({ id: z.string().min(1) }),
});

export type NotificationTemplateBody = z.infer<typeof notificationTemplateBody>;
