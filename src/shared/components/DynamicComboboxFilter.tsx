/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 *
 * Dynamic Combobox Filter Component
 * ==================================
 *
 * A reusable combobox component that fetches data from an API endpoint
 * with built-in search/filtering support. Based on shadcn combobox.
 *
 * Features:
 * - Fetches data from API endpoints
 * - Server-side and client-side search/filtering
 * - Debounced search input
 * - Loading and error states
 * - Customizable data transformation
 * - Supports paginated responses
 *
 * @example
 * ```tsx
 * // Simple usage with default transform
 * <DynamicComboboxFilter
 *   endpoint={endpoints.sectors.list}
 *   value={selectedSectorId}
 *   onChange={(value) => setSelectedSectorId(value)}
 * />
 *
 * @example
 * ```tsx
 * // With custom transform
 * <DynamicComboboxFilter
 *   endpoint={endpoints.users.list}
 *   value={selectedUserId}
 *   onChange={(value) => setSelectedUserId(value)}
 *   transformItem={(user) => ({
 *     value: user.id,
 *     label: user.fullName || `${user.firstName} ${user.lastName}`,
 *     description: user.email,
 *   })}
 *   searchQueryParam="text"
 *   serverSideSearch={true}
 * />
 * ```
 */

import * as React from "react";
import { RiCheckLine, RiArrowUpDownLine } from "@remixicon/react";
import { useApiQuery } from "@/core/api/hooks";
import { apiFetch } from "@/core/api/client";
import { type EndpointDef } from "@/core/api/endpoints";
import { type PagedResult } from "@/core/types/api";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";

/**
 * Combobox option type
 */
export type ComboboxOption = {
  value: string;
  label: string;
  description?: string;
  keywords?: string[];
  icon?: React.ReactNode;
  disabled?: boolean;
};
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Button } from "@/shared/components/ui/button";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { cn } from "@/lib/utils";

export type DynamicComboboxFilterProps<TData = unknown> = {
  /** API endpoint to fetch data from */
  endpoint: EndpointDef<unknown, unknown>;
  /** Current selected value */
  value: string | null;
  /** Callback when selection changes */
  onChange: (value: string | null, option?: ComboboxOption) => void;
  /** Transform function to convert API data to ComboboxOption */
  transformItem?: (item: TData) => ComboboxOption;
  /** Query key for React Query cache (auto-generated if not provided) */
  queryKey?: string[];
  /** Additional query parameters to send with the request */
  additionalQuery?: Record<string, unknown>;
  /** Query parameter name for search text (default: "text") */
  searchQueryParam?: string;
  /** Enable server-side search (default: true) */
  serverSideSearch?: boolean;
  /** Debounce delay for search input in ms (default: 300) */
  searchDebounceMs?: number;
  /** Minimum search length before fetching (default: 0) */
  minSearchLength?: number;
  /** Placeholder text for the combobox button */
  placeholder?: string;
  /** Placeholder text for the search input */
  searchPlaceholder?: string;
  /** Message to show when no results found */
  emptyMessage?: string;
  /** Message to show when searching */
  searchingMessage?: string;
  /** Custom className for the combobox */
  className?: string;
  /** Custom className for the button */
  buttonClassName?: string;
  /** Custom className for the popover content */
  contentClassName?: string;
  /** Disable the combobox */
  disabled?: boolean;
  /** Enable the query (useful for conditional fetching) */
  enabled?: boolean;
  /** Custom filter function for client-side filtering (used when serverSideSearch is false) */
  clientSideFilter?: (item: TData, searchText: string) => boolean;
  /** IDs to exclude from the options (useful for preventing self-reference) */
  excludeIds?: (string | number)[];
};

/**
 * Default transform function for entities with id and name
 */
function defaultTransform<T extends { id?: string | number; name?: string }>(
  item: T
): ComboboxOption {
  const id = item.id?.toString() ?? "";
  const label = item.name ?? (id || "(No Name)");
  return {
    value: id,
    label,
  };
}

/**
 * Dynamic Combobox Filter Component
 */
export function DynamicComboboxFilter<TData = unknown>({
  endpoint,
  value,
  onChange,
  transformItem = defaultTransform as (item: TData) => ComboboxOption,
  queryKey,
  additionalQuery = {},
  searchQueryParam = "text",
  serverSideSearch = true,
  searchDebounceMs = 300,
  minSearchLength = 0,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  searchingMessage = "Searching...",
  className,
  buttonClassName,
  contentClassName,
  disabled = false,
  enabled = true,
  clientSideFilter,
  excludeIds,
}: DynamicComboboxFilterProps<TData>) {
  const [open, setOpen] = React.useState(false);
  const [searchText, setSearchText] = React.useState("");
  const debouncedSearchText = useDebounce(searchText, searchDebounceMs);

  // Generate query key if not provided
  const finalQueryKey = React.useMemo(
    () =>
      queryKey ?? [
        "dynamic-combobox",
        endpoint.path,
        debouncedSearchText,
        additionalQuery,
      ],
    [queryKey, endpoint.path, debouncedSearchText, additionalQuery]
  );

  // Build query parameters
  const queryParams = React.useMemo(() => {
    const params: Record<string, unknown> = {
      ...additionalQuery,
    };

    // Always include the "text" parameter for server-side search to update the list
    // This ensures the endpoint receives the search query and can filter results accordingly
    if (serverSideSearch) {
      // Include search text if it meets minimum length, otherwise send empty string
      // Empty string allows the server to return all results when search is cleared
      const searchValue =
        debouncedSearchText.length >= minSearchLength
          ? debouncedSearchText
          : "";
      params[searchQueryParam] = searchValue;
    }

    return params;
  }, [
    additionalQuery,
    serverSideSearch,
    debouncedSearchText,
    minSearchLength,
    searchQueryParam,
  ]);

  // Fetch data from endpoint
  const { data, isLoading, isError, error } = useApiQuery<
    PagedResult<TData> | TData[]
  >({
    queryKey: finalQueryKey,
    queryFn: async () => {
      const response = await apiFetch<PagedResult<TData> | TData[]>(
        endpoint,
        {
          query: queryParams,
        }
      );
      return response;
    },
    enabled:
      enabled &&
      (!serverSideSearch || debouncedSearchText.length >= minSearchLength),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    toastOnError: true,
  });

  // Extract items from response (handle both PagedResult and array)
  const items = React.useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if ("items" in data && Array.isArray(data.items)) return data.items;
    return [];
  }, [data]);

  // Transform items to combobox options, excluding specified IDs
  const allOptions = React.useMemo(() => {
    const filteredItems = excludeIds
      ? items.filter((item) => {
        // Extract ID from item (supports both {id} and other structures)
        const itemId = (item as { id?: string | number })?.id;
        if (itemId === undefined) return true;
        return !excludeIds.includes(itemId);
      })
      : items;
    return filteredItems.map(transformItem);
  }, [items, transformItem, excludeIds]);

  // Apply client-side filtering if enabled
  const filteredOptions = React.useMemo(() => {
    if (!serverSideSearch && debouncedSearchText && clientSideFilter) {
      return allOptions.filter((_option, index) => {
        const item = items[index];
        return item ? clientSideFilter(item, debouncedSearchText) : true;
      });
    }
    if (!serverSideSearch && debouncedSearchText) {
      // Default client-side filter: search in label and keywords
      const searchLower = debouncedSearchText.toLowerCase();
      return allOptions.filter(
        (option) =>
          option.label?.toString().toLowerCase().includes(searchLower) ||
          option.keywords?.some((keyword) =>
            keyword.toLowerCase().includes(searchLower)
          )
      );
    }
    return allOptions;
  }, [
    allOptions,
    items,
    serverSideSearch,
    debouncedSearchText,
    clientSideFilter,
  ]);

  // Find selected option
  const selectedOption = React.useMemo(
    () => filteredOptions.find((option) => option.value === value) ?? null,
    [filteredOptions, value]
  );

  // Handle selection
  const handleSelect = React.useCallback(
    (currentValue: string) => {
      const nextValue = currentValue === value ? null : currentValue;
      const nextOption = nextValue
        ? filteredOptions.find((option) => option.value === nextValue)
        : undefined;

      onChange(nextValue, nextOption);
      setOpen(false);
    },
    [onChange, filteredOptions, value]
  );

  // Determine empty message based on state
  const displayEmptyMessage = React.useMemo(() => {
    if (isLoading) return searchingMessage;
    if (isError) return error?.message ?? "Error loading options.";
    if (filteredOptions.length === 0 && debouncedSearchText.length > 0)
      return emptyMessage;
    if (filteredOptions.length === 0) return emptyMessage;
    return emptyMessage;
  }, [
    isLoading,
    isError,
    error,
    filteredOptions.length,
    debouncedSearchText,
    emptyMessage,
    searchingMessage,
  ]);

  return (
    <Popover open={open} onOpenChange={(isOpen) => !disabled && setOpen(isOpen)}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-disabled={disabled || isLoading}
          disabled={disabled || isLoading}
          className={cn(
            "w-full justify-between bg-input dark:bg-input/30 dark:hover:bg-input/50",
            selectedOption ? "text-foreground" : "text-muted-foreground",
            isLoading && "opacity-50 cursor-wait",
            isError && "border-destructive",
            buttonClassName
          )}
        >
          <span className="truncate ltr:text-left rtl:text-right">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <RiArrowUpDownLine className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-[280px] p-0", contentClassName, className)}
        align="start"
        dir="rtl"
      >
        <Command dir="rtl" shouldFilter={!serverSideSearch}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchText}
            onValueChange={setSearchText}
          />
          <CommandList>
            <CommandEmpty>{displayEmptyMessage}</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  keywords={option.keywords}
                  disabled={option.disabled}
                  onSelect={handleSelect}
                  className="rtl:flex-row-reverse"
                >
                  {option.icon ? (
                    <span className="inline-flex h-4 w-4 items-center justify-center text-muted-foreground ltr:me-2 rtl:ms-2">
                      {option.icon}
                    </span>
                  ) : null}
                  <div className="flex flex-1 flex-col truncate ltr:text-left rtl:text-right">
                    <span className="truncate">{option.label}</span>
                    {option.description ? (
                      <span className="text-xs text-muted-foreground truncate">
                        {option.description}
                      </span>
                    ) : null}
                  </div>
                  <RiCheckLine
                    className={cn(
                      "h-4 w-4 shrink-0 text-primary ltr:ms-2 rtl:me-2",
                      option.value === value ? "opacity-100" : "opacity-0"
                    )}
                    aria-hidden
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
