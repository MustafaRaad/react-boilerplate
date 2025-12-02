import { type User } from "@/features/users/types";
import { type Role } from "@/core/types/auth";
import {
  type AspNetEnvelope,
  type AspNetPagedResult,
  type LaravelDataTableResponse,
} from "@/core/types/api";
import { type UsersQuery } from "@/features/users/types";
import { type RolesQuery } from "@/features/roles/types";
import { authEndpoints } from "@/features/auth/api/auth.endpoints";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type EndpointDef<TRequest, TResponse> = {
  path: string;
  method: HttpMethod;
  requiresAuth?: boolean;
  description?: string;
  tags?: string[];
  __types?: { request: TRequest; response: TResponse };
};

export const endpoints = {
  auth: authEndpoints,
  users: {
    list: {
      path: "/users",
      method: "GET",
      requiresAuth: true,
    } as EndpointDef<
      UsersQuery | undefined,
      AspNetEnvelope<AspNetPagedResult<User>> | LaravelDataTableResponse<User>
    >,
    create: {
      path: "/users",
      method: "POST",
      requiresAuth: true,
    } as EndpointDef<Partial<User>, AspNetEnvelope<User>>,
    update: {
      path: "/users",
      method: "PUT",
      requiresAuth: true,
    } as EndpointDef<Partial<User>, AspNetEnvelope<User>>,
    delete: {
      path: "/users",
      method: "DELETE",
      requiresAuth: true,
    } as EndpointDef<{ id: string }, AspNetEnvelope<null>>,
  },
  roles: {
    list: {
      path: "/roles",
      method: "GET",
      requiresAuth: true,
    } as EndpointDef<
      RolesQuery | undefined,
      AspNetEnvelope<AspNetPagedResult<Role>> | LaravelDataTableResponse<Role>
    >,
  },
} as const;

export type EndpointKey = keyof typeof endpoints;
