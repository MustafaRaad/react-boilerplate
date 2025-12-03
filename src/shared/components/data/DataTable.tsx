import { useEffect, useState } from "react";
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
import { DataTablePagination } from "@/shared/components/data/DataTablePagination";
import { exportToCsv } from "@/shared/components/data/export-csv";
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
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onRowClick?: (row: TData) => void;
  mode: "server" | "client";
  enableColumnFilters?: boolean;
  showExport?: boolean;
  exportFileName?: string;
  emptyMessage?: string;
  className?: string;
};

export function DataTable<TData>({
  columns,
  data,
  total,
  page = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  onRowClick,
  mode,
  enableColumnFilters = false,
  showExport = false,
  exportFileName,
  emptyMessage,
  className,
}: DataTableProps<TData>) {
  const { t } = useTranslation();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: page - 1,
    pageSize,
  });

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  useEffect(() => {
    setPagination({ pageIndex: page - 1, pageSize });
  }, [page, pageSize]);

  const table = useReactTable({
    data,
    columns,
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
            onPageChange?.(next.pageIndex + 1);
            onPageSizeChange?.(next.pageSize);
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
          <SelectTrigger className="h-8 w-full">
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
                    className="h-8 w-8 bg-card"
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
                    className="h-8 w-8 bg-card"
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

      {/* Table */}
      <div className="overflow-hidden rounded-lg outline bg-card shadow-md shadow-primary/10">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <>
                <TableRow key={headerGroup.id} className="bg-primary/5">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="h-12 px-4 font-semibold"
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
                  <TableRow className="bg-primary/5">
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
              </>
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
                    <TableCell key={cell.id} className="px-4 py-3">
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
          onPageSizeChange?.(newSize);
        }}
      />
    </div>
  );
}
