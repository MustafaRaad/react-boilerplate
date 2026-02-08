/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 * 
 * Data Table - Single Source of Truth
 * 
 * ⚠️ IMPORTANT: This is the ONLY place to import data table components.
 * All data tables in the application MUST use components from this directory.
 * 
 * Central export point for all data table functionality following MCP patterns.
 */

// ✅ Core DataTable component - SINGLE SOURCE OF TRUTH
export { DataTable } from "./DataTable";

// Supporting components
export {
  DataTableActions,
  type DataTableAction,
} from "./DataTableActions";
export { DataTablePagination } from "./DataTablePagination";
export { DataTableSkeleton } from "./DataTableSkeleton";
export { exportToCsv } from "./export-csv";

// Re-export TanStack Table types for convenience
export type {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
