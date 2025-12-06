import { useApiQuery } from "@/core/api/hooks";
import { backendKind } from "@/core/config/env";
import { formatPaginationParams } from "@/core/api/normalizers";
import { type PagedResult } from "@/core/types/api";
import { useSearch } from "@tanstack/react-router";

type DataTableQueryOptions<TData> = {
  queryKey: readonly unknown[];
  queryFn: (params: {
    page: number;
    pageSize: number;
    query: Record<string, unknown>;
  }) => Promise<PagedResult<TData>>;
  additionalQuery?: Record<string, unknown>;
  enabled?: boolean;
};

/**
 * Hook that manages data fetching for DataTable with centralized pagination.
 * Automatically reads page/pageSize from URL params and formats them based on backend type.
 * 
 * @example
 * const usersQuery = useDataTableQuery({
 *   queryKey: ["users"],
 *   queryFn: async ({ page, pageSize, query }) => {
 *     return apiFetch(endpoints.users.list, { query });
 *   },
 * });
 */
export const useDataTableQuery = <TData>({
  queryKey,
  queryFn,
  additionalQuery = {},
  enabled = true,
}: DataTableQueryOptions<TData>) => {
  // Read pagination from URL search params
  const searchParams = useSearch({ strict: false }) as Record<string, unknown>;
  const page = Number(searchParams.page ?? 1);
  const pageSize = Number(searchParams.pageSize ?? 10);

  // Format query params based on backend type using centralized normalizer
  const formattedQuery = {
    ...formatPaginationParams(page, pageSize, backendKind),
    ...additionalQuery,
  };

  return useApiQuery<PagedResult<TData>>({
    queryKey: [...queryKey, backendKind, page, pageSize, additionalQuery],
    queryFn: async () => {
      return queryFn({
        page,
        pageSize,
        query: formattedQuery,
      });
    },
    enabled,
  });
};
