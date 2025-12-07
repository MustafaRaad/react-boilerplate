/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 *
 * Users Table Columns - Automated from Field Configuration
 * =========================================================
 *
 * Uses automated column generation from users.config.ts
 * Just define your options - columns are auto-generated!
 */

import type { ColumnDef } from "@tanstack/react-table";
import type { User } from "@/features/users/types";
import { createAutoColumns } from "@/shared/components/data-table/autoColumns";
import { USER_FIELDS } from "../config/users.config";
import { useDateFmt } from "@/lib/formatters";
import { dateFilterFn } from "@/shared/components/data-table/filters";

type TFn = (key: string) => string;

/**
 * Create columns definition for users table
 * Automatically generated from field configuration
 */
export const useUsersColumns = (t: TFn): ColumnDef<User, unknown>[] => {
  const formatDate = useDateFmt();

  const autoColumns = createAutoColumns<User>(USER_FIELDS, t, {
    // exclude: ["approved"], // Hide these fields from table
  });
  // Add created_at column manually since it's not in USER_FIELDS (not a form field)
  const createdAtColumn: ColumnDef<User, unknown> = {
    accessorKey: "created_at",
    header: t("list.columns.created_at"),
    cell: ({ row }) => {
      const date = row.getValue("created_at");
      if (!date) return "-";
      return formatDate(new Date(date as string));
    },
    filterFn: dateFilterFn,
    meta: {
      filterVariant: "date",
    },
  };

  return [...autoColumns, createdAtColumn];
};
