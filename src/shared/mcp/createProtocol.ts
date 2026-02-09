/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 * 
 * MCP Protocol Factory
 * Creates reusable protocol hooks for mutations following the Model-Component-Protocol pattern
 * Provides optimistic updates, cache invalidation, and error handling
 */

import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import type { EndpointDef } from "@/core/api/endpoints";
import { apiFetch } from "@/core/api/client";
import type { CRUDProtocol } from "./types";

/**
 * Protocol mutation configuration
 */
export interface ProtocolMutationConfig<TVariables, TData = unknown> {
  queryKey: readonly unknown[];
  endpoint: EndpointDef<unknown, unknown>;
  transform?: (data: TVariables) => unknown;
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
  onError?: (error: unknown, variables: TVariables) => void | Promise<void>;
  invalidateQueries?: readonly unknown[][];
  optimisticUpdate?: {
    queryKey: readonly unknown[];
    updater: (old: unknown, variables: TVariables) => unknown;
  };
}

/**
 * Creates a protocol hook for mutations
 * 
 * @example
 * ```typescript
 * const useUserProtocol = createProtocol({
 *   queryKey: ["users"],
 *   endpoint: endpoints.users.create,
 *   transform: (data) => ({ ...data, approved: data.approved ? 1 : 0 }),
 *   invalidateQueries: [["users"], ["dashboard"]],
 * });
 * ```
 */
export function createProtocol<TVariables, TData = unknown>(
  config: ProtocolMutationConfig<TVariables, TData>
) {
  return (options?: {
    onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
    onError?: (error: unknown, variables: TVariables) => void | Promise<void>;
  }) => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (data: TVariables) => {
        const transformed = config.transform ? config.transform(data) : data;
        return await apiFetch<TData>(config.endpoint, {
          body: transformed,
        });
      },
      onMutate: config.optimisticUpdate
        ? async (variables) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: config.optimisticUpdate!.queryKey });

            // Snapshot previous value
            const previous = queryClient.getQueryData(config.optimisticUpdate!.queryKey);

            // Optimistically update
            queryClient.setQueryData(
              config.optimisticUpdate!.queryKey,
              config.optimisticUpdate!.updater(previous, variables)
            );

            return { previous };
          }
        : undefined,
      onSuccess: async (data, variables) => {
        // Invalidate queries
        const queriesToInvalidate = config.invalidateQueries ?? [config.queryKey];
        await Promise.all(
          queriesToInvalidate.map((key) =>
            queryClient.invalidateQueries({ queryKey: key })
          )
        );

        // Call callbacks
        await config.onSuccess?.(data, variables);
        await options?.onSuccess?.(data, variables);
      },
      onError: async (error, variables, context: { previous?: unknown } | undefined) => {
        // Rollback optimistic update
        if (config.optimisticUpdate && context?.previous) {
          queryClient.setQueryData(config.optimisticUpdate.queryKey, context.previous);
        }

        // Call error callbacks
        await config.onError?.(error, variables);
        await options?.onError?.(error, variables);
      },
    } as UseMutationOptions<TData, unknown, TVariables, unknown>);
  };
}

/**
 * Creates a protocol with CRUD operations
 */
/**
 * Creates a CRUD protocol with type-safe operations
 * 
 * @template TCreate - Type for create operations
 * @template TUpdate - Type for update operations
 * @template TDelete - Type for delete operations (defaults to number | string)
 * 
 * @returns A hook that returns a CRUD protocol with create, update, and delete methods
 */
export function createCRUDProtocol<
  TCreate,
  TUpdate,
  TDelete = number | string
>(config: {
  queryKey: readonly unknown[];
  endpoints: {
    create: EndpointDef<unknown, unknown>;
    update: EndpointDef<unknown, unknown>;
    delete: EndpointDef<unknown, unknown>;
  };
  transforms?: {
    create?: (data: TCreate) => unknown;
    update?: (data: TUpdate) => unknown;
    delete?: (id: TDelete) => unknown;
  };
  invalidateQueries?: readonly unknown[][];
  optimisticUpdate?: {
    queryKey: readonly unknown[];
    updater: (old: unknown, variables: TCreate | TUpdate | TDelete) => unknown;
  };
}): () => CRUDProtocol<TCreate, TUpdate, TDelete> {
  return () => {
    const create = createProtocol<TCreate>({
      queryKey: config.queryKey,
      endpoint: config.endpoints.create,
      transform: config.transforms?.create,
      invalidateQueries: config.invalidateQueries,
      optimisticUpdate: config.optimisticUpdate
        ? {
            queryKey: config.optimisticUpdate.queryKey,
            updater: (old, variables) =>
              config.optimisticUpdate!.updater(old, variables as TCreate),
          }
        : undefined,
    });

    const update = createProtocol<TUpdate>({
      queryKey: config.queryKey,
      endpoint: config.endpoints.update,
      transform: config.transforms?.update,
      invalidateQueries: config.invalidateQueries,
      optimisticUpdate: config.optimisticUpdate
        ? {
            queryKey: config.optimisticUpdate.queryKey,
            updater: (old, variables) =>
              config.optimisticUpdate!.updater(old, variables as TUpdate),
          }
        : undefined,
    });

    const deleteMutation = createProtocol<TDelete>({
      queryKey: config.queryKey,
      endpoint: config.endpoints.delete,
      transform: config.transforms?.delete,
      invalidateQueries: config.invalidateQueries,
      optimisticUpdate: config.optimisticUpdate
        ? {
            queryKey: config.optimisticUpdate.queryKey,
            updater: (old, variables) =>
              config.optimisticUpdate!.updater(old, variables as TDelete),
          }
        : undefined,
    });

    return {
      create,
      update,
      delete: deleteMutation,
    };
  };
}
