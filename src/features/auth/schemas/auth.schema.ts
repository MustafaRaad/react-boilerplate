import { z } from "zod";

// FORM SCHEMAS
export const authLoginFormSchema = z.object({
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
    { path: ["confirmNewPassword"], message: "validation.password.mismatch" }
  );

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "validation.email.required" })
    .email({ message: "validation.email.invalid" }),
});

// BACKEND RESPONSE SCHEMAS
export const aspNetLoginResultSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  accessExpiresAtUtc: z.string(),
  refreshExpiresAtUtc: z.string(),
  sessionId: z.string(),
});

export const aspNetLoginEnvelopeSchema = z.object({
  code: z.union([z.number(), z.string()]),
  message: z.string().nullable(),
  error: z.unknown().nullable(),
  result: aspNetLoginResultSchema,
});

export const laravelLoginSchema = z.object({
  message: z.string(),
  access_token: z.string(),
  token_type: z.string(), // "bearer"
  expires_in: z.number(), // e.g. 43200
});

export const laravelRefreshSchema = z.object({
  message: z.string(), // "refresh successfully"
  access_token: z.string(),
  token_type: z.string(), // "bearer"
  expires_in: z.number(),
});

export const laravelMeSchema = z.object({
  fees: z.number(),
  pos: z.object({
    pos_name: z.string(),
    pos_lat: z.number(),
    pos_lng: z.number(),
    id: z.number(),
  }),
  user: z.object({
    id: z.number(),
    name: z.string().nullable(),
    email: z.string().nullable(),
    phone_no: z.string().nullable(),
  }),
  perm: z.array(z.string()),
});

export const aspNetMeSchema = z.object({
  id: z.string(),
  isDeleted: z.boolean(),
  username: z.string(),
  phoneNumber: z.string(),
  firstName: z.string(),
  secondName: z.string(),
  lastName: z.string(),
  surname: z.string(),
  fullName: z.string(),
  photo: z.string(),
  status: z.number(),
  role: z.object({
    id: z.string(),
    isDeleted: z.boolean(),
    name: z.string(),
  }),
});

export type AuthLoginFormValues = z.infer<typeof authLoginFormSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
