import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { dirFromLocale, isRtlLocale } from "@/core/i18n/direction";

export function useDirection() {
  const { i18n } = useTranslation();
  const rawLocale = i18n.resolvedLanguage ?? i18n.language ?? "en";

  const locale = useMemo(
    () => rawLocale.toLowerCase().split("-")[0],
    [rawLocale]
  );
  const dir = dirFromLocale(locale);
  const isRtl = isRtlLocale(locale);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
  }, [locale, dir]);

  return { locale, dir, isRtl };
}
