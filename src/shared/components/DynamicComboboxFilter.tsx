/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 *
 * Dynamic Combobox Filter Component
 * ==================================
 *
 * A professional combobox component that fetches data from an API endpoint.
 * Handles API data fetching and transformation, delegates UI to base Combobox component.
 *
 * Features:
 * - Fetches data from API endpoints
 * - Server-side and client-side search/filtering
 * - Debounced search input
 * - Customizable data transformation
 * - Supports paginated responses
 *
 * @example
 * ```tsx
 * <DynamicComboboxFilter
 *   endpoint={endpoints.roles.list}
 *   value={selectedRoleId}
 *   onChange={(value) => setSelectedRoleId(value)}
 * />
 * ```
 */

import * as React from "react";
import { useApiQuery } from "@/core/api/hooks";
import { apiFetch } from "@/core/api/client";
import { type EndpointDef } from "@/core/api/endpoints";
import { type PagedResult } from "@/core/types/api";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/shared/components/ui/combobox";
import { useDebounce } from "@/shared/hooks/useDebounce";

/**
 * Combobox option type
 */
export type ComboboxOption = {
  value: string;
  label: string;
  description?: string;
  keywords?: string[];
  icon?: React.ReactNode;
};

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
  /** Placeholder text for the combobox input */
  placeholder?: string;
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
 * Handles API data fetching and delegates UI to base Combobox component
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
  placeholder = "Select option...",
  enabled = true,
  clientSideFilter,
  excludeIds,
}: DynamicComboboxFilterProps<TData>) {
  const [inputValue, setInputValue] = React.useState("");
  const debouncedSearchText = useDebounce(inputValue, searchDebounceMs);

  // Generate query key
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

  // Build query parameters for API call
  const queryParams = React.useMemo(() => {
    const params: Record<string, unknown> = {
      ...additionalQuery,
    };

    if (serverSideSearch) {
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

  // Fetch data from API
  const { data } = useApiQuery<PagedResult<TData> | TData[]>({
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
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    toastOnError: true,
  });

  // Extract items from API response
  const items = React.useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if ("items" in data && Array.isArray(data.items)) return data.items;
    return [];
  }, [data]);

  // Transform API items to combobox options
  const allOptions = React.useMemo(() => {
    const filteredItems = excludeIds
      ? items.filter((item) => {
        const itemId = (item as { id?: string | number })?.id;
        if (itemId === undefined) return true;
        return !excludeIds.includes(itemId);
      })
      : items;
    return filteredItems.map(transformItem);
  }, [items, transformItem, excludeIds]);

  // Apply client-side filtering if needed
  const filteredOptions = React.useMemo(() => {
    if (!serverSideSearch && debouncedSearchText && clientSideFilter) {
      return allOptions.filter((_option, index) => {
        const item = items[index];
        return item ? clientSideFilter(item, debouncedSearchText) : true;
      });
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

  // Handle value change
  const handleValueChange = React.useCallback(
    (option: ComboboxOption | null) => {
      if (option) {
        onChange(option.value, option);
      } else {
        onChange(null, undefined);
      }
      setInputValue("");
    },
    [onChange]
  );

  // Handle input change for server-side search
  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (serverSideSearch) {
        setInputValue(e.target.value);
      }
    },
    [serverSideSearch]
  );

  // Filter function for combobox (client-side only)
  const filterFunction = React.useCallback(
    (option: ComboboxOption, query: string): boolean => {
      if (serverSideSearch) return true;

      const queryLower = query.toLowerCase();
      if (option.label?.toLowerCase().includes(queryLower)) return true;
      if (option.description?.toLowerCase().includes(queryLower)) return true;
      if (
        option.keywords?.some((keyword) =>
          keyword.toLowerCase().includes(queryLower)
        )
      )
        return true;
      return false;
    },
    [serverSideSearch]
  );

  // Sync input when value changes externally
  React.useEffect(() => {
    if (!value) {
      setInputValue("");
    } else if (selectedOption && serverSideSearch) {
      setInputValue("");
    }
  }, [value, selectedOption, serverSideSearch]);

  return (
    <Combobox
      items={filteredOptions}
      itemToStringValue={(option) => option.label}
      value={selectedOption}
      onValueChange={handleValueChange}
      filter={filterFunction}
    >
      <ComboboxInput
        placeholder={selectedOption ? selectedOption.label : placeholder}
        value={serverSideSearch ? inputValue : undefined}
        onChange={serverSideSearch ? handleInputChange : undefined}
        showTrigger={true}
        showClear={!!value}
      />
      <ComboboxContent
      >
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
