/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

// Locale-aware formatting utilities for numbers, currency, and dates

export function useCurrencyFmt(
  currency: string = "IQD",
  options?: Intl.NumberFormatOptions
) {
  return (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      ...options,
    }).format(value);
  };
}

export function useNumberFmt(options?: Intl.NumberFormatOptions) {
  return (value: number) => {
    return new Intl.NumberFormat("en-US", {
      ...options,
    }).format(value);
  };
}

export function useDateFmt(options?: Intl.DateTimeFormatOptions) {
  return (value: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      ...options,
    }).format(value);
  };
}

export function usePercentFmt(options?: Intl.NumberFormatOptions) {
  return (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      ...options,
    }).format(value);
  };
}
