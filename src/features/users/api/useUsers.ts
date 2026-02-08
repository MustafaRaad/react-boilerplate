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
import type {
  User,
  UserFormData,
  UserUpdateData,
} from "@/features/users/types";

/**
 * User Model Hook (MCP Pattern)
 * Handles data fetching with automatic caching and refetching
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
 * Transform form data to API format
 * Centralized transformation logic for consistency
 */
const transformUserData = (data: UserFormData | UserUpdateData) => ({
  ...data,
  phone: data.phone_no,
  approved:
    data.approved !== undefined
      ? typeof data.approved === "boolean"
        ? data.approved
          ? 1
          : 0
        : data.approved
      : undefined,
  password: "password" in data && data.password ? data.password : undefined,
});

/**
 * User Protocol Factory (MCP Pattern)
 * Creates CRUD protocol with automatic cache invalidation
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
    create: transformUserData,
    update: transformUserData,
    delete: (id) => ({ id }),
  },
  invalidateQueries: [["users"]],
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
