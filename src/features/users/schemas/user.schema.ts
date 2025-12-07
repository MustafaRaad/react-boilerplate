/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

import { z } from "zod";

/**
 * User schema from backend API
 */
export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  email_verified_at: z.string().nullable(),
  phone_no: z.string(),
  approved: z.number().int().min(0).max(1), // 0 or 1 (boolean as integer)
  created_at: z.string(), // ISO date string
  updated_at: z.string(), // ISO date string
  role: z.string(),
});

/**
 * Shared user field validation rules
 * Used in both create and update schemas to avoid duplication
 */
const userFieldValidation = (t: (key: string) => string) => ({
  name: z.string().min(2, t("validation.nameMinLength")),
  email: z.string().email(t("validation.invalidEmail")),
  phone_no: z
    .string()
    .min(10, t("validation.phoneMinLength"))
    .max(15, t("validation.phoneMaxLength")),
  role: z.string().min(1, t("validation.roleRequired")),
  password: z.string().min(6, t("validation.passwordMinLength")),
  approved: z.number().int().min(0).max(1),
});

/**
 * User form schema for create
 * Includes password requirement and all mandatory fields
 */
export const userFormSchema = (t: (key: string) => string) =>
  z.object({
    ...userFieldValidation(t),
  });

/**
 * User update schema (all fields optional except id)
 * Reuses field validation but makes everything optional
 */
export const userUpdateFormSchema = (t: (key: string) => string) =>
  z.object({
    id: z.number(),
    ...(Object.fromEntries(
      Object.entries(userFieldValidation(t)).map(([key, schema]) => [
        key,
        (schema as z.ZodTypeAny).optional(),
      ])
    ) as unknown as ReturnType<typeof userFieldValidation>),
  });

export type User = z.infer<typeof userSchema>;
export type UserFormData = z.infer<ReturnType<typeof userFormSchema>>;
export type UserUpdateData = z.infer<ReturnType<typeof userUpdateFormSchema>>;
