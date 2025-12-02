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
    cell: ({ row }) => row.original.roles.map((role) => role.name).join(", "),
  },
];
