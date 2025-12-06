/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

import type { z } from "zod";
import { type BackendKind } from "@/core/types/api";
import {
  aspNetLoginResultSchema,
  aspNetMeSchema,
  authLoginFormSchema,
  changePasswordSchema,
  laravelLoginSchema,
  laravelMeSchema,
  laravelRefreshSchema,
  resetPasswordSchema,
} from "@/features/auth/schemas/auth.schema";

export type Role = {
  id: string;
  name: string;
};

export type AuthUser = {
  id: number | string;
  name: string | null;
  email: string | null;
  phoneNo: string | null;
  image?: string | null;
  role?: string | null;
  roles?: Role[];
  backend?: BackendKind;
};

export type AuthPos = {
  id: number;
  name: string;
  lat: number;
  lng: number;
};

export type LaravelMeResponse = z.infer<typeof laravelMeSchema>;
export type AspNetMeResponse = z.infer<typeof aspNetMeSchema>;
export type AspNetMeEnvelope = {
  code?: number | string | null;
  message?: string | null;
  result?: AspNetMeResponse | null;
};
export type AuthMeResponse =
  | LaravelMeResponse
  | AspNetMeResponse
  | AspNetMeEnvelope;

export type AuthTokens = {
  backend: BackendKind;
  accessToken: string;
  tokenType: string; // typically "bearer"
  expiresIn: number; // seconds
  accessTokenExpiresAt: number; // timestamp in ms
  refreshToken?: string | null;
  refreshTokenExpiresAt?: number | null;
};

export type AspNetLoginResult = z.infer<typeof aspNetLoginResultSchema>;

export type LaravelLoginRequest = {
  email: string;
  password: string;
  type: "web";
};

export type AspNetPhoneLoginRequest = {
  /** aspNet phone login */
  phoneNumber: string;
  password: string;
  clientId: string;
  fingerprintHash: string;
};

export type AspNetUsernameLoginRequest = {
  /** aspNet username login */
  username: string;
  password: string;
  clientId: string;
  fingerprintHash: string;
};

export type AuthLoginRequest =
  | LaravelLoginRequest
  | AspNetPhoneLoginRequest
  | AspNetUsernameLoginRequest;

export type LoginResultLaravel = z.infer<typeof laravelLoginSchema>;
export type RefreshResultLaravel = z.infer<typeof laravelRefreshSchema>;

// Form-related types
export type LoginFormValues = z.infer<typeof authLoginFormSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
