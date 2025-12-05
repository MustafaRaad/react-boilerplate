import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from "vite-plugin-pwa";
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
    VitePWA({
      registerType: "prompt",
      includeAssets: ["vite.svg", "pwa-icon-192.svg", "pwa-icon-512.svg"],
      manifest: {
        name: "Mustafa Raad Dashboard",
        short_name: "Dashboard",
        description: "Modern React Dashboard with PWA support",
        theme_color: "#0f172a",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/pwa-icon-192.svg",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
          {
            src: "/pwa-icon-512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\/api\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 5, // 5 minutes
              },
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
        cleanupOutdatedCaches: true,
        skipWaiting: false,
        clientsClaim: true,
      },
      devOptions: {
        enabled: true,
        type: "module",
      },
    }),
    visualizer({
      filename: "./dist/stats.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
    }) as Plugin,
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
