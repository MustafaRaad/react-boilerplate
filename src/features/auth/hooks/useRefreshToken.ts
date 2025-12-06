/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

import { apiFetch } from "@/core/api/client";
import { endpoints } from "@/core/api/endpoints";
import { normalizeRefreshResponse } from "@/core/api/normalizers";
import { useAuthStore } from "@/store/auth.store";

/**
 * Function to refresh authentication tokens
 * Used by the auto-refresh interceptor when a 401 error occurs
 *
 * This is NOT a React hook - it can be called outside components
 * @returns Function that attempts to refresh the token, returns new access token or null
 */
export async function refreshAccessToken(): Promise<string | null> {
  try {
    console.log("[Refresh] Token refresh initiated");

    const store = useAuthStore.getState();
    const tokens = store.tokens;

    // Can't refresh if we don't have tokens
    if (!tokens) {
      console.warn("[Refresh] No tokens found in store");
      return null;
    }

    console.log("[Refresh] Current tokens backend:", tokens.backend);
    console.log(
      "[Refresh] Current token expires at:",
      new Date(tokens.accessTokenExpiresAt).toISOString()
    );

    // Call refresh endpoint
    console.log("[Refresh] Calling /auth/refresh endpoint");
    const refreshResponse = await apiFetch(endpoints.auth.refresh, {
      overrideBackendKind: tokens.backend,
    });

    console.log("[Refresh] Refresh response received:", refreshResponse);

    // Normalize the refresh response to AuthTokens
    const newTokens = normalizeRefreshResponse(refreshResponse, tokens.backend);

    console.log(
      "[Refresh] New tokens normalized, expires at:",
      new Date(newTokens.accessTokenExpiresAt).toISOString()
    );

    // Update the store with new tokens
    store.setAuth({ tokens: newTokens });

    console.log("[Refresh] Store updated with new tokens");

    // Return the new access token for the interceptor
    return newTokens.accessToken;
  } catch (error) {
    console.error("[Refresh] Token refresh failed:", error);
    // Return null to indicate refresh failed, will trigger logout
    return null;
  }
}

/**
 * Hook wrapper for useRefreshToken - for use inside React components
 * Returns the refreshAccessToken function
 */
export const useRefreshToken = () => {
  return refreshAccessToken;
};
