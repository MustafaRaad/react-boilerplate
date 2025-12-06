/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

import type { Row } from "@tanstack/react-table";
import type { DateRange } from "react-day-picker";
import { isWithinInterval, parseISO, isValid } from "date-fns";

/**
 * Date range filter function for TanStack Table
 * Filters rows based on a date column and DateRange object
 */
export function dateFilterFn<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: DateRange | undefined
): boolean {
  if (!filterValue) return true;

  const { from, to } = filterValue;
  if (!from) return true;

  const cellValue = row.getValue(columnId);
  if (!cellValue) return false;

  let date: Date;

  // Handle different date formats
  if (cellValue instanceof Date) {
    date = cellValue;
  } else if (typeof cellValue === "string") {
    date = parseISO(cellValue);
  } else if (typeof cellValue === "number") {
    date = new Date(cellValue);
  } else {
    return false;
  }

  if (!isValid(date)) return false;

  // If only 'from' is set, check if date is on or after 'from'
  if (!to) {
    return date >= from;
  }

  // If both 'from' and 'to' are set, check if date is within range
  return isWithinInterval(date, { start: from, end: to });
}

/**
 * String contains filter (case-insensitive)
 */
export function stringFilterFn<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: string
): boolean {
  const cellValue = row.getValue(columnId);
  if (!cellValue || !filterValue) return true;

  return String(cellValue)
    .toLowerCase()
    .includes(String(filterValue).toLowerCase());
}

/**
 * Exact match filter
 */
export function exactFilterFn<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: string | number
): boolean {
  const cellValue = row.getValue(columnId);
  if (filterValue === undefined || filterValue === null) return true;

  return cellValue === filterValue;
}
