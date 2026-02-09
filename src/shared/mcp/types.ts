/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 * 
 * MCP Pattern Type Definitions
 * Shared types for Model-Component-Protocol pattern
 */

import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";
import type { PagedResult } from "@/core/types/api";

/**
 * Model query result type
 */
export type ModelResult<TData> = UseQueryResult<
  PagedResult<TData> | TData[] | TData | null | undefined,
  Error
>;

/**
 * Protocol mutation result type
 */
export type ProtocolMutationResult<TData, TVariables> = UseMutationResult<
  TData,
  unknown,
  TVariables,
  unknown
>;

/**
 * CRUD Protocol interface
 */
export interface CRUDProtocol<TCreate, TUpdate, TDelete = number | string> {
  create: (
    options?: {
      onSuccess?: (data: unknown, variables: TCreate) => void | Promise<void>;
      onError?: (error: unknown, variables: TCreate) => void | Promise<void>;
    }
  ) => ProtocolMutationResult<unknown, TCreate>;
  update: (
    options?: {
      onSuccess?: (data: unknown, variables: TUpdate) => void | Promise<void>;
      onError?: (error: unknown, variables: TUpdate) => void | Promise<void>;
    }
  ) => ProtocolMutationResult<unknown, TUpdate>;
  delete: (
    options?: {
      onSuccess?: (data: unknown, variables: TDelete) => void | Promise<void>;
      onError?: (error: unknown, variables: TDelete) => void | Promise<void>;
    }
  ) => ProtocolMutationResult<unknown, TDelete>;
}
