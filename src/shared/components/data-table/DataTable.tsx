/* react-compiler-disable */
/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

import React, {
  memo,
  useEffect,
  useState,
  useRef,
  startTransition,
} from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  type RowSelectionState,
  type ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import {
  RiDownloadLine,
  RiFilterOffLine,
  RiLoader4Line,
  RiRefreshLine,
  RiFilterLine,
} from "@remixicon/react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { backendKind } from "@/core/config/env";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { DataTablePagination } from "@/shared/components/data-table/DataTablePagination";
import { DataTableFilters } from "@/shared/components/data-table/DataTableFilters";
import { exportToCsv } from "@/shared/components/data-table/export-csv";
import { DebouncedInput } from "@/shared/components/data-table/DebouncedInput";
import {
  DataTableActions,
  type DataTableAction,
} from "@/shared/components/data-table/DataTableActions";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { DataTableSkeleton } from "@/shared/components/data-table/DataTableSkeleton";
import { Checkbox } from "@/shared/components/ui/checkbox";

// Constants
const INPUT_DEBOUNCE_MS = 500;
const DEFAULT_PAGE_SIZE = 15;
const SKELETON_ROW_COUNT = 10;

// Common class names
const FLEX_CENTER_GAP = "flex items-center gap-2";

// Extend TanStack Table column meta for filter configuration
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    filterVariant?: "select" | "input" | "date" | "combobox";
    filterInputType?: "text" | "number" | "email" | "tel" | "url" | "search";
    filterOptions?:
    | Array<{ id: string | number; name: string }>
    | ((table: unknown) => Array<{ id: string | number; name: string }>);
    filterEndpoint?: EndpointDef<unknown, unknown>;
    filterTransformItem?: <TData = unknown>(item: TData) => ComboboxOption;
    filterSearchQueryParam?: string;
    filterServerSideSearch?: boolean;
    isFilterDisabled?: (table: unknown) => boolean;
  }
}

// Helper types for cleaner column definitions
interface ColumnDefWithFilter {
  enableColumnFilter?: boolean;
  header?: string | ((props: unknown) => unknown);
  meta?: {
    filterVariant?: "select" | "input" | "date" | "combobox";
    filterInputType?: "text" | "number" | "email" | "tel" | "url" | "search";
    filterOptions?:
    | Array<{ id: string | number; name: string }>
    | ((table: unknown) => Array<{ id: string | number; name: string }>);
    filterEndpoint?: EndpointDef<unknown, unknown>;
    filterTransformItem?: <TData = unknown>(item: TData) => ComboboxOption;
    filterSearchQueryParam?: string;
    filterServerSideSearch?: boolean;
    isFilterDisabled?: (table: unknown) => boolean;
  };
}

type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  total?: number;
  onRowClick?: (row: TData) => void;
  enableColumnFilters?: boolean;
  showExport?: boolean;
  exportFileName?: string;
  emptyMessage?: string;
  className?: string;
  actions?: DataTableAction<TData>[];
  enableVirtualization?: boolean; // Enable virtual scrolling for large datasets
  estimateRowHeight?: number; // Estimated row height in pixels (default: 53)
  onRefresh?: () => void; // Callback to refresh table data
  toolbarActions?: React.ReactNode; // Custom actions to render in the toolbar
  initialState?: {
    sorting?: SortingState;
  };
  // Row selection props
  enableRowSelection?: boolean | ((row: TData) => boolean); // Enable row selection for all or specific rows
  rowSelection?: RowSelectionState; // Controlled row selection state
  onRowSelectionChange?: React.Dispatch<
    React.SetStateAction<RowSelectionState>
  >; // Callback when row selection changes
  getRowId?: (row: TData) => string; // Function to get unique row ID (required for row selection)
  onFiltersChange?: (filters: Record<string, unknown>) => void; // Callback when filters change (for server-side filtering)
  enableGeneralSearch?: boolean; // Enable general text search filter
  // Row expansion props
  getRowCanExpand?: (row: TData) => boolean; // Function to determine if a row can be expanded
  renderSubComponent?: (row: TData) => React.ReactNode; // Function to render expanded row content
};

// Overload for query result (recommended)
type DataTablePropsWithQuery<TData> = Omit<
  DataTableProps<TData>,
  "data" | "total"
> & {
  queryResult: {
    data?: {
      items: TData[];
      rowCount?: number;
    };
    isLoading?: boolean;
    isFetching?: boolean;
    refetch?: () => void; // Refetch function from React Query
  };
};

type DataTableUnionProps<TData> =
  | DataTableProps<TData>
  | DataTablePropsWithQuery<TData>;


// Memoized TableRow for performance
import type { Row } from "@tanstack/react-table";

type MemoizedTableRowProps<TData> = {
  row: Row<TData>;
  onRowClick?: (row: TData) => void;
  selected: boolean;
  renderSubComponent?: (row: TData) => React.ReactNode;
};

function TableRowComponent<TData>({
  row,
  onRowClick,
  selected,
  renderSubComponent,
}: MemoizedTableRowProps<TData>) {
  // Get expanded state - this will update when state changes
  const isExpanded = row.getIsExpanded();

  const handleRowClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    // Don't expand if clicking on actions column or other interactive elements
    const target = e.target as HTMLElement;
    const isActionCell = target.closest('[data-action-cell]');
    const isButton = target.closest('button:not([data-action-cell] button)');
    const isLink = target.closest('a');
    const isCheckbox = target.closest('input[type="checkbox"]');
    const isExpander = target.closest('[data-expander]');

    // Stop propagation if clicking on interactive elements
    // The expander has its own click handler, so we skip it here
    if (isActionCell || isButton || isLink || isCheckbox || isExpander) {
      return;
    }

    // If renderSubComponent is provided, toggle expansion
    if (renderSubComponent) {
      try {
        // Use row.toggleExpanded() which properly handles state updates
        row.toggleExpanded();
      } catch (error) {
        console.error('Error toggling row expansion:', error);
      }
    }
    // Also call the custom onRowClick if provided
    if (onRowClick) {
      onRowClick(row.original);
    }
  };

  // If renderSubComponent is provided, the row should be expandable
  const canExpand = renderSubComponent ? (row.getCanExpand() ?? true) : false;
  const shouldBeClickable = (canExpand && renderSubComponent) || !!onRowClick;

  return (
    <>
      <TableRow
        key={row.id}
        data-state={selected && "selected"}
        data-expanded={isExpanded}
        onClick={shouldBeClickable ? handleRowClick : undefined}
        onKeyDown={
          shouldBeClickable
            ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleRowClick(e as unknown as React.MouseEvent<HTMLTableRowElement>);
              }
            }
            : undefined
        }
        tabIndex={shouldBeClickable ? 0 : undefined}
        role={shouldBeClickable ? "button" : undefined}
        className={cn(
          "transition-colors",
          shouldBeClickable && "cursor-pointer hover:bg-muted/60 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          isExpanded && "bg-muted/30"
        )}
      >
        {row.getVisibleCells().map((cell) => (
          <MemoizedTableCell key={cell.id} cell={cell} />
        ))}
      </TableRow>
      {isExpanded && renderSubComponent && (
        <TableRow key={`${row.id}-expanded`}>
          <TableCell colSpan={row.getVisibleCells().length} className="p-0">
            <div className="px-4 py-4 bg-muted/20">
              {renderSubComponent(row.original)}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// Optimized memo comparison - only re-render if row data or selection state changes
const MemoizedTableRow = React.memo(
  TableRowComponent,
  (prev, next) => {
    // Fast path: if row ID changed, definitely need to re-render
    if (prev.row.id !== next.row.id) return false;

    // If selection state changed, need to re-render
    if (prev.selected !== next.selected) return false;

    // If onRowClick reference changed, need to re-render
    if (prev.onRowClick !== next.onRowClick) return false;

    // If renderSubComponent reference changed, need to re-render
    if (prev.renderSubComponent !== next.renderSubComponent) return false;

    // If row expansion state changed, need to re-render
    const prevExpanded = prev.row.getIsExpanded();
    const nextExpanded = next.row.getIsExpanded();
    if (prevExpanded !== nextExpanded) return false;

    // If row object reference changed (TanStack Table creates new row objects when state changes), re-render
    if (prev.row !== next.row) return false;

    // If row original data changed (by reference), need to re-render
    if (prev.row.original !== next.row.original) return false;

    // All props are the same, skip re-render
    return true;
  }
) as typeof TableRowComponent;

type MemoizedTableCellProps<TData> = {
  cell: ReturnType<Row<TData>["getVisibleCells"]>[number];
};

function TableCellComponent<TData>({ cell }: MemoizedTableCellProps<TData>) {
  return (
    <TableCell
      className={cn(
        "px-4",
        cell.column.id === "select" &&
        "py-0 w-[1%] whitespace-nowrap text-center align-middle",
        cell.column.id === "index" &&
        "py-3 w-[1%] whitespace-nowrap text-center",
        cell.column.id === "expander" &&
        "py-3 w-[1%] whitespace-nowrap text-center",
        cell.column.id === "actions" ? "py-0 w-[1%] whitespace-nowrap" : "py-3"
      )}
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </TableCell>
  );
}

const MemoizedTableCell = React.memo(
  TableCellComponent
) as typeof TableCellComponent;

// Helper function to check if filter has a value
const hasFilterValue = (filterValue: unknown): boolean => {
  if (filterValue === undefined || filterValue === null || filterValue === "") {
    return false;
  }
  if (typeof filterValue === "object" && filterValue !== null && "from" in filterValue) {
    return (filterValue as { from?: unknown }).from !== undefined;
  }
  return true;
};

// Helper function to extract query result props
const extractQueryResult = <TData,>(
  props: DataTableUnionProps<TData>
): {
  isLoading: boolean;
  isFetching: boolean;
  refetch?: () => void;
  data?: TData[];
} => {
  if ("queryResult" in props) {
    return {
      isLoading: props.queryResult.isLoading ?? false,
      isFetching: props.queryResult.isFetching ?? false,
      refetch: props.queryResult.refetch,
      data: props.queryResult.data?.items,
    };
  }
  return {
    isLoading: false,
    isFetching: false,
    data: props.data,
  };
};

// Loading indicator component
const LoadingIndicator = ({
  message,
  className = ""
}: {
  message: string;
  className?: string;
}) => (
  <div className={cn(FLEX_CENTER_GAP, "text-sm text-muted-foreground", className)}>
    <RiLoader4Line className="h-4 w-4 animate-spin" />
    <span>{message}</span>
  </div>
);

const DataTableInner = <TData,>(props: DataTableUnionProps<TData>) => {
  const {
    columns,
    onRowClick,
    enableColumnFilters = false,
    showExport = false,
    exportFileName,
    emptyMessage,
    className,
    actions,
    onRefresh,
    toolbarActions,
    initialState,
    enableRowSelection = false,
    rowSelection: controlledRowSelection,
    onRowSelectionChange,
    getRowId,
    onFiltersChange,
    enableGeneralSearch = false,
    getRowCanExpand,
    renderSubComponent,
  } = props;

  const { t } = useTranslation();

  // Extract query result props once
  const queryResult = extractQueryResult(props);

  const renderSelectionHeader = React.useCallback(
    ({ table }: { table: ReturnType<typeof useReactTable<TData>> }) => {
      const hasSelectable = table
        .getRowModel()
        .rows.some((row) => row.getCanSelect());

      const isAllSelected = table.getIsAllPageRowsSelected();
      const isIndeterminate =
        table.getIsSomePageRowsSelected() && !isAllSelected;

      return (
        <Checkbox
          checked={
            isAllSelected ? true : isIndeterminate ? "indeterminate" : false
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label={t("actions.selectAll", { ns: "common" })}
          className="translate-y-[2px]"
          onClick={(event) => event.stopPropagation()}
          disabled={!hasSelectable}
        />
      );
    },
    [t]
  );

  const renderSelectionCell = React.useCallback(
    ({ row }: { row: Row<TData> }) => {
      if (!row.getCanSelect()) {
        return null;
      }

      return (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={t("actions.select", { ns: "common" })}
          className="translate-y-[2px]"
          onClick={(event) => event.stopPropagation()}
          disabled={!row.getCanSelect()}
        />
      );
    },
    [t]
  );

  // Memoize columns, actions, and data for performance
  // Use deep equality for columns/actions to prevent unnecessary re-renders
  const memoizedColumns = React.useMemo(() => columns, [columns]);
  const memoizedActions = React.useMemo(() => actions, [actions]);

  // Extract and memoize data to avoid re-rendering when other props change
  const memoizedData = React.useMemo(() => {
    return queryResult.data ?? [];
  }, [queryResult.data]);

  // Track if we've ever loaded data (to distinguish initial load from filter changes)
  const hasEverLoadedDataRef = useRef(false);

  // Update ref when data is available
  useEffect(() => {
    if (memoizedData.length > 0) {
      hasEverLoadedDataRef.current = true;
    }
  }, [memoizedData.length]);

  // Resolve getRowId function for row selection
  const resolvedGetRowId = React.useMemo(() => {
    if (getRowId) return getRowId;
    // Default: try to use 'id' property
    return (row: TData) => {
      const item = row as { id?: string | number };
      return item.id ? String(item.id) : "";
    };
  }, [getRowId]);

  const { isLoading, isFetching, refetch } = queryResult;

  // Row selection state (internal if not controlled)
  const [internalRowSelection, setInternalRowSelection] =
    useState<RowSelectionState>({});
  const rowSelection = controlledRowSelection ?? internalRowSelection;

  // Handle row selection change with proper updater support
  const handleRowSelectionChange = React.useCallback(
    (
      updaterOrValue:
        | RowSelectionState
        | ((old: RowSelectionState) => RowSelectionState)
    ) => {
      if (onRowSelectionChange) {
        // Forward to controlled handler (supports updater functions)
        onRowSelectionChange(
          updaterOrValue as React.SetStateAction<RowSelectionState>
        );
      } else {
        // If uncontrolled, use internal state setter
        setInternalRowSelection(updaterOrValue);
      }
    },
    [onRowSelectionChange]
  );

  // Initialize column filters as empty (no URL syncing)
  const initialColumnFilters = React.useMemo(() => {
    return [];
  }, []);

  // Read pagination from URL params
  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false }) as Record<string, unknown>;
  const urlPage = Number(searchParams.page ?? 1);
  const urlPageSize = Number(searchParams.pageSize ?? 10);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: urlPage - 1,
    pageSize: urlPageSize,
  });

  // Sync pagination state with URL params
  useEffect(() => {
    setPagination({ pageIndex: urlPage - 1, pageSize: urlPageSize });
  }, [urlPage, urlPageSize]);

  // Update URL when pagination changes
  const updateUrlPagination = (newPage: number, newPageSize: number) => {
    navigate({
      search: {
        page: newPage,
        pageSize: newPageSize,
      } as never, // Type workaround for generic route search params
    });
  };

  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>(initialColumnFilters);
  const [generalSearch, setGeneralSearch] = useState<string>("");
  const debouncedGeneralSearch = useDebounce(generalSearch, INPUT_DEBOUNCE_MS);
  const [sorting, setSorting] = useState<SortingState>(
    initialState?.sorting ?? []
  );
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Clear dependent filters when parent filter changes
  useEffect(() => {
    const govFilter = columnFilters.find((f) => f.id === "gov_id");
    const cityFilter = columnFilters.find((f) => f.id === "city_id");

    // If governorate filter changes or is cleared, reset city filter
    if (cityFilter && (!govFilter || govFilter.value === undefined)) {
      setColumnFilters((prev) => prev.filter((f) => f.id !== "city_id"));
    }
  }, [columnFilters]);

  // No URL syncing - filters are managed in component state only
  // Convert columnFilters to simple object format for server-side filtering
  const filterParamsRef = useRef<Record<string, unknown>>({});

  // Helper to convert columnFilters to filter params
  const columnFiltersToParams = React.useCallback((filters: ColumnFiltersState): Record<string, unknown> => {
    const params: Record<string, unknown> = {};
    filters.forEach((filter) => {
      if (
        filter.value !== undefined &&
        filter.value !== null &&
        filter.value !== ""
      ) {
        // Handle date range filters
        if (
          typeof filter.value === "object" &&
          filter.value !== null &&
          "from" in filter.value
        ) {
          const dateRange = filter.value as { from?: Date; to?: Date };
          if (dateRange.from) {
            params[`${filter.id}_from`] = dateRange.from.toISOString();
          }
          if (dateRange.to) {
            params[`${filter.id}_to`] = dateRange.to.toISOString();
          }
        } else {
          params[filter.id] = filter.value;
        }
      }
    });
    return params;
  }, []);

  // Notify parent component when filters change (for server-side filtering)
  useEffect(() => {
    if (!onFiltersChange) return;

    const newParams = columnFiltersToParams(columnFilters);

    // Add general search if enabled
    if (enableGeneralSearch && debouncedGeneralSearch && debouncedGeneralSearch.trim() !== "") {
      newParams.text = debouncedGeneralSearch.trim();
    }

    const paramsString = JSON.stringify(newParams);
    const previousParamsString = JSON.stringify(filterParamsRef.current);

    // Only notify if filters actually changed
    if (paramsString !== previousParamsString) {
      filterParamsRef.current = newParams;
      // Debounce filter changes to avoid too many API calls
      const timeoutId = setTimeout(() => {
        onFiltersChange(newParams);
      }, 300); // 300ms debounce for filter changes

      return () => clearTimeout(timeoutId);
    }
  }, [columnFilters, debouncedGeneralSearch, enableGeneralSearch, onFiltersChange, columnFiltersToParams]);

  // Add index, selection/actions columns when enabled
  const columnsWithActions = React.useMemo(() => {
    const hasSelectionColumn = memoizedColumns.some(
      (col) => "id" in col && (col as ColumnDef<TData>).id === "select"
    );
    const hasIndexColumn = memoizedColumns.some(
      (col) => "id" in col && (col as ColumnDef<TData>).id === "index"
    );

    // Index column - shows sequential row numbers
    const indexColumn: ColumnDef<TData> = {
      id: "index",
      header: () => "#",
      cell: ({ row }) => {
        // Get the row index in the table (0-based) and add 1 for display
        const rowIndex = row.index + 1;
        return (
          <span className="text-muted-foreground font-medium">{rowIndex}</span>
        );
      },
      enableSorting: false,
      enableHiding: false,
      enableColumnFilter: false,
      size: 60,
    };

    const selectionColumn: ColumnDef<TData> | null =
      enableRowSelection && !hasSelectionColumn
        ? {
          id: "select",
          header: renderSelectionHeader,
          cell: renderSelectionCell,
          enableSorting: false,
          enableHiding: false,
          enableColumnFilter: false,
          size: 48,
        }
        : null;

    // Build columns: index -> selection (if enabled) -> user columns -> actions (if enabled)
    const baseColumns = hasIndexColumn
      ? memoizedColumns
      : selectionColumn
        ? [indexColumn, selectionColumn, ...memoizedColumns]
        : [indexColumn, ...memoizedColumns];

    if (!memoizedActions || memoizedActions.length === 0) return baseColumns;

    const actionsColumn: ColumnDef<TData> = {
      id: "actions",
      header: () => t("actions.title", { ns: "common" }),
      cell: ({ row }) => (
        <div data-action-cell onClick={(e) => e.stopPropagation()}>
          <DataTableActions row={row.original} actions={memoizedActions} />
        </div>
      ),
      enableColumnFilter: false,
    };

    return [...baseColumns, actionsColumn];
  }, [
    memoizedColumns,
    memoizedActions,
    enableRowSelection,
    t,
    renderSelectionHeader,
    renderSelectionCell,
  ]);

  // Extract total from either direct props or queryResult
  const total =
    "queryResult" in props ? props.queryResult.data?.rowCount : props.total;

  // Automatically determine mode based on backend
  const mode = backendKind === "laravel" ? "client" : "server";

  const table = useReactTable<TData>({
    data: memoizedData,
    columns: columnsWithActions,
    state: {
      pagination,
      columnFilters,
      sorting,
      expanded,
      ...(enableRowSelection ? { rowSelection } : {}),
    },
    pageCount:
      mode === "server" && total && pagination.pageSize
        ? Math.ceil(total / pagination.pageSize)
        : mode === "client" && memoizedData.length && pagination.pageSize
        ? Math.ceil(memoizedData.length / pagination.pageSize)
        : undefined,
    manualPagination: mode === "server",
    manualFiltering: true,
    manualSorting: true,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater(pagination)
          : (updater as PaginationState);
      setPagination(next);
      // Update URL for both client and server mode
      updateUrlPagination(next.pageIndex + 1, next.pageSize);
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onExpandedChange: (updater) => {
      setExpanded((old) => {
        const newState = typeof updater === 'function' ? updater(old) : updater;
        return newState;
      });
    },
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: getRowCanExpand
      ? (row) => getRowCanExpand(row.original)
      : renderSubComponent
        ? () => true
        : undefined,
    ...(mode === "client"
      ? { getPaginationRowModel: getPaginationRowModel() }
      : {}),
    // Row selection configuration
    ...(enableRowSelection
      ? {
          enableRowSelection:
            typeof enableRowSelection === "function"
              ? (row) => enableRowSelection(row.original)
              : enableRowSelection,
          onRowSelectionChange: handleRowSelectionChange,
          getRowId: resolvedGetRowId,
        }
      : {}),
  });

  const pageCount = table.getPageCount() || 1;
  const canPrevious = table.getCanPreviousPage();
  const canNext = table.getCanNextPage();

  // CSV Export handler
  const handleExport = () => {
    // In server mode, use raw data (all data from server)
    const rows = memoizedData;
    exportToCsv({
      fileName: exportFileName,
      columns,
      rows,
    });
  };

  // Clear all filters handler
  const handleClearFilters = () => {
    // Clear general search
    if (enableGeneralSearch) {
      setGeneralSearch("");
    }

    // Clear column filters state first - this will trigger DebouncedInput sync
    setColumnFilters([]);

    // Then reset column filters in table
    table.resetColumnFilters();

    // Manually clear each column's filter value to ensure all inputs are cleared
    table.getAllColumns().forEach((column) => {
      if (column.getCanFilter()) {
        column.setFilterValue(undefined);
      }
    });
  };

  // Refresh table data handler
  const handleRefresh = () => {
    if (refetch) {
      refetch();
    } else if (onRefresh) {
      onRefresh();
    }
  };

  const hasActiveFilters = columnFilters.length > 0 || (enableGeneralSearch && generalSearch.trim() !== "");

  // Get all filterable columns for toolbar
  const filterableColumns = React.useMemo(() => {
    if (!enableColumnFilters) return [];
    return table.getAllColumns().filter((column) => {
      const columnDef = column.columnDef as ColumnDefWithFilter;
      const shouldShowFilter = columnDef.enableColumnFilter !== false;
      return shouldShowFilter && column.getCanFilter();
    });
  }, [table, enableColumnFilters]);

  // Computed values for repeated conditions
  const hasFilters = enableColumnFilters && filterableColumns.length > 0;
  const shouldShowFiltersWrapper = hasFilters || !!toolbarActions || enableGeneralSearch;

  // Get rows for rendering (server mode - no client-side filtering/sorting)
  // Always use getRowModel() - the expanded state is managed separately
  // The table object updates when expanded state changes, so rows will be fresh
  const rows = table.getRowModel().rows;

  // Calculate column count including selection/actions
  const totalColumnCount = columnsWithActions.length;

  // Show skeleton loader only during true initial load (never loaded data before)
  // When filters change, query key changes causing isLoading=true, but we should show overlay instead
  // During refetching (isFetching with existing data), show overlay instead
  const isTrueInitialLoad = isLoading && !hasEverLoadedDataRef.current;

  if (isTrueInitialLoad) {
    return (
      <DataTableSkeleton
        columnCount={totalColumnCount}
        rowCount={SKELETON_ROW_COUNT}
        showFilters={enableColumnFilters}
        showToolbar={showExport || enableColumnFilters}
        className={className}
      />
    );
  }

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Table */}
      <div className="bg-card rounded-lg py-4 px-4 border">
        {/* Top toolbar with actions and filters */}
        {(isFetching || toolbarActions || hasFilters || enableGeneralSearch) && (
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
            {/* Right side: Filters Section */}
            {shouldShowFiltersWrapper && (
              <div className="flex-1 lg:flex-initial space-y-3 bg-muted/50 rounded-lg p-4 w-full">
                {/* Filters Header */}
                <div className="flex items-center justify-between">
                  {hasFilters && (
                    <div className={FLEX_CENTER_GAP}>
                      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-primary">
                        <RiFilterLine className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">
                          {t("table.filters")}
                        </h3>
                      </div>
                    </div>
                  )}
                  <div className={FLEX_CENTER_GAP}>
                    {hasActiveFilters && (
                      <Button
                        variant="outline"
                        onClick={handleClearFilters}
                        className="text-destructive hover:text-destructive"
                      >
                        <RiFilterOffLine className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          {t("table.clearFilters")}
                        </span>
                      </Button>
                    )}
                    {showExport && (
                      <Button
                        variant="outline"
                        onClick={handleExport}
                      >
                        <RiDownloadLine className="h-4 w-4" />
                        <span>{t("table.exportCsv")}</span>
                      </Button>
                    )}
                    {(refetch || onRefresh) && (
                      <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={isFetching}
                      >
                        <RiRefreshLine
                          className={cn("h-4 w-4", isFetching && "animate-spin")}
                        />
                        <span>{t("table.refresh")}</span>
                      </Button>
                    )}
                    {toolbarActions}
                  </div>
                </div>



                {/* Filters Container */}
                <DataTableFilters
                  table={table}
                  enableColumnFilters={enableColumnFilters}
                  enableGeneralSearch={enableGeneralSearch}
                  generalSearch={generalSearch}
                  onGeneralSearchChange={setGeneralSearch}
                  columnFilters={columnFilters}
                />
              </div>
            )}
            {/* Left side: Refetching indicator */}
          </div>
        )}
        {isFetching && !isLoading && (
          <LoadingIndicator
            message={t("table.updating")}
            className="whitespace-nowrap"
          />
        )}
        <div
          ref={tableContainerRef}
          className={cn(
            "rounded-lg my-4 overflow-x-auto overflow-y-auto border-2 relative max-h-[800px]"
          )}
        >
          <Table className="min-w-200">
            <TableHeader className="relative z-20">
              {table.getHeaderGroups().map((headerGroup) => (
                <React.Fragment key={headerGroup.id}>
                  <TableRow>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className={cn(
                          "h-12 px-4",
                          header.column.id === "select" &&
                          "w-[1%] whitespace-nowrap text-center",
                          header.column.id === "index" &&
                          "w-[1%] whitespace-nowrap text-center",
                          header.column.id === "expander" &&
                          "w-[1%] whitespace-nowrap text-center",
                          header.column.id === "actions" &&
                          "w-[1%] whitespace-nowrap text-center"
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableHead>
                    ))}
                  </TableRow>
                </React.Fragment>
              ))}
            </TableHeader>
            <TableBody className="relative">
              {/* Loading overlay during refetching or when filters change (isLoading with previous data) */}
              {/* Show overlay if: fetching with data, OR loading but we've loaded data before (filter change) */}
              {rows.length ? (
                rows.map((row) => (
                  <MemoizedTableRow
                    key={`${row.id}-${row.getIsExpanded() ? 'expanded' : 'collapsed'}`}
                    row={row}
                    selected={row.getIsSelected()}
                    onRowClick={onRowClick}
                    renderSubComponent={renderSubComponent}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={table.getVisibleLeafColumns().length}
                    className="h-32 text-center text-muted-foreground"
                  >
                    {emptyMessage || t("table.empty")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {/* Pagination Controls */}
        <DataTablePagination
          pageIndex={pagination.pageIndex}
          pageSize={pagination.pageSize}
          pageCount={pageCount}
          canPreviousPage={canPrevious}
          canNextPage={canNext}
          onPreviousPage={() => table.previousPage()}
          onNextPage={() => table.nextPage()}
          onPageChange={(page) => table.setPageIndex(page)}
          onPageSizeChange={(newSize) => {
            table.setPageSize(newSize);
          }}
        />
      </div>
    </div>
  );
};

// Export memoized version for performance
export const DataTable = memo(DataTableInner) as typeof DataTableInner;

// Re-export for convenience
export type { DataTableAction } from "@/shared/components/data-table/DataTableActions";

// Export DataTable as the single source of truth
export { DataTable as default } from "./DataTable";