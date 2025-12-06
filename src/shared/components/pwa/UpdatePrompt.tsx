/**
 * PWA Update Prompt Component
 *
 * Shows a prompt when a new version of the service worker is available
 */

import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/components/ui/button";
import type { Workbox } from "workbox-window";

interface UpdatePromptProps {
  workbox: Workbox | null;
}

export function UpdatePrompt({ workbox }: UpdatePromptProps) {
  const { t } = useTranslation("common");
  const [showPrompt, setShowPrompt] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!workbox) return;

    // Listen for waiting service worker
    const handleWaiting = () => {
      setShowPrompt(true);
    };

    workbox.addEventListener("waiting", handleWaiting);

    return () => {
      workbox.removeEventListener("waiting", handleWaiting);
    };
  }, [workbox]);

  const handleUpdate = async () => {
    if (!workbox) return;

    setIsUpdating(true);

    // Send SKIP_WAITING message to the waiting service worker
    workbox.addEventListener("controlling", () => {
      // Reload the page to use the new service worker
      window.location.reload();
    });

    // Tell the service worker to skip waiting
    workbox.messageSkipWaiting();
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed top-4 ltr:right-4 rtl:left-4 z-50 max-w-sm animate-in slide-in-from-top-4">
      <div className="rounded-lg border bg-card p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
            <RefreshCw className="h-5 w-5 text-blue-500" />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-sm">{t("pwa.update.title")}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("pwa.update.description")}
            </p>

            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                onClick={handleUpdate}
                disabled={isUpdating}
                className="flex-1"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="ltr:mr-2 rtl:ml-2 h-3 w-3 animate-spin" />
                    {t("pwa.update.updating")}
                  </>
                ) : (
                  t("pwa.update.button")
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowPrompt(false)}
                disabled={isUpdating}
              >
                {t("pwa.update.later")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
