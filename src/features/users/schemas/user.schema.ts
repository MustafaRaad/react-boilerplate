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
 * User form schema for create/edit
 * Error messages are translation keys that will be resolved at runtime
 */
export const createUserFormSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(2, t("validation.nameMinLength")),
    email: z.string().email(t("validation.invalidEmail")),
    password: z.string().min(6, t("validation.passwordMinLength")),
    phone_no: z
      .string()
      .min(10, t("validation.phoneMinLength"))
      .max(15, t("validation.phoneMaxLength")),
    role: z.string().min(1, t("validation.roleRequired")),
    approved: z.boolean().default(true),
  });

/**
 * User update schema (all fields optional except id)
 */
export const createUserUpdateSchema = (t: (key: string) => string) =>
  z.object({
    id: z.number(),
    name: z.string().min(2, t("validation.nameMinLength")).optional(),
    email: z.string().email(t("validation.invalidEmail")).optional(),
    password: z.string().min(6, t("validation.passwordMinLength")).optional(),
    phone_no: z
      .string()
      .min(10, t("validation.phoneMinLength"))
      .max(15, t("validation.phoneMaxLength"))
      .optional(),
    role: z.string().optional(),
    approved: z.number().int().min(0).max(1).optional(),
  });

export type User = z.infer<typeof userSchema>;
export type UserFormData = z.infer<ReturnType<typeof createUserFormSchema>>;
export type UserUpdateData = z.infer<ReturnType<typeof createUserUpdateSchema>>;
