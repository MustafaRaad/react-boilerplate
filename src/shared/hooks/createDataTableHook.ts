import { apiFetch } from "@/core/api/client";
import { useDataTableQuery } from "@/shared/hooks/useDataTableQuery";
import { backendKind } from "@/core/config/env";
import { type PagedResult } from "@/core/types/api";
import { type EndpointDef } from "@/core/api/endpoints";

/**
 * Factory function to create data table query hooks with automatic backend handling.
 *
 * Features:
 * - Automatically reads pagination from URL params
 * - Formats query params based on backend (Laravel vs ASP.NET)
 * - Supports additional filters for ASP.NET server-side filtering
 * - Handles client-side filtering for Laravel
 *
 * @param featureName - Feature name for query key (e.g., "users", "products")
 * @param endpoint - API endpoint definition
 * @param options - Optional configuration
 *
 * @example
 * // Simple usage without filters
 * export const useUsers = createDataTableHook("users", endpoints.users.list);
 *
 * @example
 * // With server-side filters (ASP.NET)
 * export const useProducts = createDataTableHook("products", endpoints.products.list, {
 *   filters: { category: "electronics", status: "active" }
 * });
 *
 * @example
 * // With client-side filter function (Laravel)
 * export const useOrders = createDataTableHook("orders", endpoints.orders.list, {
 *   clientFilter: (items, filters) => {
 *     if (!filters?.search) return items;
 *     return items.filter(item =>
 *       item.name.toLowerCase().includes(filters.search.toLowerCase())
 *     );
 *   }
 * });
 */
export const createDataTableHook = <
  TData,
  TFilters extends Record<string, unknown> = Record<string, unknown>
>(
  featureName: string,
  endpoint: EndpointDef<unknown, unknown>,
  options?: {
    /** Additional query filters (sent to server for ASP.NET, used for client filtering in Laravel) */
    filters?: TFilters;
    /** Client-side filter function for Laravel (items will be filtered before pagination) */
    clientFilter?: (items: TData[], filters?: TFilters) => TData[];
  }
) => {
  return (additionalFilters?: TFilters) => {
    const isAspNet = backendKind === "aspnet";
    const mergedFilters = {
      ...options?.filters,
      ...additionalFilters,
    } as TFilters;

    return useDataTableQuery<TData>({
      queryKey: [featureName, mergedFilters],
      queryFn: async ({ page, pageSize, query }) => {
        // For ASP.NET: send filters as query params for server-side filtering
        const queryParams = isAspNet ? { ...query, ...mergedFilters } : query;

        const response = await apiFetch<PagedResult<TData>>(endpoint, {
          query: queryParams,
        });

        // For Laravel: apply client-side filtering if provided
        if (
          !isAspNet &&
          (options?.clientFilter || Object.keys(mergedFilters).length > 0)
        ) {
          let filteredItems = response.items;

          // Apply custom filter function if provided
          if (options?.clientFilter) {
            filteredItems = options.clientFilter(filteredItems, mergedFilters);
          }

          // Calculate pagination for filtered results
          const offset = (page - 1) * pageSize;
          const pagedItems = filteredItems.slice(offset, offset + pageSize);

          return {
            items: pagedItems,
            currentPage: page,
            pageSize,
            rowCount: filteredItems.length,
            pageCount: Math.max(1, Math.ceil(filteredItems.length / pageSize)),
          };
        }

        return response;
      },
    });
  };
};
