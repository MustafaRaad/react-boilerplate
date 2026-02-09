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
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    ...options,
  });

  return (value: number) => formatter.format(value);
}

export function useNumberFmt(options?: Intl.NumberFormatOptions) {
  const formatter = new Intl.NumberFormat("en-US", {
    ...options,
  });

  return (value: number) => formatter.format(value);
}

export function useDateFmt(options?: Intl.DateTimeFormatOptions) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    ...options,
  });

  return (value: Date) => formatter.format(value);
}

export function usePercentFmt(options?: Intl.NumberFormatOptions) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "percent",
    ...options,
  });

  return (value: number) => formatter.format(value);
}

export function formatDateLocal(date: Date, locale?: string): string {
  return date.toLocaleDateString(locale);
}

export function formatDateTimeLocal(date: Date, locale?: string): string {
  return date.toLocaleString(locale);
}
