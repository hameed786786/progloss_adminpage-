import { z } from 'zod';

const staffStatuses = ['Cleaning', 'En Route', 'Available', 'Break', 'Offline'] as const;

const staffBody = z.object({
  id: z.string().min(1, 'Staff ID is required'),
  name: z.string().min(2, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  zone: z.string().min(1, 'Zone is required'),
  status: z.enum(staffStatuses),
  shift: z.string().optional().or(z.literal('')),
  plate: z.string().optional().or(z.literal('')),
  eta: z.string().optional().or(z.literal('')),
  building: z.string().optional().or(z.literal('')),
});

export const createStaffSchema = z.object({
  body: staffBody,
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
});

export const updateStaffSchema = z.object({
  body: staffBody.partial().extend({
    id: z.string().min(1).optional(),
  }),
  query: z.object({}).passthrough(),
  params: z.object({
    id: z.string().min(1, 'Staff ID is required'),
  }),
});

export type StaffStatus = z.infer<typeof staffBody>['status'];

export { staffStatuses };
