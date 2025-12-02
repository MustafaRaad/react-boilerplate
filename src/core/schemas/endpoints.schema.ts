import { z } from "zod";

export const roleSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const userSchema = z.object({
  id: z.string().uuid().or(z.string()),
  name: z.string(),
  email: z.string().email(),
  roles: z.array(roleSchema).optional().default([]),
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

export const aspNetLoginResultSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  accessExpiresAtUtc: z.string(),
  refreshExpiresAtUtc: z.string(),
  sessionId: z.string(),
});

export const aspNetLoginEnvelopeSchema = aspNetEnvelopeSchema.extend({
  result: aspNetLoginResultSchema,
});

export const laravelDataTableSchema = z.object({
  draw: z.number(),
  recordsTotal: z.number(),
  recordsFiltered: z.number(),
  data: z.array(z.unknown()),
});

export const laravelLoginSchema = z.object({
  message: z.string(),
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
  refresh_token: z.string().optional(),
});

export type AspNetEnvelope = z.infer<typeof aspNetEnvelopeSchema>;
export type AspNetLoginResult = z.infer<typeof aspNetLoginResultSchema>;
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
export type LaravelLogin = z.infer<typeof laravelLoginSchema>;
