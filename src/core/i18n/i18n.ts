import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import arCommon from "@/locales/ar/common.json";
import enCommon from "@/locales/en/common.json";
import arUsers from "@/locales/ar/users.json";
import enUsers from "@/locales/en/users.json";
import arStatistics from "@/locales/ar/statistics";
import enStatistics from "@/locales/en/statistics";

export const resources = {
  en: {
    common: enCommon,
    users: enUsers,
    statistics: enStatistics,
  },
  ar: {
    common: arCommon,
    users: arUsers,
    statistics: arStatistics,
  },
} as const;

void i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    defaultNS: "common",
    fallbackLng: "ar",
    lng: "ar",
    supportedLngs: ["en", "ar"],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "cookie", "navigator"],
      caches: ["localStorage"],
    },
  });

export { i18n };
