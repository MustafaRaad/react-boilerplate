import { type ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { backendKind } from "@/core/config/env";
import { DataTable } from "@/components/data/DataTable";
import { useUsers } from "@/features/users/api/useUsers";
import { useUsersFilters } from "@/features/users/hooks/useUsersFilters";
import { type User } from "@/features/users/types";

export const UsersTable = () => {
  const { t } = useTranslation("users");
  const { query, search, setSearch, page, setPage, pageSize, setPageSize } =
    useUsersFilters();
  const usersQuery = useUsers(query);

  const columns: ColumnDef<User>[] = [
    {
      header: t("list.columns.name"),
      accessorKey: "name",
    },
    {
      header: t("list.columns.email"),
      accessorKey: "email",
    },
    {
      header: t("list.columns.roles"),
      cell: ({ row }) => row.original.roles.map((role) => role.name).join(", "),
    },
  ];

  const mode = backendKind === "laravel" ? "client" : "server";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">{t("list.title")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("list.description")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder={t("list.filters.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={usersQuery.data?.items ?? []}
        total={usersQuery.data?.rowCount}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        mode={mode}
      />
    </div>
  );
};
