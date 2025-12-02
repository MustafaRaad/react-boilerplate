import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "validation.email.required" })
    .email({ message: "validation.email.invalid" }),
  password: z.string().min(6, { message: "validation.password.min" }),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, { message: "validation.password.min" }),
    newPassword: z.string().min(6, { message: "validation.password.min" }),
    confirmNewPassword: z.string().min(6, { message: "validation.password.min" }),
  })
  .refine(
    (data) => data.newPassword === data.confirmNewPassword,
    { path: ["confirmNewPassword"], message: "validation.password.mismatch" },
  );

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "validation.email.required" })
    .email({ message: "validation.email.invalid" }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
