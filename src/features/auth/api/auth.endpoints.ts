import { type EndpointDef } from "@/core/api/endpoints";
import {
  type LoginRequestLaravel,
  type MeResponse,
} from "@/features/auth/types/auth.types";
import { type AspNetEnvelope } from "@/core/types/api";

export const authEndpoints = {
  login: {
    path: "/auth/login",
    method: "POST",
  } as EndpointDef<LoginRequestLaravel, LoginResultLaravel>,
  me: {
    path: "/auth/me",
    method: "POST",
    requiresAuth: true,
  } as EndpointDef<void, MeResponse>,
} as const;
