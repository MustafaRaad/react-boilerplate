import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { backendKind } from "@/core/config/env";
import { DataTable } from "@/shared/components/data/DataTable";
import { useUsers } from "@/features/users/api/useUsers";
import { usePaginationState } from "@/shared/hooks/usePaginationState";
import { createUsersColumns } from "./UsersTable.columns.tsx";

export const UsersTable = () => {
  const { t } = useTranslation("users");
  const { page, setPage, pageSize, setPageSize } = usePaginationState();
  const usersQuery = useUsers({ page, pageSize });
  const columns = useMemo(() => createUsersColumns(t), [t]);
  const mode = backendKind === "laravel" ? "client" : "server";

  return (
    <DataTable
      columns={columns}
      data={usersQuery.data?.items ?? []}
      total={usersQuery.data?.rowCount}
      page={page}
      pageSize={pageSize}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      mode={mode}
      enableColumnFilters
      showExport
    />
  );
};
