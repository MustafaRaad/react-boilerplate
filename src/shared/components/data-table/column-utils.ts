/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 *
 * Common Column Utilities - DRY Pattern for Table Columns
 * ========================================================
 *
 * Pre-configured column definitions for common use cases to reduce duplication
 * across feature table configurations.
 */

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

/**
 * Common column factory functions
 *
 * Provides reusable column definition builders for TanStack Table.
 * Reduces duplication and ensures consistent column configurations.
 *
 * @example
 * ```typescript
 * import { columnHelpers } from '@/shared/components/data-table/column-utils';
 *
 * const columns = [
 *   columnHelpers.text('name', { header: 'Name' }),
 *   columnHelpers.date('createdAt', { header: 'Created' }),
 *   columnHelpers.status('status', { header: 'Status' }),
 * ];
 * ```
 */
export const columnHelpers = {
  /**
   * Creates a standard text column
   *
   * @template TData - The row data type
   *
   * @param accessor - Column accessor (key or function)
   * @param config - Column configuration options
   * @param config.header - Column header text
   * @param config.minWidth - Minimum column width
   * @param config.maxWidth - Maximum column width
   * @param config.enableSorting - Enable sorting (default: true)
   * @param config.enableFiltering - Enable filtering (default: true)
   *
   * @returns Column definition for TanStack Table
   *
   * @example
   * ```typescript
   * columnHelpers.text('name', { header: 'Name' })
   * columnHelpers.text((row) => `${row.firstName} ${row.lastName}`, {
   *   header: 'Full Name',
   *   enableSorting: false,
   * })
   * ```
   */
  text: <TData,>(
    accessor: keyof TData | ((row: TData) => string),
    config?: {
      header?: string;
      minWidth?: number;
      maxWidth?: number;
      enableSorting?: boolean;
      enableFiltering?: boolean;
    }
  ): ColumnDef<TData> => {
    const def: Record<string, unknown> = {
      enableSorting: config?.enableSorting ?? true,
      enableColumnFilter: config?.enableFiltering ?? true,
    };
    
    if (typeof accessor === "string") {
      def.accessorKey = accessor;
    } else {
      def.accessorFn = accessor;
    }
    
    if (config?.header) def.header = config.header;
    if (config?.minWidth) def.minSize = config.minWidth;
    if (config?.maxWidth) def.maxSize = config.maxWidth;
    
    return def as unknown as ColumnDef<TData>;
  },

  /**
   * Creates a date column with formatting
   */
  date: <TData,>(
    accessor: keyof TData | ((row: TData) => Date | string | null | undefined),
    config?: {
      header?: string;
      format?: string;
      enableSorting?: boolean;
      enableFiltering?: boolean;
    }
  ): ColumnDef<TData> => {
    const def: Record<string, unknown> = {
      enableSorting: config?.enableSorting ?? true,
      enableColumnFilter: config?.enableFiltering ?? true,
    };
    
    if (typeof accessor === "string") {
      def.accessorKey = accessor;
    } else {
      def.accessorFn = accessor;
    }
    
    if (config?.header) def.header = config.header;
    
    def.cell = ({ getValue }: { getValue: () => unknown }) => {
      const value = getValue() as Date | string | null | undefined;
      if (!value) return "-";
      try {
        const date = typeof value === "string" ? new Date(value) : value;
        return format(date, config?.format ?? "yyyy-MM-dd");
      } catch {
        return "-";
      }
    };
    
    return def as unknown as ColumnDef<TData>;
  },

  /**
   * Creates a number column with formatting
   */
  number: <TData,>(
    accessor: keyof TData | ((row: TData) => number | null | undefined),
    config?: {
      header?: string;
      format?: (value: number) => string;
      enableSorting?: boolean;
      enableFiltering?: boolean;
    }
  ): ColumnDef<TData> => {
    const def: Record<string, unknown> = {
      enableSorting: config?.enableSorting ?? true,
      enableColumnFilter: config?.enableFiltering ?? true,
    };
    
    if (typeof accessor === "string") {
      def.accessorKey = accessor;
    } else {
      def.accessorFn = accessor;
    }
    
    if (config?.header) def.header = config.header;
    
    def.cell = ({ getValue }: { getValue: () => unknown }) => {
      const value = getValue() as number | null | undefined;
      if (value == null) return "-";
      return config?.format ? config.format(value) : value.toLocaleString();
    };
    
    return def as unknown as ColumnDef<TData>;
  },

  /**
   * Creates a boolean/status column with badge rendering
   * Note: This is a factory function, not a hook. Use createStatusColumn hook for translations.
   */
  status: <TData,>(
    accessor: keyof TData | ((row: TData) => boolean | number | null | undefined),
    config?: {
      header?: string;
      activeLabel?: string;
      inactiveLabel?: string;
      enableSorting?: boolean;
      enableFiltering?: boolean;
    }
  ): ColumnDef<TData> => {
    const activeLabel = config?.activeLabel ?? "Active";
    const inactiveLabel = config?.inactiveLabel ?? "Inactive";
    
    const def: Record<string, unknown> = {
      enableSorting: config?.enableSorting ?? true,
      enableColumnFilter: config?.enableFiltering ?? true,
    };
    
    if (typeof accessor === "string") {
      def.accessorKey = accessor;
    } else {
      def.accessorFn = accessor;
    }
    
    if (config?.header) def.header = config.header;
    
    def.cell = ({ getValue }: { getValue: () => unknown }) => {
      const value = getValue() as boolean | number | null | undefined;
      const isActive = value === true || value === 1;
      return React.createElement(
        "span",
        {
          className: `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isActive
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
          }`,
        },
        isActive ? activeLabel : inactiveLabel
      );
    };
    
    return def as unknown as ColumnDef<TData>;
  },
};

/**
 * Creates index column (row number)
 */
export function createIndexColumn<TData>(
  startIndex = 1
): ColumnDef<TData> {
  return {
    id: "index",
    header: "#",
    cell: ({ row, table }) => {
      const pageIndex = table.getState().pagination.pageIndex;
      const pageSize = table.getState().pagination.pageSize;
      return pageIndex * pageSize + row.index + startIndex;
    },
    enableSorting: false,
    enableColumnFilter: false,
    size: 60,
  };
}

/**
 * Creates actions column with common actions
 */
export function createActionsColumn<TData>(
  actions: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: (row: TData) => void;
    variant?: "default" | "destructive" | "outline" | "ghost";
    disabled?: (row: TData) => boolean;
  }>
): ColumnDef<TData> {
  return {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      return React.createElement(
        "div",
        { className: "flex items-center gap-2" },
        actions.map((action, index) => {
          const isDisabled = action.disabled?.(row.original);
          return React.createElement(
            "button",
            {
              key: index,
              onClick: () => action.onClick(row.original),
              disabled: isDisabled,
              className: `inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium transition-colors ${
                action.variant === "destructive"
                  ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
              } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`,
            },
            action.icon,
            action.label
          );
        })
      );
    },
    enableSorting: false,
    enableColumnFilter: false,
    size: 120,
  };
}
