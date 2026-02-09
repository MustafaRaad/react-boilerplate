/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Table } from "@tanstack/react-table";
import { RiArrowDownSLine, RiArrowUpSLine } from "@remixicon/react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { DateRangePicker } from "@/shared/components/ui/date-picker";
import { DynamicComboboxFilter } from "@/shared/components/DynamicComboboxFilter";
import { DebouncedInput } from "./DebouncedInput";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

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
    filterEndpoint?: unknown;
    filterTransformItem?: <TData = unknown>(item: TData) => {
      value: string;
      label: string;
      description?: string;
    };
    filterSearchQueryParam?: string;
    filterServerSideSearch?: boolean;
    isFilterDisabled?: (table: unknown) => boolean;
  };
}

// Helper function to check if filter has a value
const hasFilterValue = (filterValue: unknown): boolean => {
  if (filterValue === undefined || filterValue === null || filterValue === "") {
    return false;
  }
  if (Array.isArray(filterValue)) {
    return filterValue.length > 0;
  }
  if (typeof filterValue === "object") {
    return Object.keys(filterValue).length > 0;
  }
  return true;
};

interface DataTableFiltersProps<TData> {
  table: Table<TData>;
  enableColumnFilters?: boolean;
  enableGeneralSearch?: boolean;
  generalSearch: string;
  onGeneralSearchChange: (value: string) => void;
  columnFilters: unknown[];
}

export function DataTableFilters<TData>({
  table,
  enableColumnFilters = false,
  enableGeneralSearch = false,
  generalSearch,
  onGeneralSearchChange,
  columnFilters,
}: DataTableFiltersProps<TData>) {
  const { t } = useTranslation();
  const [showAllFilters, setShowAllFilters] = useState(false);
  const filtersContainerRef = useRef<HTMLDivElement>(null);
  const [hasWrappedFilters, setHasWrappedFilters] = useState(false);

  // Get column header label for placeholder
  function getColumnHeaderLabel(
    column: ReturnType<typeof table.getAllColumns>[0]
  ): string {
    const columnDef = column.columnDef as ColumnDefWithFilter;
    const header = columnDef.header;

    if (typeof header === "string") {
      return header;
    } else if (typeof header === "function") {
      try {
        const rendered = header({ column, header: column, table } as never);
        if (typeof rendered === "string") {
          return rendered;
        }
      } catch {
        // Fallback to column id if header function fails
      }
    }
    return column.id;
  }

  // Render filter component based on column configuration
  function renderColumnFilter(
    column: ReturnType<typeof table.getAllColumns>[0]
  ) {
    const columnDef = column.columnDef as ColumnDefWithFilter;
    const shouldShowFilter = columnDef.enableColumnFilter !== false;
    const filterVariant = columnDef.meta?.filterVariant;
    const filterInputType = columnDef.meta?.filterInputType ?? "text";
    const filterOptionsConfig = columnDef.meta?.filterOptions;
    const isFilterDisabled = columnDef.meta?.isFilterDisabled;

    if (!shouldShowFilter || !column.getCanFilter()) return null;

    const filterValue = column.getFilterValue();
    const isDisabled = isFilterDisabled ? isFilterDisabled(table) : false;
    const placeholder = getColumnHeaderLabel(column);

    // Resolve dynamic filter options
    const filterOptions =
      typeof filterOptionsConfig === "function"
        ? filterOptionsConfig(table)
        : filterOptionsConfig;

    if (filterVariant === "combobox") {
      // Check if using endpoint-based combobox
      if (columnDef.meta?.filterEndpoint) {
        const endpoint = columnDef.meta.filterEndpoint;
        const transformItem = columnDef.meta.filterTransformItem;
        const searchQueryParam = columnDef.meta.filterSearchQueryParam ?? "text";
        const serverSideSearch = columnDef.meta.filterServerSideSearch ?? true;

        return (
          <div className="relative">
            <DynamicComboboxFilter
              endpoint={endpoint}
              value={(filterValue as string) ?? null}
              onChange={(value) =>
                column.setFilterValue(value === null ? undefined : value)
              }
              transformItem={transformItem}
              searchQueryParam={searchQueryParam}
              serverSideSearch={serverSideSearch}
              placeholder={placeholder}
              searchPlaceholder={t("table.search")}
              emptyMessage={t("table.empty")}
              disabled={isDisabled}
            />
          </div>
        );
      }

      // Static combobox with options array - would need Combobox component
      // For now, fall back to select if combobox not available
      if (Array.isArray(filterOptions)) {
        return (
          <Select
            value={(filterValue as string) ?? "all"}
            onValueChange={(value) =>
              column.setFilterValue(value === "all" ? undefined : value)
            }
            disabled={isDisabled}
          >
            <SelectTrigger
              value={(filterValue as string) ?? "all"}
              className={cn(
                hasFilterValue(filterValue) &&
                filterValue !== "all" &&
                "border-primary/50"
              )}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("table.all")}</SelectItem>
              {filterOptions.map((option, index) => (
                <SelectItem
                  key={`${column.id}-${String(option.id ?? index)}`}
                  value={String(option.id)}
                >
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }
    }

    if (filterVariant === "select" && Array.isArray(filterOptions)) {
      const hasValue = hasFilterValue(filterValue) && filterValue !== "all";
      return (
        <Select
          value={(filterValue as string) ?? "all"}
          onValueChange={(value) =>
            column.setFilterValue(value === "all" ? undefined : value)
          }
          disabled={isDisabled}
        >
          <SelectTrigger
            value={(filterValue as string) ?? "all"}
            className={cn(
              "w-full transition-all",
              hasValue && "border-primary/50"
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("table.all")}</SelectItem>
            {filterOptions.map((option, index) => (
              <SelectItem
                key={`${column.id}-${String(option.id ?? index)}`}
                value={String(option.id)}
              >
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (filterVariant === "date") {
      const dateRange = filterValue as DateRange | undefined;
      const datePlaceholder = `${placeholder} - ${t("table.dateRangePlaceholder")}`;

      return (
        <div className="relative">
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={(range) => column.setFilterValue(range)}
            placeholder={datePlaceholder}
          />
        </div>
      );
    }

    // Use debounced input for text/number filters
    return (
      <DebouncedInput
        column={column}
        t={t}
        placeholder={placeholder}
        inputType={filterInputType}
      />
    );
  }

  // Get all filterable columns
  const filterableColumns = React.useMemo(() => {
    if (!enableColumnFilters) return [];
    return table.getAllColumns().filter((column) => {
      const columnDef = column.columnDef as ColumnDefWithFilter;
      const shouldShowFilter = columnDef.enableColumnFilter !== false;
      return shouldShowFilter && column.getCanFilter();
    });
  }, [table, enableColumnFilters]);

  const hasFilters = enableColumnFilters && filterableColumns.length > 0;

  // Check if filters have wrapped to multiple lines
  useEffect(() => {
    if (!enableColumnFilters || !filtersContainerRef.current) return;

    const checkWrapping = () => {
      const container = filtersContainerRef.current;
      if (!container) return;

      const children = Array.from(container.children) as HTMLElement[];
      if (children.length === 0) {
        setHasWrappedFilters(false);
        return;
      }

      // Get the first child's position as baseline
      const firstChild = children[0];
      if (!firstChild) {
        setHasWrappedFilters(false);
        return;
      }
      const firstChildTop = firstChild.offsetTop;
      const firstChildHeight = firstChild.offsetHeight;
      const firstRowBottom = firstChildTop + firstChildHeight;

      // Check if any child is positioned below the first row
      // Using a threshold to account for rounding and gaps
      const hasWrapping = children.some((child) => {
        const childTop = child.offsetTop;
        // If child is more than half its height below the first row, it's wrapped
        return childTop > firstRowBottom + firstChildHeight / 2;
      });

      setHasWrappedFilters(hasWrapping);
    };

    // Use requestAnimationFrame to ensure DOM is updated
    const rafId = requestAnimationFrame(() => {
      checkWrapping();
    });

    // Use ResizeObserver to detect layout changes
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(checkWrapping);
    });

    if (filtersContainerRef.current) {
      resizeObserver.observe(filtersContainerRef.current);
    }

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, [enableColumnFilters, filterableColumns.length, columnFilters, showAllFilters]);

  if (!hasFilters && !enableGeneralSearch) {
    return null;
  }

  return (
    <div className="relative">
      <div
        ref={filtersContainerRef}
        className={cn(
          "flex flex-col sm:flex-row flex-wrap gap-3 transition-all duration-300",
          !showAllFilters && hasWrappedFilters && "sm:max-h-16 sm:overflow-hidden"
        )}
      >
        {/* General Search Filter */}
        {enableGeneralSearch && (
          <div
            className={cn(
              "relative transition-all duration-200",
              "w-full sm:min-w-[140px] sm:max-w-[200px] sm:shrink-0"
            )}
          >
            <div
              className={cn(
                "relative",
                generalSearch && "ring-2 ring-primary/20 rounded-md"
              )}
            >
              <Input
                placeholder={t("table.generalSearch")}
                value={generalSearch}
                onChange={(e) => onGeneralSearchChange(e.target.value)}
                className={cn(
                  "w-full transition-all",
                  generalSearch && "border-primary/50"
                )}
              />
            </div>
          </div>
        )}

        {/* Column Filters */}
        {filterableColumns.map((column) => {
          const filterValue = column.getFilterValue();
          const hasValue = hasFilterValue(filterValue);

          return (
            <div
              key={column.id}
              className={cn(
                "relative transition-all duration-200",
                "w-full sm:min-w-[140px] sm:max-w-[200px] sm:shrink-0"
              )}
            >
              <div
                className={cn(
                  "relative",
                  hasValue && "ring-2 ring-primary/20 rounded-md"
                )}
              >
                {renderColumnFilter(column)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Show More/Less Button - Only show on desktop */}
      {hasWrappedFilters && (
        <div className="hidden sm:flex justify-center mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllFilters(!showAllFilters)}
          >
            {showAllFilters ? (
              <>
                <RiArrowUpSLine className="h-4 w-4" />
                <span className="hidden sm:inline">{t("table.showLess")}</span>
              </>
            ) : (
              <>
                <RiArrowDownSLine className="h-4 w-4" />
                <span className="hidden sm:inline">{t("table.showMore")}</span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
