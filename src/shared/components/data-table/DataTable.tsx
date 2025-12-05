import React, { useEffect, useState } from "react";
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
import { useTranslation } from "react-i18next";
import { Download, FilterX } from "lucide-react";
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
  };
};

type DataTableUnionProps<TData> =
  | DataTableProps<TData>
  | DataTablePropsWithQuery<TData>;

export function DataTable<TData>(props: DataTableUnionProps<TData>) {
  const {
    columns,
    onRowClick,
    enableColumnFilters = false,
    showExport = false,
    exportFileName,
    emptyMessage,
    className,
    actions,
  } = props;

  // Automatically determine mode based on backend
  const mode = backendKind === "laravel" ? "client" : "server";

  // Extract data and total from either direct props or queryResult
  const data =
    "queryResult" in props ? props.queryResult.data?.items ?? [] : props.data;
  const total =
    "queryResult" in props ? props.queryResult.data?.rowCount : props.total;
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
    if (!actions || actions.length === 0) return columns;

    const actionsColumn: ColumnDef<TData> = {
      id: "actions",
      header: () => t("actions.title", { ns: "common" }),
      cell: ({ row }) => (
        <DataTableActions row={row.original} actions={actions} />
      ),
      enableColumnFilter: false,
    };

    return [...columns, actionsColumn];
  }, [columns, actions, t]);

  const table = useReactTable({
    data,
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
  const renderColumnFilter = (
    column: ReturnType<typeof table.getAllColumns>[0]
  ) => {
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

    return (
      <Input
        placeholder={t("table.filter")}
        value={(filterValue as string) ?? ""}
        onChange={(e) => column.setFilterValue(e.target.value)}
        className="h-8 w-full"
      />
    );
  };

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

  const hasActiveFilters = columnFilters.length > 0;

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Table */}
      <div className="bg-card rounded-lg py-4 px-4 border">
        {/* Top toolbar with actions */}
        {(showExport || enableColumnFilters) && (
          <div className="flex items-center gap-2 px-1">
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
        )}
        <div className="border shadow rounded-lg my-4 overflow-x-auto">
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
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => onRowClick?.(row.original)}
                    className={cn(
                      "transition-colors",
                      onRowClick && "cursor-pointer hover:bg-muted/60"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "px-4",
                          cell.column.id === "actions"
                            ? "py-0 w-[1%] whitespace-nowrap"
                            : "py-3"
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
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
}

// Re-export for convenience
export type { DataTableAction } from "@/shared/components/data-table/DataTableActions";
