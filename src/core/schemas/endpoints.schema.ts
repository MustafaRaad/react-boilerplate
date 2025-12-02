import { z } from "zod";

export const roleSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  email_verified_at: z.string().nullable(),
  phone_no: z.string(),
  approved: z.number(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
  role: z.string(), // Single role name from Laravel
  roles: z.array(roleSchema).optional().default([]), // Optional for compatibility
});

export const aspNetEnvelopeSchema = z.object({
  code: z.number(),
  message: z.string().nullable(),
  error: z.unknown().nullable(),
  result: z.unknown().nullable(),
});

export const aspNetPagedResultSchema = z.object({
  code: z.union([z.string(), z.number()]).optional(),
  totalPages: z.number(),
  totalCount: z.number(),
  hasPreviousPage: z.boolean(),
  hasNextPage: z.boolean(),
  items: z.array(z.unknown()),
});

export const aspNetPagedUsersSchema = aspNetPagedResultSchema.extend({
  items: z.array(userSchema),
});

export const laravelDataTableSchema = z.object({
  draw: z.number(),
  recordsTotal: z.number(),
  recordsFiltered: z.number(),
  data: z.array(z.unknown()),
});

export type AspNetEnvelope = z.infer<typeof aspNetEnvelopeSchema>;
export type AspNetPagedResult<T = unknown> = Omit<
  z.infer<typeof aspNetPagedResultSchema>,
  "items"
> & { items: T[] };
export type AspNetPagedUsers = z.infer<typeof aspNetPagedUsersSchema>;
export type LaravelDataTable<T = unknown> = {
  draw: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: T[];
};
