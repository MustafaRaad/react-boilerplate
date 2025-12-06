import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useKeyboardShortcut } from "@/shared/hooks/useKeyboardShortcut";
import { useTranslation } from "react-i18next";
import { announceToScreenReader } from "@/shared/utils/a11y";

/**
 * Global keyboard shortcuts component
 * Provides common keyboard shortcuts for navigation and accessibility
 */
export const KeyboardShortcuts = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("common");

  // Ctrl/Cmd + K: Quick search (if implemented)
  useKeyboardShortcut(
    "k",
    () => {
      announceToScreenReader(t("keyboard.search"));
      console.log("Quick search: Ctrl/Cmd + K");
    },
    { ctrl: true }
  );

  // Ctrl/Cmd + /: Show keyboard shortcuts help
  useKeyboardShortcut(
    "/",
    () => {
      announceToScreenReader(t("keyboard.help"));
      console.log("Available shortcuts:");
      console.log(`- Ctrl/Cmd + K: ${t("keyboard.shortcuts.search")}`);
      console.log(`- Ctrl/Cmd + /: ${t("keyboard.shortcuts.help")}`);
      console.log(`- Ctrl/Cmd + H: ${t("keyboard.shortcuts.dashboard")}`);
      console.log(`- Ctrl/Cmd + U: ${t("keyboard.shortcuts.users")}`);
      console.log(`- Ctrl/Cmd + R: ${t("keyboard.shortcuts.statistics")}`);
      console.log(`- Escape: ${t("keyboard.shortcuts.close")}`);
    },
    { ctrl: true }
  );

  // Ctrl/Cmd + H: Navigate to home/dashboard
  useKeyboardShortcut(
    "h",
    () => {
      navigate({ to: "/" });
      announceToScreenReader(t("keyboard.shortcuts.dashboard"));
    },
    { ctrl: true }
  );

  // Ctrl/Cmd + U: Navigate to users
  useKeyboardShortcut(
    "u",
    () => {
      navigate({ to: "/dashboard/users" });
      announceToScreenReader(t("keyboard.shortcuts.users"));
    },
    { ctrl: true }
  );

  // Ctrl/Cmd + R: Navigate to roles (or statistics since roles page doesn't exist)
  useKeyboardShortcut(
    "r",
    () => {
      navigate({ to: "/dashboard/statistics" });
      announceToScreenReader(t("keyboard.shortcuts.statistics"));
    },
    { ctrl: true }
  );

  // Global Escape handler for closing modals (handled by individual components)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Let individual components handle their own escape logic
        console.log("Escape key pressed");
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // This component doesn't render anything
  return null;
};
