/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 * 
 * MCP Model Factory
 * Creates reusable model hooks following the Model-Component-Protocol pattern
 * Provides automatic caching, refetching, and error handling
 */

import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import type { PagedResult } from "@/core/types/api";

/**
 * Model configuration for data fetching
 */
export interface ModelConfig<TData> {
  queryKey: readonly unknown[];
  queryFn: () => Promise<PagedResult<TData> | TData[] | TData | null | undefined>;
  staleTime?: number;
  refetchInterval?: number;
  refetchIntervalInBackground?: boolean;
  enabled?: boolean;
  select?: (data: PagedResult<TData> | TData[] | TData | null | undefined) => unknown;
}

/**
 * Creates a model hook following MCP pattern
 * 
 * @example
 * ```typescript
 * const useUserModel = createModel<User>({
 *   queryKey: ["users"],
 *   queryFn: async () => apiFetch(endpoints.users.list),
 *   staleTime: 5 * 60 * 1000,
 *   refetchInterval: 30000,
 * });
 * ```
 */
export function createModel<TData>(
  config: ModelConfig<TData>
): () => UseQueryResult<PagedResult<TData> | TData[] | TData | null | undefined, Error> {
  return () => {
    return useQuery({
      queryKey: config.queryKey,
      queryFn: config.queryFn,
      staleTime: config.staleTime ?? 5 * 60 * 1000, // 5 minutes default
      refetchInterval: config.refetchInterval,
      refetchIntervalInBackground: config.refetchIntervalInBackground ?? true,
      enabled: config.enabled ?? true,
      select: config.select,
    } as UseQueryOptions<PagedResult<TData> | TData[] | TData | null | undefined, Error>);
  };
}

/**
 * Creates a model hook that wraps an existing query result
 * Useful for transforming or combining existing queries
 * 
 * @example
 * ```typescript
 * const baseQuery = useUsers();
 * const transformedModel = useModelFromQuery(["users-transformed"], baseQuery);
 * ```
 */
export function useModelFromQuery<TData>(
  queryKey: readonly unknown[],
  queryResult: UseQueryResult<PagedResult<TData> | TData[] | TData | null | undefined, Error>,
  options?: {
    staleTime?: number;
    refetchInterval?: number;
  }
): UseQueryResult<PagedResult<TData> | TData[] | TData | null | undefined, Error> {
  return useQuery({
    queryKey,
    queryFn: async () => queryResult.data,
    enabled: !!queryResult.data,
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
    refetchInterval: options?.refetchInterval,
    refetchIntervalInBackground: true,
  });
}
