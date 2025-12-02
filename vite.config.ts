import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5018,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          "react-vendor": ["react", "react-dom", "react/jsx-runtime"],
          // Router
          "router-vendor": ["@tanstack/react-router"],
          // State management and forms
          "state-vendor": ["zustand", "@tanstack/react-form"],
          // React Query
          "query-vendor": ["@tanstack/react-query"],
          // i18n
          "i18n-vendor": [
            "react-i18next",
            "i18next",
            "i18next-browser-languagedetector",
          ],
          // UI components
          "ui-vendor": ["lucide-react", "clsx", "tailwind-merge"],
          // Table
          "table-vendor": ["@tanstack/react-table"],
          // Validation
          "validation-vendor": ["zod"],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
