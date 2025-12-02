import { type EndpointDef } from "@/core/api/endpoints";
import {
  type LoginRequestAspNet,
  type LoginRequestLaravel,
  type LoginResultAspNet,
  type LoginResultLaravel,
  type RefreshRequestAspNet,
  type RefreshRequestLaravel,
  type RefreshResultAspNet,
  type RefreshResultLaravel,
  type AuthUser,
} from "@/features/auth/types/auth.types";
import { type AspNetEnvelope } from "@/core/types/api";

export const authEndpoints = {
  loginAspNet: {
    path: "/auth/login",
    method: "POST",
  } as EndpointDef<LoginRequestAspNet, AspNetEnvelope<LoginResultAspNet>>,
  loginLaravel: {
    path: "/auth/login",
    method: "POST",
  } as EndpointDef<LoginRequestLaravel, LoginResultLaravel>,
  refreshAspNet: {
    path: "/auth/refresh",
    method: "POST",
  } as EndpointDef<RefreshRequestAspNet, AspNetEnvelope<RefreshResultAspNet>>,
  refreshLaravel: {
    path: "/auth/refresh",
    method: "POST",
    requiresAuth: true,
  } as EndpointDef<RefreshRequestLaravel, RefreshResultLaravel>,
  me: {
    path: "/auth/me",
    method: "POST",
    requiresAuth: true,
  } as EndpointDef<void, AspNetEnvelope<AuthUser>>,
} as const;
