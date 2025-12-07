/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/core/api/client";
import { endpoints } from "@/core/api/endpoints";
import { createDataTableHook } from "@/shared/hooks/createDataTableHook";
import {
  type User,
  type UserFormData,
  type UserUpdateData,
} from "@/features/users/types";
import type { EndpointDef } from "@/core/api/endpoints";

export const useUsers = () => {
  const query = createDataTableHook<User>("users", endpoints.users.list)();

  // Sort data by created_at descending (newest first) after loading
  const sortedData = React.useMemo(() => {
    if (!query.data?.items) return query.data;

    const sortedItems = [...query.data.items].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA; // Descending order (newest first)
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
 * Generic mutation hook factory - DRY pattern for all CRUD operations
 * Eliminates code duplication across create/update/delete mutations
 */
function createMutationHook<TVariables>(
  queryKey: string,
  endpoint: EndpointDef<unknown, unknown>,
  transform?: (data: TVariables) => unknown
) {
  return (options?: {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
  }) => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (data: TVariables) => {
        return await apiFetch(endpoint, {
          body: transform ? transform(data) : data,
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
        options?.onSuccess?.();
      },
      onError: (error) => {
        console.error(`Mutation failed for ${queryKey}:`, error);
        options?.onError?.(error);
      },
    });
  };
}

/**
 * Transform form data to API format
 * Handles field mapping and data type conversions
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

// Mutation hooks using factory pattern
export const useCreateUser = createMutationHook<UserFormData>(
  "users",
  endpoints.users.create,
  transformUserData
);

export const useUpdateUser = createMutationHook<UserUpdateData>(
  "users",
  endpoints.users.update,
  transformUserData
);

export const useDeleteUser = createMutationHook<number>(
  "users",
  endpoints.users.delete,
  (userId) => ({ id: userId })
);
