/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { onINP, onFCP, onLCP, onTTFB, type Metric } from "web-vitals";
import { Workbox } from "workbox-window";
import App from "@/app/App";
import { setupApiConfig } from "@/core/api/client";
import { refreshAccessToken } from "@/features/auth/hooks/useRefreshToken";
import "./assets/styles/globals.css";

// Axe accessibility auditing in development
if (import.meta.env.DEV) {
  import("@axe-core/react").then((axe) => {
    import("react").then((React) => {
      import("react-dom/client").then((ReactDOMClient) => {
        axe.default(React.default, ReactDOMClient, 1000, {
          rules: [
            { id: "color-contrast", enabled: true },
            { id: "label", enabled: true },
            { id: "button-name", enabled: true },
            { id: "link-name", enabled: true },
          ],
        });
      });
    });
  });
}

// Web Vitals monitoring
function sendToAnalytics(metric: Metric) {
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log("[Web Vitals]", metric.name, metric.value);
  }

  // In production, send to your analytics service
  // Example: analytics.track('Web Vitals', metric);
}

// Track Core Web Vitals
onINP(sendToAnalytics); // Interaction to Next Paint (replaces FID)
onFCP(sendToAnalytics); // First Contentful Paint
onLCP(sendToAnalytics); // Largest Contentful Paint
onTTFB(sendToAnalytics); // Time to First Byte

// Register Service Worker for PWA
let workbox: Workbox | null = null;

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  workbox = new Workbox("/sw.js", { scope: "/" });

  // Listen for waiting event
  workbox.addEventListener("waiting", () => {
    console.log("New service worker waiting to activate");
  });

  // Listen for activated event
  workbox.addEventListener("activated", (event) => {
    console.log(
      "Service worker activated",
      event.isUpdate ? "(update)" : "(first time)"
    );
  });

  // Listen for controlling event
  workbox.addEventListener("controlling", () => {
    console.log("Service worker is now controlling the page");
  });

  // Register the service worker
  workbox
    .register()
    .then(() => {
      console.log("Service worker registered successfully");
    })
    .catch((error) => {
      console.error("Service worker registration failed:", error);
    });
} else if (!("serviceWorker" in navigator)) {
  console.warn("Service Worker not supported in this browser");
} else {
  console.log("Service Worker disabled in development mode");
}

// Export workbox instance for use in components
export { workbox };

// Initialize application after DOM is ready
const container = document.getElementById("root");

if (!container) {
  throw new Error("Root container missing");
}

// Initialize API configuration with auto-refresh on 401
setupApiConfig({
  authRefresh: {
    enabled: true,
    refreshToken: refreshAccessToken,
  },
  logging: {
    errors: import.meta.env.DEV,
  },
});

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);
