import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/core/api/client";
import { endpoints } from "@/core/api/endpoints";
import { createDataTableHook } from "@/shared/hooks/createDataTableHook";
import {
  type User,
  type UserFormData,
  type UserUpdateData,
} from "@/features/users/types";

export const useUsers = createDataTableHook<User>(
  "users",
  endpoints.users.list
);

/**
 * Hook for creating a new user
 * Auto-handles success notifications and cache invalidation
 */
export function useCreateUser(options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UserFormData) => {
      return await apiFetch(endpoints.users.create, {
        body: {
          name: data.name,
          email: data.email,
          password: data.password || "defaultPassword123", // TODO: Handle password properly
          phone: data.phone_no, // API expects 'phone' but form uses 'phone_no'
          approved: data.approved ? 1 : 0,
          role: data.role,
        },
      });
    },
    onSuccess: () => {
      // Invalidate users list to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["users"] });
      options?.onSuccess?.();
    },
    onError: (error) => {
      console.error("Failed to create user:", error);
      options?.onError?.(error);
    },
  });
}

/**
 * Hook for updating an existing user
 * Auto-handles success notifications and cache invalidation
 */
export function useUpdateUser(options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UserUpdateData) => {
      return await apiFetch(endpoints.users.update, {
        body: {
          id: data.id,
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone_no, // API expects 'phone' but form uses 'phone_no'
          approved:
            data.approved !== undefined ? (data.approved ? 1 : 0) : undefined,
          role: data.role,
        },
      });
    },
    onSuccess: () => {
      // Invalidate users list and specific user cache
      queryClient.invalidateQueries({ queryKey: ["users"] });
      options?.onSuccess?.();
    },
    onError: (error) => {
      console.error("Failed to update user:", error);
      options?.onError?.(error);
    },
  });
}

/**
 * Hook for deleting a user
 * Auto-handles success notifications and cache invalidation
 */
export function useDeleteUser(options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      return await apiFetch(endpoints.users.delete, {
        body: { id: userId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      options?.onSuccess?.();
    },
    onError: (error) => {
      console.error("Failed to delete user:", error);
      options?.onError?.(error);
    },
  });
}
