import type { z } from "zod";
import type { AspNetEnvelope } from "@/core/types/api";
import {
  aspNetLoginResultSchema,
  authLoginFormSchema,
  changePasswordSchema,
  laravelLoginSchema,
  laravelRefreshSchema,
  resetPasswordSchema,
} from "@/features/auth/schemas/auth.schema";

export type Role = {
  id: string;
  name: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  roles: Role[];
};

export type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
  accessTokenType?: string; // Laravel: "bearer"
  accessExpiresAt?: number; // Laravel: timestamp in ms
  backend?: "aspnet" | "laravel";
};

export type LoginRequestAspNet = {
  email: string;
  password: string;
};

export type LoginRequestLaravel = {
  email: string;
  password: string;
  type: "web";
};

export type LoginResultAspNet = z.infer<typeof aspNetLoginResultSchema>;
export type LoginResultLaravel = z.infer<typeof laravelLoginSchema>;

export type RefreshRequestAspNet = {
  refreshToken: string;
};

export type RefreshResultAspNet = LoginResultAspNet;

export type RefreshRequestLaravel = Record<string, never>; // Empty body, uses Authorization header

export type RefreshResultLaravel = z.infer<typeof laravelRefreshSchema>;

export type MeResponse = AspNetEnvelope<AuthUser>;

// Form-related types
export type LoginFormValues = z.infer<typeof authLoginFormSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
