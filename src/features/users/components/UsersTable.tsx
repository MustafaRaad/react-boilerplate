import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Eye, Pencil, Trash2 } from "lucide-react";
import {
  DataTable,
  type DataTableAction,
} from "@/shared/components/data-table/DataTable.tsx";
import { useUsers } from "@/features/users/api/useUsers";
import { createUsersColumns } from "./UsersTable.columns.tsx";
import type { User } from "@/features/users/types";

export const UsersTable = () => {
  const { t } = useTranslation("users");
  const { t: tCommon } = useTranslation("common");
  const usersQuery = useUsers();
  const columns = useMemo(() => createUsersColumns(t), [t]);

  const actions: DataTableAction<User>[] = useMemo(
    () => [
      {
        icon: Eye,
        label: tCommon("actions.view"),
        onClick: (user) => console.log("View user:", user),
      },
      {
        icon: Pencil,
        label: tCommon("actions.edit"),
        onClick: (user) => console.log("Edit user:", user),
      },
      {
        icon: Trash2,
        label: tCommon("actions.delete"),
        onClick: (user) => console.log("Delete user:", user),
        variant: "destructive",
      },
    ],
    [tCommon]
  );

  return (
    <DataTable
      columns={columns}
      queryResult={usersQuery}
      enableColumnFilters
      showExport
      actions={actions}
    />
  );
};
