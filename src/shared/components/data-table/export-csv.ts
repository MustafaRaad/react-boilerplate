/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

import type { ColumnDef } from "@tanstack/react-table";

/**
 * Safely retrieves nested values from an object using dot notation.
 * Example: getNestedValue({ user: { name: "John" } }, "user.name") => "John"
 */
function getNestedValue(obj: unknown, path: string): unknown {
  if (!obj || !path) return undefined;

  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc == null || typeof acc !== "object") return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}

/**
 * Escapes CSV values by wrapping in quotes if needed and escaping existing quotes.
 */
function csvEscape(val: string): string {
  const needsQuotes = /[",\n\r]/.test(val);
  let escaped = val.replace(/"/g, '""');
  if (needsQuotes) {
    escaped = `"${escaped}"`;
  }
  return escaped;
}

/**
 * Formats a value for CSV export with smart type handling.
 */
function formatCsvValue(value: unknown): string {
  if (value == null) return "";

  // Handle Date objects
  if (value instanceof Date) {
    return value.toLocaleString();
  }

  // Handle ISO date strings
  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)
  ) {
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  }

  // Handle arrays (join with semicolon)
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join("; ");
  }

  // Handle objects (stringify)
  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

export interface ExportCsvOptions<TData> {
  fileName?: string;
  columns: ColumnDef<TData, unknown>[];
  rows: TData[];
  locale?: string;
}

/**
 * Auto-generates a filename from the current URL path.
 * Example: /dashboard/users → "users"
 * Falls back to "data" if extraction fails.
 */
function generateFileName(): string {
  try {
    const pathSegments = window.location.pathname.split("/").filter(Boolean);
    // Get the last segment (e.g., "users" from "/dashboard/users")
    const lastSegment = pathSegments[pathSegments.length - 1];
    return lastSegment || "data";
  } catch {
    return "data";
  }
}

/**
 * Exports table data to a CSV file with UTF-8 BOM for proper Excel compatibility.
 *
 * Features:
 * - Auto-generates filename from URL path if not provided
 * - Skips columns with meta.export === false or id === 'actions'
 * - Handles nested accessors (e.g., 'user.name')
 * - Formats dates automatically
 * - Escapes special characters properly
 * - Includes UTF-8 BOM for Arabic/RTL support in Excel
 * - Adds timestamp to filename automatically
 */
export function exportToCsv<TData>({
  fileName,
  columns,
  rows,
}: ExportCsvOptions<TData>) {
  // Auto-generate filename from URL path if not provided
  const baseFileName = fileName || generateFileName();
  // Filter exportable columns
  const exportableColumns = columns.filter((col) => {
    const colDef = col as ColumnDef<TData, unknown> & {
      accessorKey?: string;
      id?: string;
      meta?: { export?: boolean };
    };

    const effectiveId = colDef.accessorKey || colDef.id;

    // Skip actions column and explicitly excluded columns
    if (effectiveId === "actions") return false;
    if (colDef.meta?.export === false) return false;

    // Must have both header and accessor
    return Boolean(colDef.header) && Boolean(effectiveId);
  });

  if (exportableColumns.length === 0) {
    console.warn("No exportable columns found");
    return;
  }

  // Extract header names
  const headers = exportableColumns.map((col) => {
    const colDef = col as ColumnDef<TData, unknown> & {
      header?: string | ((props: unknown) => unknown);
      accessorKey?: string;
      id?: string;
    };

    if (typeof colDef.header === "string") {
      return colDef.header;
    }
    return colDef.accessorKey || colDef.id || "";
  });

  // Build CSV content
  const lines: string[] = [];
  lines.push(headers.map(csvEscape).join(","));

  rows.forEach((row) => {
    const values = exportableColumns.map((col) => {
      const colDef = col as ColumnDef<TData, unknown> & {
        accessorKey?: string;
        id?: string;
      };

      const accessor = colDef.accessorKey || colDef.id || "";

      // Get value from row
      let value: unknown;
      if (accessor.includes(".")) {
        value = getNestedValue(row, accessor);
      } else {
        value = (row as Record<string, unknown>)[accessor];
      }

      const formatted = formatCsvValue(value);
      return csvEscape(formatted);
    });
    lines.push(values.join(","));
  });

  // Add timestamp to filename
  const timestamp = new Date()
    .toISOString()
    .slice(0, 16)
    .replace(/[-:]/g, "")
    .replace("T", "-");
  const finalFileName = `${baseFileName}-${timestamp}.csv`;

  // Create and download file with UTF-8 BOM for Excel compatibility
  const csvContent = "\ufeff" + lines.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = finalFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
