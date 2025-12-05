import { endpoints } from "@/core/api/endpoints";
import { apiFetch } from "@/core/api/client";
import { useDataTableQuery } from "@/shared/hooks/useDataTableQuery";
import { type PagedResult } from "@/core/types/api";
import { type User, type UsersQuery } from "@/features/users/types";

export const useUsers = (additionalQuery?: UsersQuery) => {
  return useDataTableQuery<User>({
    queryKey: ["users"],
    queryFn: async ({ query }) => {
      const response = await apiFetch<PagedResult<User>>(endpoints.users.list, {
        query: { ...query, ...additionalQuery },
      });
      return response;
    },
  });
};
