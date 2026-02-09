/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

import { refreshAccessToken } from "@/features/auth/hooks/useRefreshToken";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/shared/components/ui/button";
import { formatDateTimeLocal } from "@/lib/formatters";

/**
 * Debug component to test refresh token functionality
 * Only visible in development mode
 */
export const RefreshTokenDebugger = () => {
  const tokens = useAuthStore((state) => state.tokens);

  const handleManualRefresh = async () => {
    console.log("[Debug] Starting manual refresh...");
    const newToken = await refreshAccessToken();
    if (newToken) {
      console.log(
        "[Debug] ✅ Refresh successful! New token:",
        newToken.substring(0, 20) + "..."
      );
    } else {
      console.log("[Debug] ❌ Refresh failed!");
    }
  };

  const handleSimulate401 = async () => {
    console.log("[Debug] Simulating 401 error...");
    // This will trigger a 401 which should auto-refresh
    try {
      const response = await fetch("/api/test-401", {
        headers: {
          Authorization: `Bearer ${tokens?.accessToken}`,
        },
      });
      console.log("[Debug] Response status:", response.status);
    } catch (error) {
      console.error("[Debug] Error:", error);
    }
  };

  const handleExpireToken = () => {
    console.log("[Debug] Expiring current token...");
    const store = useAuthStore.getState();
    if (store.tokens) {
      store.setAuth({
        tokens: {
          ...store.tokens,
          accessTokenExpiresAt: Date.now() - 1000, // Set to past
        },
      });
      console.log("[Debug] Token expired (set to past)");
    }
  };

  if (import.meta.env.PROD) {
    return null; // Hidden in production
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black text-white p-4 rounded-lg shadow-lg space-y-2 max-w-xs">
      <div className="text-sm font-bold">🔧 Refresh Token Debugger</div>

      <div className="text-xs bg-gray-800 p-2 rounded max-h-20 overflow-y-auto">
        <div>Token: {tokens?.accessToken?.substring(0, 20)}...</div>
        <div>
          Expires:{" "}
          {tokens
            ? formatDateTimeLocal(new Date(tokens.accessTokenExpiresAt))
            : "N/A"}
        </div>
        <div>Backend: {tokens?.backend}</div>
      </div>

      <div className="space-y-1">
        <Button
          size="sm"
          className="w-full text-xs"
          onClick={handleManualRefresh}
          variant="secondary"
        >
          🔄 Manual Refresh
        </Button>

        <Button
          size="sm"
          className="w-full text-xs"
          onClick={handleExpireToken}
          variant="secondary"
        >
          ⏰ Expire Token
        </Button>

        <Button
          size="sm"
          className="w-full text-xs"
          onClick={handleSimulate401}
          variant="secondary"
        >
          ⚠️ Simulate 401
        </Button>
      </div>

      <div className="text-xs text-gray-400 border-t border-gray-600 pt-2">
        Check console for logs [Refresh] [Client] [ErrorInterceptor]
      </div>
    </div>
  );
};
