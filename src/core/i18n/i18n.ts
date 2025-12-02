import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import arCommon from "@/locales/ar/common";
import enCommon from "@/locales/en/common";
import arUsers from "@/locales/ar/users";
import enUsers from "@/locales/en/users";

export const resources = {
  en: {
    common: enCommon,
    users: enUsers,
  },
  ar: {
    common: arCommon,
    users: arUsers,
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
