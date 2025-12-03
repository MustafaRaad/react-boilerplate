import { useEffect, useMemo, useState } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, ChevronDown, Download } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
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
  enableColumnVisibility?: boolean;
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
  enableColumnVisibility = true,
  showExport = false,
  exportFileName = "export",
  emptyMessage,
  className,
}: DataTableProps<TData>) {
  const { t } = useTranslation();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: page - 1,
    pageSize,
  });

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  useEffect(() => {
    setPagination({ pageIndex: page - 1, pageSize });
  }, [page, pageSize]);

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
      columnFilters,
      columnVisibility,
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
    onColumnVisibilityChange: setColumnVisibility,
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

  const pageSizeOptions = useMemo(() => [5, 10, 20, 30, 50, 100], []);

  // CSV Export handler
  const handleExport = () => {
    const timestamp = new Date()
      .toISOString()
      .slice(0, 16)
      .replace(/[-:]/g, "")
      .replace("T", "-");
    const fileName = `${exportFileName}-${timestamp}.csv`;

    const headers = columns
      .filter((col) => "accessorKey" in col)
      .map((col) => {
        const accessorCol = col as { accessorKey?: string; id?: string };
        return accessorCol.accessorKey || accessorCol.id || "";
      });

    const rows = table.getFilteredRowModel().rows.map((row) =>
      headers.map((header) => {
        const value = (row.original as Record<string, unknown>)[header];
        return value != null ? String(value).replace(/"/g, '""') : "";
      })
    );

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Top toolbar with export and column visibility */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          {showExport && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="me-2 h-4 w-4" />
              {t("table.export")}
            </Button>
          )}
        </div>
        {enableColumnVisibility && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ms-auto h-8">
                {t("table.columns")} <ChevronDown className="ms-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border bg-card shadow-md shadow-primary/10">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <>
                <TableRow key={headerGroup.id} className="bg-muted/50">
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
                  <TableRow className="bg-muted/30">
                    {headerGroup.headers.map((header) => {
                      const columnDef = header.column.columnDef as {
                        enableColumnFilter?: boolean;
                        meta?: {
                          filterVariant?: "select" | "input" | "date";
                          filterOptions?: Array<{
                            id: string | number;
                            name: string;
                          }>;
                        };
                      };
                      const shouldShowFilter =
                        columnDef.enableColumnFilter !== false;
                      const filterVariant = columnDef.meta?.filterVariant;
                      const filterOptions = columnDef.meta?.filterOptions;

                      return (
                        <TableHead
                          key={`${header.id}-filter`}
                          className="px-4 py-3"
                        >
                          {shouldShowFilter &&
                          header.column.getCanFilter() &&
                          !header.isPlaceholder ? (
                            filterVariant === "select" &&
                            Array.isArray(filterOptions) ? (
                              <Select
                                value={
                                  (header.column.getFilterValue() as string) ??
                                  "all"
                                }
                                onValueChange={(value) =>
                                  header.column.setFilterValue(
                                    value === "all" ? undefined : value
                                  )
                                }
                              >
                                <SelectTrigger className="h-8 w-full">
                                  <SelectValue
                                    placeholder={t("table.filter")}
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">
                                    {t("table.all")}
                                  </SelectItem>
                                  {filterOptions.map((option) => (
                                    <SelectItem
                                      key={option.id}
                                      value={String(option.id)}
                                    >
                                      {option.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : filterVariant === "date" ? (
                              <DateRangePicker
                                dateRange={
                                  header.column.getFilterValue() as
                                    | DateRange
                                    | undefined
                                }
                                onDateRangeChange={(range) =>
                                  header.column.setFilterValue(range)
                                }
                                placeholder={t("table.selectDate")}
                              />
                            ) : (
                              <Input
                                placeholder={t("table.filter")}
                                value={
                                  (header.column.getFilterValue() as string) ??
                                  ""
                                }
                                onChange={(e) =>
                                  header.column.setFilterValue(e.target.value)
                                }
                                className="h-8 w-full"
                              />
                            )
                          ) : null}
                        </TableHead>
                      );
                    })}
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
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-2"
            onClick={() => table.previousPage()}
            disabled={!canPrevious}
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            <span>{t("table.previous")}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-2"
            onClick={() => table.nextPage()}
            disabled={!canNext}
          >
            <span>{t("table.next")}</span>
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">
              {t("table.page")} {pagination.pageIndex + 1} {t("table.of")}{" "}
              {pageCount}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">{t("table.perPage")}:</p>
          <Select
            value={`${pagination.pageSize}`}
            onValueChange={(value) => {
              const newSize = Number(value);
              table.setPageSize(newSize);
              onPageSizeChange?.(newSize);
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
