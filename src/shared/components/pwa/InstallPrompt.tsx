/**
 * PWA Install Prompt Component
 *
 * Shows a prompt to install the app when beforeinstallprompt event fires
 */

import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PwaPromptCard } from "./PwaPromptCard";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function InstallPrompt() {
  const { t } = useTranslation("common");
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      queueMicrotask(() => setIsInstalled(true));
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default browser install prompt
      e.preventDefault();

      // Store the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show custom install prompt after a delay
      setTimeout(() => {
        setShowPrompt(true);
      }, 5000); // Show after 5 seconds
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for successful installation
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      console.log("PWA installed successfully");
    });

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the browser's install prompt
    await deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`User response: ${outcome}`);

    // Clear the prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);

    // Don't show again for this session
    sessionStorage.setItem("pwa-prompt-dismissed", "true");
  };

  // Don't show if already installed or dismissed
  if (
    isInstalled ||
    !showPrompt ||
    sessionStorage.getItem("pwa-prompt-dismissed")
  ) {
    return null;
  }

  return (
    <PwaPromptCard
      icon={<Download className="h-5 w-5" />}
      title={t("pwa.install.title")}
      description={t("pwa.install.description")}
      actions={[
        {
          label: t("pwa.install.button"),
          onClick: handleInstallClick,
        },
        {
          label: t("pwa.install.later"),
          onClick: handleDismiss,
          variant: "outline",
        },
      ]}
      onDismiss={handleDismiss}
      dismissLabel={t("ui.dismiss")}
      position="bottom"
    />
  );
}
