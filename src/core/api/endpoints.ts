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
      path: "/Users/ListUsers",
      method: "GET",
      requiresAuth: true,
    } as EndpointDef<
      UsersQuery | undefined,
      AspNetEnvelope<AspNetPagedResult<User>> | LaravelDataTableResponse<User>
    >,
    get: {
      path: "/Users/getUser",
      method: "GET",
      requiresAuth: true,
    } as EndpointDef<{ id: number }, User>,
    create: {
      path: "/Users/addUser",
      method: "POST",
      requiresAuth: true,
    } as EndpointDef<Partial<User>, AspNetEnvelope<User> | User>,
    update: {
      path: "/Users/updateUser",
      method: "PUT",
      requiresAuth: true,
    } as EndpointDef<Partial<User>, AspNetEnvelope<User> | User>,
    delete: {
      path: "/Users/deleteUser",
      method: "DELETE",
      requiresAuth: true,
    } as EndpointDef<{ id: number }, AspNetEnvelope<null> | null>,
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
