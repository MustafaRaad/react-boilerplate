import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { backendKind } from "@/core/config/env";
import { DataTable } from "@/shared/components/data/DataTable";
import { useUsers } from "@/features/users/api/useUsers";
import { useUsersFilters } from "@/features/users/hooks/useUsersFilters";
import { createUsersColumns } from "./UsersTable.columns";

export const UsersTable = () => {
  const { t } = useTranslation("users");
  const { query, page, setPage, pageSize, setPageSize } = useUsersFilters();
  const usersQuery = useUsers(query);
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
      exportFileName="users"
    />
  );
};
