"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type Table as TanStackTable,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Download } from "lucide-react";
import { DateRangePicker } from "@/components/ui/date-picker";
import type { DateRange } from "react-day-picker";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    filterVariant?: "select" | "input" | "date";
    filterOptions?: any[];
  }
}

export interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
  enableColumnFilters?: boolean;
  emptyMessage?: string;
  showExport?: boolean;
  exportFileName?: string;
}

/**
 * Core DataTable component using TanStack Table
 * Handles filtering, rendering, and basic interactions
 */
export function DataTable<TData>({
  columns,
  data,
  onRowClick,
  enableColumnFilters = true,
  emptyMessage = "No data available",
  showExport = false,
  exportFileName = "export",
}: DataTableProps<TData>) {
  const t = useTranslations("table");
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: enableColumnFilters
      ? getFilteredRowModel()
      : undefined,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    state: {
      columnFilters,
      pagination,
    },
  });

  function handleExport() {
    import("./export-csv").then(({ exportToCsv }) => {
      exportToCsv({
        fileName: exportFileName,
        columns,
        rows: table.getRowModel().rows.map((r) => r.original),
      });
    });
  }

  return (
    <div className="space-y-4">
      {showExport && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4" />
            {t("actions.export")}
          </Button>
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <React.Fragment key={headerGroup.id}>
                <TableRow>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
                {enableColumnFilters && (
                  <TableRow>
                    {headerGroup.headers.map((header) => {
                      const filterVariant =
                        header.column.columnDef.meta?.filterVariant;
                      const filterOptions =
                        header.column.columnDef.meta?.filterOptions;

                      return (
                        <TableHead key={`${header.id}-filter`} className="p-2">
                          {header.column.getCanFilter() &&
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
                                    value === "all" ? "" : value
                                  )
                                }
                              >
                                <SelectTrigger className="h-8 w-full">
                                  <SelectValue
                                    placeholder={
                                      t("filters.placeholder") ??
                                      t("filters.title")
                                    }
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">
                                    {t("filters.all")}
                                  </SelectItem>
                                  {filterOptions.map((option: any) => (
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
                                placeholder={
                                  t("filters.datePlaceholder") ??
                                  t("filters.title")
                                }
                              />
                            ) : (
                              <Input
                                placeholder={
                                  t("filters.placeholder") ?? t("filters.title")
                                }
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
                  className={onRowClick ? "cursor-pointer" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className="h-12" key={cell.id}>
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
                  className="h-12 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="h-8 gap-2"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            <span>{t("pagination.prev")}</span>
          </Button>
          <Button
            variant="outline"
            className="h-8 gap-2"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span>{t("pagination.next")}</span>
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">
                {t("pagination.pageOf", {
                  page: table.getState().pagination.pageIndex + 1,
                  total: table.getPageCount(),
                })}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {t("pagination.rowsPerPage")}:
          </p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 30, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
