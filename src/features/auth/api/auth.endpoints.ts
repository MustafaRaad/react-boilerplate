/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

import { type EndpointDef } from "@/core/api/endpoints";
import {
  type AuthLoginRequest,
  type AuthMeResponse,
  type AuthTokens,
  type LaravelLoginRequest,
} from "@/features/auth/types/auth.types";

export const authEndpoints = {
  login: {
    path: "/Authentication/login",
    method: "POST",
    tags: ["Authentication"],
    description: "Login via phone number and password. Requires clientId and fingerprintHash.",
  } as EndpointDef<AuthLoginRequest, AuthTokens>,
  requestForgotPassword: {
    path: "/Authentication/request-forgot-password",
    method: "POST",
  } as EndpointDef<{ email: string } | { phoneNumber: string }, { message?: string }>,
  verifyForgotPassword: {
    path: "/Authentication/verify-forgot-password",
    method: "POST",
  } as EndpointDef<
    { token: string; newPassword: string; confirmPassword: string },
    { message?: string }
  >,
  loginViaUsername: {
    path: "/Authentication/login/via-username",
    method: "POST",
    tags: ["Authentication"],
    description: "Login via username and password. Requires clientId and fingerprintHash.",
  } as EndpointDef<AuthLoginRequest, AuthTokens>,
  resendOtp: {
    path: "/Authentication/resend-otp",
    method: "POST",
  } as EndpointDef<{ phoneNumber?: string; email?: string }, { message?: string }>,
  verifyOtp: {
    path: "/Authentication/login/verify-otp",
    method: "POST",
  } as EndpointDef<
    { phoneNumber?: string; email?: string; otp: string },
    AuthTokens
  >,
  revokeAllSessions: {
    path: "/Authentication/revoke-all-sessions",
    method: "POST",
    requiresAuth: true,
  } as EndpointDef<void, { message?: string }>,
  rotateRefreshToken: {
    path: "/Authentication/rotate-refresh-token",
    method: "POST",
  } as EndpointDef<{ refreshToken: string }, AuthTokens>,
  refresh: {
    path: "/auth/refresh",
    method: "POST",
  } as EndpointDef<LaravelLoginRequest, AuthTokens>,
  me: {
    path: "/auth/me",
    method: "POST",
    requiresAuth: true,
  } as EndpointDef<void, AuthMeResponse>,
} as const;
