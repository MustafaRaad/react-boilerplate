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
    path: "/api/v1/Authentication/login",
    method: "POST",
    tags: ["Authentication"],
    description: "Login via phone number and password. Supports Accept-Language header for localization.",
  } as EndpointDef<AuthLoginRequest, AuthTokens>,
  requestForgotPassword: {
    path: "/api/v1/Authentication/request-forgot-password",
    method: "POST",
  } as EndpointDef<{ email: string } | { phoneNumber: string }, { message?: string }>,
  verifyForgotPassword: {
    path: "/api/v1/Authentication/verify-forgot-password",
    method: "POST",
  } as EndpointDef<
    { token: string; newPassword: string; confirmPassword: string },
    { message?: string }
  >,
  loginViaPhoneNumber: {
    path: "/api/v1/Authentication/login/via-phone-number",
    method: "POST",
  } as EndpointDef<AuthLoginRequest, AuthTokens>,
  loginViaUsername: {
    path: "/api/v1/Authentication/login/via-username",
    method: "POST",
  } as EndpointDef<AuthLoginRequest, AuthTokens>,
  resendOtp: {
    path: "/api/v1/Authentication/resend-otp",
    method: "POST",
  } as EndpointDef<{ phoneNumber?: string; email?: string }, { message?: string }>,
  verifyOtp: {
    path: "/api/v1/Authentication/login/verify-otp",
    method: "POST",
  } as EndpointDef<
    { phoneNumber?: string; email?: string; otp: string },
    AuthTokens
  >,
  revokeAllSessions: {
    path: "/api/v1/Authentication/revoke-all-sessions",
    method: "POST",
    requiresAuth: true,
  } as EndpointDef<void, { message?: string }>,
  rotateRefreshToken: {
    path: "/api/v1/Authentication/rotate-refresh-token",
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
