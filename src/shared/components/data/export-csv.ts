import type { ColumnDef } from "@tanstack/react-table";

// Utility to safely get nested values from row.original using dot accessor
function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  return path
    .split(".")
    .reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

export interface ExportCsvOptions<T> {
  fileName?: string;
  columns: ColumnDef<T, any>[];
  rows: T[]; // raw row originals
  locale?: string; // future use
}

/**
 * Exports the provided rows & columns to a UTF-8 BOM CSV so Arabic renders correctly in Excel.
 * Columns with meta.export === false or id === 'actions' are skipped.
 */
export function exportToCsv<T>({
  fileName = "export",
  columns,
  rows,
}: ExportCsvOptions<T>) {
  const exportableColumns = columns.filter((col: any) => {
    const accessorKey: string | undefined = col.accessorKey;
    const effectiveId = accessorKey || col.id;
    if (effectiveId === "actions") return false;
    if (col.meta && col.meta.export === false) return false;
    return Boolean(col.header) && Boolean(effectiveId);
  });

  // Resolve header text
  const headers = exportableColumns.map((col: any) => {
    if (typeof col.header === "string") return col.header;
    return col.accessorKey || col.id || "";
  });

  const lines: string[] = [];
  lines.push(headers.map(csvEscape).join(","));

  rows.forEach((row: any) => {
    const values = exportableColumns.map((col: any) => {
      const accessor: string = col.accessorKey || col.id;
      let raw = accessor?.includes(".")
        ? getNestedValue(row, accessor)
        : row[accessor];
      if (raw == null) raw = "";
      // Basic date formatting if value looks like ISO
      if (typeof raw === "string" && /\d{4}-\d{2}-\d{2}T/.test(raw)) {
        try {
          raw = new Date(raw).toLocaleString();
        } catch {}
      }
      if (raw instanceof Date) raw = raw.toLocaleString();
      return csvEscape(String(raw));
    });
    lines.push(values.join(","));
  });

  const csvContent = "\ufeff" + lines.join("\n"); // BOM for Excel Arabic support
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function csvEscape(val: string): string {
  const needsQuotes = /[",\n]/.test(val);
  let escaped = val.replace(/"/g, '""');
  if (needsQuotes) escaped = '"' + escaped + '"';
  return escaped;
}
