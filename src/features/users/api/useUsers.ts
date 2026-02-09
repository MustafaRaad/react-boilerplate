/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 * 
 * Users API - MCP Pattern Implementation
 * Follows Model-Component-Protocol pattern for better performance and maintainability
 */

import { useMemo } from "react";
import { createDataTableHook } from "@/shared/hooks/createDataTableHook";
import { endpoints } from "@/core/api/endpoints";
import { createCRUDProtocol } from "@/shared/mcp/createProtocol";
import { transformUserToApi } from "../utils/userTransformers";
import type {
  User,
  UserFormData,
  UserUpdateData,
} from "@/features/users/types";

/**
 * User Model Hook (MCP Pattern)
 * Handles data fetching with automatic caching and refetching
 * 
 * @returns Query result with sorted data (newest first)
 */
export const useUsers = () => {
  const query = createDataTableHook<User>("users", endpoints.users.list)();

  // Memoized sorted data - performance optimization
  const sortedData = useMemo(() => {
    if (!query.data?.items) return query.data;

    // Sort by created_at descending (newest first)
    const sortedItems = [...query.data.items].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });

    return {
      ...query.data,
      items: sortedItems,
    };
  }, [query.data]);

  return {
    ...query,
    data: sortedData,
  };
};

/**
 * Optimistic update helper for user operations
 * Updates the cache immediately for better UX
 * Handles update and delete operations (create doesn't need optimistic update)
 */
function optimisticUserUpdater(
  old: unknown,
  variables: UserFormData | UserUpdateData | number
): unknown {
  if (!old || typeof old !== "object" || !("items" in old)) {
    return old;
  }

  const pagedResult = old as { items: User[]; rowCount?: number };

  // Delete operation - remove item from list
  if (typeof variables === "number") {
    return {
      ...pagedResult,
      items: pagedResult.items.filter((item) => item.id !== variables),
      rowCount: (pagedResult.rowCount ?? pagedResult.items.length) - 1,
    };
  }

  // Update operation - update item in list (must have id)
  if (typeof variables === "object" && "id" in variables) {
    const updateData = variables as UserUpdateData;
    return {
      ...pagedResult,
      items: pagedResult.items.map((item) =>
        item.id === updateData.id ? { ...item, ...updateData } : item
      ),
    };
  }

  // Create operation - no optimistic update needed (will be added after server response)
  return old;
}

/**
 * User Protocol Factory (MCP Pattern)
 * Creates CRUD protocol with automatic cache invalidation and optimistic updates
 */
const userProtocolFactory = createCRUDProtocol<
  UserFormData,
  UserUpdateData,
  number
>({
  queryKey: ["users"],
  endpoints: {
    create: endpoints.users.create,
    update: endpoints.users.update,
    delete: endpoints.users.delete,
  },
  transforms: {
    create: transformUserToApi,
    update: transformUserToApi,
    delete: (id) => ({ id }),
  },
  invalidateQueries: [["users"]],
  // Optimistic updates for better UX - instant feedback
  optimisticUpdate: {
    queryKey: ["users"],
    updater: optimisticUserUpdater,
  },
});

/**
 * User Protocol Hook (MCP Pattern)
 * Provides CRUD operations with automatic cache invalidation
 */
export const useUserProtocol = () => {
  return userProtocolFactory();
};

// Legacy exports for backward compatibility - maintain existing API
export const useCreateUser = (options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) => {
  const protocol = useUserProtocol();
  return protocol.create(options);
};

export const useUpdateUser = (options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) => {
  const protocol = useUserProtocol();
  return protocol.update(options);
};

export const useDeleteUser = (options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) => {
  const protocol = useUserProtocol();
  return protocol.delete(options);
};
