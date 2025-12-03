import type { ColumnDef, CellContext } from "@tanstack/react-table";
import type { User } from "@/features/users/types";
import { dateFilterFn } from "@/shared/components/data/filters";

type TFn = (key: string) => string;

export const createUsersColumns = (t: TFn): ColumnDef<User, unknown>[] => [
  {
    accessorKey: "name",
    enableColumnFilter: true,
    header: t("list.columns.name"),
  },
  {
    accessorKey: "email",
    enableColumnFilter: true,
    header: t("list.columns.email"),
  },
  {
    id: "roles",
    enableColumnFilter: false,
    header: t("list.columns.roles"),
    cell: ({ row }: CellContext<User, unknown>) => {
      // Handle both Laravel (role as string) and ASP.NET (roles as array)
      const user = row.original;
      if (user.roles && user.roles.length > 0) {
        return user.roles.map((role: { name: string }) => role.name).join(", ");
      }
      return user.role || "-";
    },
  },
  {
    accessorKey: "created_at",
    enableColumnFilter: true,
    header: t("list.columns.createdAt"),
    cell: ({ row }: CellContext<User, unknown>) => {
      const date = row.getValue("created_at");
      if (!date) return "-";
      return new Date(date as string).toLocaleDateString();
    },
    filterFn: dateFilterFn,
    meta: {
      filterVariant: "date",
    },
  },
] as ColumnDef<User, unknown>[];
