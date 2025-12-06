/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

export type SupportedLocale = "en" | "ar";

const RTL_LOCALES = new Set<SupportedLocale | string>(["ar"]);

export function isRtlLocale(locale?: string | null): boolean {
  if (!locale) return false;
  const normalized = locale.toLowerCase().split("-")[0];
  return RTL_LOCALES.has(normalized);
}

export function dirFromLocale(locale?: string | null): "ltr" | "rtl" {
  return isRtlLocale(locale) ? "rtl" : "ltr";
}
