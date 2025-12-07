/* react-compiler-disable */
/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

import React, { memo, useEffect, useState, useRef } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useTranslation } from "react-i18next";
import { Download, FilterX, Loader, RotateCw } from "lucide-react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { backendKind } from "@/core/config/env";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { DateRangePicker } from "@/shared/components/ui/date-picker";
import { DataTablePagination } from "@/shared/components/data-table/DataTablePagination";
import { exportToCsv } from "@/shared/components/data-table/export-csv";
import {
  DataTableActions,
  type DataTableAction,
} from "@/shared/components/data-table/DataTableActions";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { DataTableSkeleton } from "@/shared/components/data-table/DataTableSkeleton";

// Extend TanStack Table column meta for filter configuration
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    filterVariant?: "select" | "input" | "date";
    filterOptions?: Array<{ id: string | number; name: string }>;
  }
}

// Helper types for cleaner column definitions
interface ColumnDefWithFilter {
  enableColumnFilter?: boolean;
  meta?: {
    filterVariant?: "select" | "input" | "date";
    filterOptions?: Array<{ id: string | number; name: string }>;
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

// Debounced input component for column filters
function DebouncedInput({
  column,
  t,
}: {
  column: {
    getFilterValue: () => unknown;
    setFilterValue: (value: unknown) => void;
  };
  t: (key: string) => string;
}) {
  const filterValue = column.getFilterValue();
  const [inputValue, setInputValue] = useState((filterValue as string) ?? "");
  const debouncedValue = useDebounce(inputValue, 500);

  // Update filter when debounced value changes
  useEffect(() => {
    column.setFilterValue(debouncedValue || undefined);
  }, [debouncedValue, column]);

  return (
    <Input
      placeholder={t("table.filter")}
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      className="h-8 w-full"
    />
  );
}

// Memoized TableRow for performance
import type { Row } from "@tanstack/react-table";

type MemoizedTableRowProps<TData> = {
  row: Row<TData>;
  onRowClick?: (row: TData) => void;
};

function TableRowComponent<TData>({
  row,
  onRowClick,
}: MemoizedTableRowProps<TData>) {
  return (
    <TableRow
      key={row.id}
      data-state={row.getIsSelected() && "selected"}
      onClick={onRowClick ? () => onRowClick(row.original) : undefined}
      className={cn(
        "transition-colors",
        onRowClick && "cursor-pointer hover:bg-muted/60"
      )}
    >
      {row.getVisibleCells().map((cell) => (
        <MemoizedTableCell key={cell.id} cell={cell} />
      ))}
    </TableRow>
  );
}

const MemoizedTableRow = React.memo(
  TableRowComponent
) as typeof TableRowComponent;

type MemoizedTableCellProps<TData> = {
  cell: ReturnType<Row<TData>["getVisibleCells"]>[number];
};

function TableCellComponent<TData>({ cell }: MemoizedTableCellProps<TData>) {
  return (
    <TableCell
      className={cn(
        "px-4",
        cell.column.id === "actions" ? "py-0 w-[1%] whitespace-nowrap" : "py-3"
      )}
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </TableCell>
  );
}

const MemoizedTableCell = React.memo(TableCellComponent) as typeof TableCellComponent;

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
    enableVirtualization = false,
    estimateRowHeight = 53,
    onRefresh,
  } = props;

  // Memoize columns, actions, and data for performance
  const memoizedColumns = React.useMemo(() => columns, [columns]);
  const memoizedActions = React.useMemo(() => actions, [actions]);
  const memoizedData = React.useMemo(() => {
    return "queryResult" in props
      ? props.queryResult.data?.items ?? []
      : props.data;
  }, [props]);

  // Automatically determine mode based on backend
  const mode = backendKind === "laravel" ? "client" : "server";

  // Extract total from either direct props or queryResult
  const total =
    "queryResult" in props ? props.queryResult.data?.rowCount : props.total;
  const isLoading =
    "queryResult" in props ? props.queryResult.isLoading ?? false : false;
  const isFetching =
    "queryResult" in props ? props.queryResult.isFetching ?? false : false;
  const refetch =
    "queryResult" in props ? props.queryResult.refetch : undefined;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false }) as Record<string, unknown>;

  // Read pagination from URL params
  const urlPage = Number(searchParams.page ?? 1);
  const urlPageSize = Number(searchParams.pageSize ?? 10);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: urlPage - 1,
    pageSize: urlPageSize,
  });

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const tableContainerRef = useRef<HTMLDivElement>(null);

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

  // Add actions column if actions are provided
  const columnsWithActions = React.useMemo(() => {
    if (!memoizedActions || memoizedActions.length === 0)
      return memoizedColumns;

    const actionsColumn: ColumnDef<TData> = {
      id: "actions",
      header: () => t("actions.title", { ns: "common" }),
      cell: ({ row }) => (
        <DataTableActions row={row.original} actions={memoizedActions} />
      ),
      enableColumnFilter: false,
    };

    return [...memoizedColumns, actionsColumn];
  }, [memoizedColumns, memoizedActions, t]);

  const table = useReactTable({
    data: memoizedData,
    columns: columnsWithActions,
    state: {
      pagination,
      columnFilters,
    },
    pageCount:
      mode === "server" && total && pagination.pageSize
        ? Math.ceil(total / pagination.pageSize)
        : undefined,
    manualPagination: mode === "server",
    onPaginationChange:
      mode === "client"
        ? setPagination
        : (updater) => {
            const next =
              typeof updater === "function"
                ? updater(pagination)
                : (updater as PaginationState);
            setPagination(next);
            updateUrlPagination(next.pageIndex + 1, next.pageSize);
          },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: enableColumnFilters
      ? getFilteredRowModel()
      : undefined,
    ...(mode === "client"
      ? { getPaginationRowModel: getPaginationRowModel() }
      : {}),
  });

  const pageCount = table.getPageCount() || 1;
  const canPrevious = table.getCanPreviousPage();
  const canNext = table.getCanNextPage();

  // Render filter component based on column configuration
  function renderColumnFilter(column: ReturnType<typeof table.getAllColumns>[0]) {
    const columnDef = column.columnDef as ColumnDefWithFilter;
    const shouldShowFilter = columnDef.enableColumnFilter !== false;
    const filterVariant = columnDef.meta?.filterVariant;
    const filterOptions = columnDef.meta?.filterOptions;

    if (!shouldShowFilter || !column.getCanFilter()) return null;

    const filterValue = column.getFilterValue();

    if (filterVariant === "select" && Array.isArray(filterOptions)) {
      return (
        <Select
          value={(filterValue as string) ?? "all"}
          onValueChange={(value) =>
            column.setFilterValue(value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="w-full" size="sm">
            <SelectValue placeholder={t("table.filter")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("table.all")}</SelectItem>
            {filterOptions.map((option) => (
              <SelectItem key={option.id} value={String(option.id)}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (filterVariant === "date") {
      return (
        <DateRangePicker
          dateRange={filterValue as DateRange | undefined}
          onDateRangeChange={(range) => column.setFilterValue(range)}
          placeholder={t("table.selectDate")}
        />
      );
    }

    // Use debounced input for text filters
    // Key prop resets state when filters are cleared
    return (
      <DebouncedInput key={String(filterValue ?? "")} column={column} t={t} />
    );
  }

  // CSV Export handler
  const handleExport = () => {
    const rows = table.getFilteredRowModel().rows.map((row) => row.original);
    exportToCsv({
      fileName: exportFileName,
      columns,
      rows,
    });
  };

  // Clear all filters handler
  const handleClearFilters = () => {
    table.resetColumnFilters();
  };

  // Refresh table data handler
  const handleRefresh = () => {
    if (refetch) {
      refetch();
    } else if (onRefresh) {
      onRefresh();
    }
  };

  const hasActiveFilters = columnFilters.length > 0;

  // Virtual scrolling setup for large datasets
  const rows = table.getRowModel().rows;
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => estimateRowHeight,
    overscan: 5,
    enabled: enableVirtualization && mode === "client",
  });

  const virtualRows =
    enableVirtualization && mode === "client"
      ? rowVirtualizer.getVirtualItems()
      : [];
  const totalSize =
    enableVirtualization && mode === "client"
      ? rowVirtualizer.getTotalSize()
      : 0;
  const paddingTop = virtualRows.length > 0 ? virtualRows[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows[virtualRows.length - 1]?.end || 0)
      : 0;

  // Calculate column count including actions
  const totalColumnCount =
    memoizedActions && memoizedActions.length > 0
      ? memoizedColumns.length + 1
      : memoizedColumns.length;

  // Show skeleton loader during initial load
  if (isLoading) {
    return (
      <DataTableSkeleton
        columnCount={totalColumnCount}
        rowCount={10}
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
        {/* Top toolbar with actions */}
        {(showExport ||
          enableColumnFilters ||
          isFetching ||
          refetch ||
          onRefresh) && (
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <TooltipProvider>
                {showExport && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleExport}
                        className="bg-card"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("table.exportCsv")}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {(refetch || onRefresh) && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleRefresh}
                        className="bg-card"
                        disabled={isFetching}
                      >
                        <RotateCw
                          className={cn(
                            "h-4 w-4",
                            isFetching && "animate-spin"
                          )}
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("table.refresh")}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {enableColumnFilters && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleClearFilters}
                        className="bg-card"
                        disabled={!hasActiveFilters}
                      >
                        <FilterX className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("table.clearFilters")}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </TooltipProvider>
            </div>

            {/* Refetching indicator */}
            {isFetching && !isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader className="h-4 w-4 animate-spin" />
                <span>{t("table.updating")}</span>
              </div>
            )}
          </div>
        )}
        <div
          ref={tableContainerRef}
          className={cn(
            "border shadow rounded-lg my-4 overflow-x-auto",
            enableVirtualization &&
              mode === "client" &&
              "max-h-[600px] overflow-y-auto"
          )}
        >
          <Table className="min-w-[800px]">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <React.Fragment key={headerGroup.id}>
                  <TableRow>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className={cn(
                          "h-12 px-4",
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
                  {/* Column filters row */}
                  {enableColumnFilters && (
                    <TableRow className="bg-muted/50">
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={`${header.id}-filter`}
                          className="px-4 py-3"
                        >
                          {!header.isPlaceholder &&
                            renderColumnFilter(header.column)}
                        </TableHead>
                      ))}
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableHeader>
            <TableBody>
              {rows.length ? (
                enableVirtualization && mode === "client" ? (
                  // Virtual scrolling mode
                  <>
                    {paddingTop > 0 && (
                      <tr>
                        <td style={{ height: `${paddingTop}px` }} />
                      </tr>
                    )}
                    {virtualRows.map((virtualRow) => {
                      const row = rows[virtualRow.index];
                      return (
                        <MemoizedTableRow
                          key={row.id}
                          row={row}
                          onRowClick={onRowClick}
                        />
                      );
                    })}
                    {paddingBottom > 0 && (
                      <tr>
                        <td style={{ height: `${paddingBottom}px` }} />
                      </tr>
                    )}
                  </>
                ) : (
                  // Normal rendering mode
                  rows.map((row) => (
                    <MemoizedTableRow
                      key={row.id}
                      row={row}
                      onRowClick={onRowClick}
                    />
                  ))
                )
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={memoizedColumns.length}
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
