import type { ColumnDef } from "@tanstack/react-table";
import type { User } from "@/features/users/types";

type TFn = (key: string) => string;

export const createUsersColumns = (t: TFn): ColumnDef<User>[] => [
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
    cell: ({ row }) => {
      // Handle both Laravel (role as string) and ASP.NET (roles as array)
      const user = row.original;
      if (user.roles && user.roles.length > 0) {
        return user.roles.map((role) => role.name).join(", ");
      }
      return user.role || "-";
    },
  },
];
