import { type EndpointDef } from "@/core/api/endpoints";
import {
  type AuthLoginRequest,
  type AuthMeResponse,
  type AuthTokens,
  type LaravelLoginRequest,
} from "@/features/auth/types/auth.types";

export const authEndpoints = {
  login: {
    path: "/auth/login",
    method: "POST",
  } as EndpointDef<AuthLoginRequest, AuthTokens>,
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
