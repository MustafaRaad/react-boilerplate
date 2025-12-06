/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

import { z } from "zod";
import { userSchema } from "@/features/users/schemas/user.schema";

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
