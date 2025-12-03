"use client";

import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import { useTranslations } from "next-intl";
import { getAppSettings } from "@/app-settings";
import { useApiQuery } from "@/app/api/universal";
import { DataTable } from "./DataTable";
import { TableLoading } from "./TableLoading";

export interface PagedResponse<T> {
  currentPage: number;
  pageSize: number;
  rowCount: number;
  pageCount: number;
  firstRowOnPage: number;
  lastRowOnPage: number;
  isLasPage: boolean;
  data: T[];
}

export interface DataGridProps<TData> {
  path: string;
  columns: ColumnDef<TData>[];
  extract?: (data: any) => PagedResponse<TData>;
  onRowClick?: (row: TData) => void;
  emptyMessage?: string;
  exportNameBase?: string; // optional override for export file base name
  showExport?: boolean; // control csv export visibility
}

/**
 * DataGrid - Smart wrapper around DataTable that handles data fetching
 * Fetches data from API, transforms it, and passes to DataTable
 */
export function DataGrid<TData>({
  path,
  columns,
  extract,
  onRowClick,
  emptyMessage,
  exportNameBase,
  showExport = true,
}: DataGridProps<TData>) {
  const t = useTranslations("table");
  const { tableRefetchSeconds } = getAppSettings();

  const { data, isLoading, error } = useApiQuery<any>({
    path,
    refetchInterval: tableRefetchSeconds * 1000,
  });

  // Derive dynamic export file name (base + YYYYMMDD-HHMM) BEFORE any early returns to keep hook order stable.
  const exportFileName = React.useMemo(() => {
    const base =
      (exportNameBase && exportNameBase.trim()) ||
      (() => {
        try {
          const clean = path.split("?")[0];
          const segs = clean.split("/").filter(Boolean);
          return segs[segs.length - 1] || "export";
        } catch {
          return "export";
        }
      })();
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(
      d.getDate()
    )}-${pad(d.getHours())}${pad(d.getMinutes())}`;
    return `${base}-${stamp}`;
  }, [path, exportNameBase]);

  if (isLoading) {
    return <TableLoading />;
  }

  if (error) {
    return (
      <div className="flex h-24 items-center justify-center rounded-md border border-destructive/50 bg-destructive/10">
        <p className="text-sm text-destructive">
          {t("error.loadFailed")}: {error.message}
        </p>
      </div>
    );
  }

  // Extract and transform data
  const pagedData = extract ? extract(data) : (data as PagedResponse<TData>);
  const rows = pagedData?.data ?? [];

  return (
    <DataTable
      columns={columns}
      data={rows}
      onRowClick={onRowClick}
      emptyMessage={emptyMessage}
      showExport={showExport}
      exportFileName={exportFileName}
    />
  );
}
