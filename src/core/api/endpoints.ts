import { type User } from '@/features/users/types'
import { type Role } from '@/core/types/auth'
import {
  type AspNetEnvelope,
  type AspNetPagedResult,
  type LaravelDataTableResponse,
} from '@/core/types/api'
import {
  type AuthUser,
  type LoginRequestAspNet,
  type LoginRequestLaravel,
  type LoginResultAspNet,
  type LoginResultLaravel,
  type RefreshRequestAspNet,
  type RefreshRequestLaravel,
  type RefreshResultAspNet,
  type RefreshResultLaravel,
} from '@/core/types/auth'
import { type UsersQuery } from '@/features/users/types'
import { type RolesQuery } from '@/features/roles/types'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type EndpointDef<TRequest, TResponse> = {
  path: string
  method: HttpMethod
  requiresAuth?: boolean
  description?: string
  tags?: string[]
  __types?: { request: TRequest; response: TResponse }
}

export const endpoints = {
  auth: {
    loginAspNet: {
      path: '/auth/login',
      method: 'POST',
    } as EndpointDef<LoginRequestAspNet, AspNetEnvelope<LoginResultAspNet>>,
    loginLaravel: {
      path: '/login',
      method: 'POST',
    } as EndpointDef<LoginRequestLaravel, LoginResultLaravel>,
    refreshAspNet: {
      path: '/auth/refresh',
      method: 'POST',
    } as EndpointDef<RefreshRequestAspNet, AspNetEnvelope<RefreshResultAspNet>>,
    refreshLaravel: {
      path: '/auth/refresh',
      method: 'POST',
    } as EndpointDef<RefreshRequestLaravel, RefreshResultLaravel>,
    me: {
      path: '/me',
      method: 'GET',
      requiresAuth: true,
    } as EndpointDef<void, AspNetEnvelope<AuthUser>>,
  },
  users: {
    list: {
      path: '/users',
      method: 'GET',
      requiresAuth: true,
    } as EndpointDef<
      UsersQuery | undefined,
      AspNetEnvelope<AspNetPagedResult<User>> | LaravelDataTableResponse<User>
    >,
    create: {
      path: '/users',
      method: 'POST',
      requiresAuth: true,
    } as EndpointDef<Partial<User>, AspNetEnvelope<User>>,
    update: {
      path: '/users',
      method: 'PUT',
      requiresAuth: true,
    } as EndpointDef<Partial<User>, AspNetEnvelope<User>>,
    delete: {
      path: '/users',
      method: 'DELETE',
      requiresAuth: true,
    } as EndpointDef<{ id: string }, AspNetEnvelope<null>>,
  },
  roles: {
    list: {
      path: '/roles',
      method: 'GET',
      requiresAuth: true,
    } as EndpointDef<
      RolesQuery | undefined,
      AspNetEnvelope<AspNetPagedResult<Role>> | LaravelDataTableResponse<Role>
    >,
  },
} as const

export type EndpointKey = keyof typeof endpoints
