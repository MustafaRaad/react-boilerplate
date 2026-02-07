/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/app/App";
import { setupApiConfig } from "@/core/api/client";
import { refreshAccessToken } from "@/features/auth/hooks/useRefreshToken";
import "./assets/styles/globals.css";


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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
