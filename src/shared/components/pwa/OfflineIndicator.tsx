/**
 * Offline Indicator Component
 *
 * Shows a banner when the user is offline
 */

import { WifiOff, Wifi } from "lucide-react";
import { useOnlineStatus } from "@/shared/hooks/useOnlineStatus";
import { useTranslation } from "react-i18next";
import { useEffect, useState, useRef } from "react";

export function OfflineIndicator() {
  const { t } = useTranslation("common");
  const isOnline = useOnlineStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const prevOnlineRef = useRef(isOnline);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const wasOffline = prevOnlineRef.current === false;
    const isNowOnline = isOnline === true;

    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Only trigger reconnection message when transitioning from offline to online
    if (wasOffline && isNowOnline) {
      // Use queueMicrotask to defer setState to avoid synchronous update
      queueMicrotask(() => setShowReconnected(true));

      timerRef.current = setTimeout(() => {
        setShowReconnected(false);
      }, 3000);
    } else if (!isNowOnline && showReconnected) {
      // Reset reconnected state if going offline again
      queueMicrotask(() => setShowReconnected(false));
    }

    // Update ref when online status changes
    prevOnlineRef.current = isOnline;

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isOnline, showReconnected]);

  // Don't show anything if online and not showing reconnection
  if (isOnline && !showReconnected) {
    return null;
  }

  return (
    <div
      className={`fixed inset-x-0 top-0 z-50 animate-in slide-in-from-top ${
        showReconnected ? "bg-green-500" : "bg-yellow-500"
      } px-4 py-2 text-center text-sm font-medium text-white shadow-md`}
    >
      <div className="flex items-center justify-center gap-2">
        {showReconnected ? (
          <>
            <Wifi className="h-4 w-4" />
            <span>{t("pwa.offline.reconnected")}</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span>{t("pwa.offline.banner")}</span>
          </>
        )}
      </div>
    </div>
  );
}
