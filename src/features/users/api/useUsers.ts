import { endpoints } from "@/core/api/endpoints";
import { apiFetch } from "@/core/api/client";
import { useApiQuery } from "@/core/api/hooks";
import { backendKind } from "@/core/config/env";
import { type PagedResult } from "@/core/types/api";
import { type User, type UsersQuery } from "@/features/users/types";

const emptyPagedResult = (): PagedResult<User> => ({
  items: [],
  currentPage: 1,
  pageSize: 0,
  rowCount: 0,
  pageCount: 1,
});

export const useUsers = (query: UsersQuery) => {
  return useApiQuery<PagedResult<User>>({
    queryKey: ["users", backendKind, query],
    queryFn: async () => {
      const response = await apiFetch<PagedResult<User>>(endpoints.users.list, {
        query,
        overrideBackendKind: backendKind,
      });
      return response;
    },
    initialData: emptyPagedResult(),
  });
};
