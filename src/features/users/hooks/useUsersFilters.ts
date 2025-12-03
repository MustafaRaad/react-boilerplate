import { usePaginationState } from "@/shared/hooks/usePaginationState";

export const useUsersFilters = () => {
  const { page, setPage, pageSize, setPageSize } = usePaginationState();

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    query: {
      page,
      pageSize,
    },
  };
};
