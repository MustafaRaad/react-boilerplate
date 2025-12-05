import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";
import type { Plugin } from "vite";

// Security headers plugin
const securityHeadersPlugin = (): Plugin => ({
  name: "security-headers",
  configureServer(server) {
    server.middlewares.use((_req, res, next) => {
      // Strict Transport Security (HSTS)
      res.setHeader(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains"
      );

      // X-Frame-Options
      res.setHeader("X-Frame-Options", "DENY");

      // X-Content-Type-Options
      res.setHeader("X-Content-Type-Options", "nosniff");

      // X-XSS-Protection (legacy but still useful)
      res.setHeader("X-XSS-Protection", "1; mode=block");

      // Referrer-Policy
      res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

      // Permissions-Policy
      res.setHeader(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=()"
      );

      next();
    });
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    securityHeadersPlugin(),
    visualizer({
      filename: "./dist/stats.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
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
