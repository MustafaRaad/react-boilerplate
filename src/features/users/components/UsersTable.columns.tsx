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

type TFn = (key: string) => string;

/**
 * Create columns definition for users table
 * Automatically generated from field configuration
 */
export const createUsersColumns = (t: TFn): ColumnDef<User, unknown>[] => {
  return createAutoColumns<User>(USER_FIELDS, t, {
    // exclude: ["approved"], // Hide these fields from table
    dateFields: ["created_at"], // Format as dates
  });
};
