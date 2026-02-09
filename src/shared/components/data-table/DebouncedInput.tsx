/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

import React, { useEffect, useRef, useState, startTransition } from "react";
import { Input } from "@/shared/components/ui/input";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { cn } from "@/lib/utils";

const INPUT_DEBOUNCE_MS = 500;

// Debounced input component for column filters
export function DebouncedInput({
  column,
  t,
  placeholder,
  inputType = "text",
}: {
  column: {
    getFilterValue: () => unknown;
    setFilterValue: (value: unknown) => void;
  };
  t: (key: string) => string;
  placeholder?: string;
  inputType?: "text" | "number" | "email" | "tel" | "url" | "search";
}) {
  const filterValue = column.getFilterValue();
  const [inputValue, setInputValue] = useState(
    inputType === "number"
      ? (filterValue !== undefined && filterValue !== null && filterValue !== ""
        ? String(filterValue)
        : "")
      : ((filterValue as string) ?? "")
  );
  const debouncedValue = useDebounce(inputValue, INPUT_DEBOUNCE_MS);
  const previousFilterValueRef = useRef(filterValue);
  const isInternalUpdateRef = useRef(false);

  // Update filter when debounced value changes
  useEffect(() => {
    // Don't restore filter if it was cleared (undefined) and debouncedValue is empty
    // This prevents the filter from being restored when Clear Filters is clicked
    if (debouncedValue !== filterValue) {
      // If filterValue is undefined/null/empty and debouncedValue is also empty, skip
      // This means the filter was cleared externally
      if (filterValue === undefined && (debouncedValue === "" || debouncedValue === undefined)) {
        return;
      }
      isInternalUpdateRef.current = true;
      // For number inputs, convert to number or undefined
      if (inputType === "number") {
        const numValue = debouncedValue === "" ? undefined : Number(debouncedValue);
        column.setFilterValue(isNaN(numValue as number) ? undefined : numValue);
      } else {
        column.setFilterValue(debouncedValue || undefined);
      }
    }
  }, [debouncedValue, column, filterValue, inputType]);

  // Sync input value when filter is cleared externally (e.g., Clear Filters button)
  useEffect(() => {
    // Check if filterValue changed
    const filterValueChanged = previousFilterValueRef.current !== filterValue;

    // If filterValue changed, sync the input value
    // When clearing (filterValue is undefined), always sync regardless of internal flag
    const shouldSync = filterValueChanged && (!isInternalUpdateRef.current || filterValue === undefined);

    if (shouldSync) {
      const newValue =
        filterValue === undefined || filterValue === null || filterValue === ""
          ? ""
          : String(filterValue);
      // Always update if the value is different, especially when clearing (empty string)
      if (inputValue !== newValue) {
        // Use startTransition for all updates (including clearing)
        // The update will be fast enough that users won't notice the slight delay
        startTransition(() => {
          setInputValue(newValue);
        });
      }
    }

    // Always update the ref to track changes
    if (filterValueChanged) {
      previousFilterValueRef.current = filterValue;
    }

    // Reset internal flag after processing
    isInternalUpdateRef.current = false;
  }, [filterValue, inputValue]);

  const hasValue = inputValue !== "";

  return (
    <div className="relative">
      <Input
        type={inputType}
        placeholder={placeholder || t("table.filter")}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className={cn(
          "w-full transition-all",
          hasValue && "border-primary/50"
        )}
      />
    </div>
  );
}
