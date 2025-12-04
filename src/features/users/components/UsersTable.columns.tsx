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

  // Handle Laravel backend (single role string)
  if (user.role) {
    return user.role.toLowerCase() === selectedRole.toLowerCase();
  }

  // Handle ASP.NET backend (roles array)
  if (user.roles && user.roles.length > 0) {
    return user.roles.some(
      (role: { name: string }) =>
        role.name.toLowerCase() === selectedRole.toLowerCase()
    );
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
      accessorFn: (row) => {
        // Return role name for filtering
        if (row.roles && row.roles.length > 0) {
          return row.roles
            .map((role: { name: string }) => role.name)
            .join(", ");
        }
        return row.role || "";
      },
      enableColumnFilter: true,
      header: t("list.columns.roles"),
      cell: ({ row }: CellContext<User, unknown>) => {
        // Handle both Laravel (role as string) and ASP.NET (roles as array)
        const user = row.original;
        if (user.roles && user.roles.length > 0) {
          return user.roles
            .map((role: { name: string }) => role.name)
            .join(", ");
        }
        return user.role || "-";
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
