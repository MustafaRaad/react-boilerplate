/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

import type { ColumnDef, CellContext, FilterFn } from "@tanstack/react-table";
import type { User } from "@/features/users/types";
import { dateFilterFn } from "@/shared/components/data-table/filters";

type TFn = (key: string) => string;

// Mock role options for filter
const mockRoleOptions = [
  { id: "Admin", name: "Admin" },
  { id: "User", name: "User" },
  { id: "Manager", name: "Manager" },
  { id: "Editor", name: "Editor" },
];

// Custom filter function for roles column
const rolesFilterFn: FilterFn<User> = (row, _columnId, filterValue) => {
  const user = row.original;
  const selectedRole = filterValue as string;

  if (user.role) {
    return user.role.toLowerCase() === selectedRole.toLowerCase();
  }

  return false;
};

export const createUsersColumns = (t: TFn): ColumnDef<User, unknown>[] =>
  [
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
      accessorFn: (row) => row.role || "",
      enableColumnFilter: true,
      header: t("list.columns.roles"),
      cell: ({ row }: CellContext<User, unknown>) => {
        return row.original.role || "-";
      },
      filterFn: rolesFilterFn,
      meta: {
        filterVariant: "select",
        filterOptions: mockRoleOptions,
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
