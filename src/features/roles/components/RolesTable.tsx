import { type ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { backendKind } from "@/core/config/env";
import { DataTable } from "@/components/data/DataTable";
import { usePaginationState } from "@/shared/hooks/usePaginationState";
import { useRoles } from "@/features/roles/api/useRoles";
import { type Role } from "@/features/roles/types";

export const RolesTable = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const { page, setPage, pageSize, setPageSize } = usePaginationState();
  const rolesQuery = useRoles({ page, pageSize, search });

  const columns: ColumnDef<Role>[] = [
    {
      header: t("roles.name"),
      accessorKey: "name",
    },
  ];

  const mode = backendKind === "laravel" ? "client" : "server";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">{t("roles.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("roles.subtitle")}</p>
        </div>
        <Input
          placeholder={t("table.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
      </div>

      <DataTable
        columns={columns}
        data={rolesQuery.data?.items ?? []}
        total={rolesQuery.data?.rowCount}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        mode={mode}
      />
    </div>
  );
};
