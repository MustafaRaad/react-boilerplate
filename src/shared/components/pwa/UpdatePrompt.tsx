/**
 * PWA Update Prompt Component
 *
 * Shows a prompt when a new version of the service worker is available
 */

import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PwaPromptCard } from "./PwaPromptCard";
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
    <PwaPromptCard
      icon={<RefreshCw className="h-5 w-5" />}
      iconColor="bg-blue-500/10 text-blue-500"
      title={t("pwa.update.title")}
      description={t("pwa.update.description")}
      actions={[
        {
          label: t("pwa.update.button"),
          onClick: handleUpdate,
          disabled: isUpdating,
          loading: isUpdating,
          loadingLabel: t("pwa.update.updating"),
          icon: (
            <RefreshCw className="ltr:mr-2 rtl:ml-2 h-3 w-3 animate-spin" />
          ),
        },
        {
          label: t("pwa.update.later"),
          onClick: () => setShowPrompt(false),
          variant: "outline",
          disabled: isUpdating,
        },
      ]}
      position="top"
    />
  );
}
