/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

import { type User } from "@/features/users/types";
import {
  type AspNetEnvelope,
  type AspNetPagedResult,
  type LaravelDataTableResponse,
} from "@/core/types/api";
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

type Role = {
  id: string;
  isDeleted: boolean;
  name: string;
  type: number;
};

export const endpoints = {
  auth: authEndpoints,
  roles: {
    list: {
      path: "/Role",
      method: "GET",
      requiresAuth: true,
    } as EndpointDef<
      Record<string, unknown> | undefined,
      AspNetEnvelope<AspNetPagedResult<Role>> | AspNetPagedResult<Role> | Role[] | LaravelDataTableResponse<Role>
    >,
  },
  users: {
    list: {
      path: "/User",
      method: "GET",
      requiresAuth: true,
    } as EndpointDef<
      Record<string, unknown> | undefined,
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
} as const;

export type EndpointKey = keyof typeof endpoints;
