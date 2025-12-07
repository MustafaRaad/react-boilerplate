/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 *
 * AUTO COLUMNS GENERATOR - Automated Table Column Generation
 * ===========================================================
 *
 * Automatically generates table columns from field configuration.
 * Zero boilerplate code needed!
 *
 * USAGE:
 * ------
 * ```tsx
 * const columns = createAutoColumns(USER_FIELDS, t, {
 *   exclude: ['password'], // Hide sensitive fields
 *   dateFields: ['created_at', 'updated_at'],
 * });
 * ```
 */

import type { ColumnDef, FilterFn } from "@tanstack/react-table";
import type { FieldsConfig, FieldConfig } from "@/shared/forms/autoForm";
import { dateFilterFn } from "./filters";

export interface AutoColumnsOptions<T> {
  /**
   * Fields to exclude from table
   */
  exclude?: Array<keyof T>;

  /**
   * Fields that should use date formatting
   */
  dateFields?: Array<keyof T>;

  /**
   * Custom column overrides
   */
  overrides?: Record<string, Partial<ColumnDef<T, unknown>>>;

  /**
   * Enable filtering for all columns (default: true)
   */
  enableFilters?: boolean;
}

/**
 * Automatically generates table columns from field configuration
 */
export function createAutoColumns<T extends Record<string, unknown>>(
  fields: FieldsConfig,
  t: (key: string) => string,
  options: AutoColumnsOptions<T> = {}
): ColumnDef<T, unknown>[] {
  const {
    exclude = [],
    dateFields = [],
    overrides = {},
    enableFilters = true,
  } = options;

  const columns: ColumnDef<T, unknown>[] = [];

  Object.entries(fields).forEach(
    ([fieldName, fieldConfig]: [string, FieldConfig]) => {
      // Skip excluded fields
      if (exclude.includes(fieldName as keyof T)) return;

      // Skip password fields automatically
      if (fieldConfig.type === "password") return;

      const isDateField = dateFields.includes(fieldName as keyof T);
      const columnDef: ColumnDef<T, unknown> = {
        accessorKey: fieldName,
        enableColumnFilter: enableFilters,
        header: t(`list.columns.${fieldName}`),
      };

      // Apply custom overrides
      if (overrides && overrides[fieldName]) {
        Object.assign(columnDef, overrides[fieldName]);
      }

      // Add date formatting
      if (isDateField) {
        columnDef.cell = ({ row }) => {
          const date = row.getValue(fieldName);
          if (!date) return "-";
          return new Date(date as string).toLocaleDateString();
        };
        columnDef.filterFn = dateFilterFn;
        columnDef.meta = {
          filterVariant: "date",
        };
      }

      // Add select filter for select fields
      if (fieldConfig.type === "select" && fieldConfig.options) {
        const options = fieldConfig.options.map((opt) => ({
          id: String(opt.value),
          name: t(opt.label),
        }));

        const selectFilterFn: FilterFn<T> = (row, _columnId, filterValue) => {
          const value = row.getValue(fieldName);
          if (!value) return false;
          return (
            String(value).toLowerCase() === String(filterValue).toLowerCase()
          );
        };

        columnDef.cell = ({ row }) => {
          const value = row.getValue(fieldName);
          return value ? String(value) : "-";
        };
        columnDef.filterFn = selectFilterFn;
        columnDef.meta = {
          filterVariant: "select",
          filterOptions: options,
        };
      }

      // Add checkbox display
      if (fieldConfig.type === "checkbox") {
        columnDef.cell = ({ row }) => {
          const value = row.getValue(fieldName);
          return value ? "✓" : "✗";
        };
      }

      columns.push(columnDef);
    }
  );

  return columns;
}
