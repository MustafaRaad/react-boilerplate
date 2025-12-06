import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useKeyboardShortcut } from "@/shared/hooks/useKeyboardShortcut";
import { announceToScreenReader } from "@/shared/utils/a11y";

/**
 * Global keyboard shortcuts component
 * Provides common keyboard shortcuts for navigation and accessibility
 */
export const KeyboardShortcuts = () => {
  const navigate = useNavigate();

  // Ctrl/Cmd + K: Quick search (if implemented)
  useKeyboardShortcut(
    "k",
    () => {
      // TODO: Open search modal when implemented
      announceToScreenReader(
        "Search shortcut pressed. Search feature coming soon."
      );
      console.log("Quick search: Ctrl/Cmd + K");
    },
    { ctrl: true }
  );

  // Ctrl/Cmd + /: Show keyboard shortcuts help
  useKeyboardShortcut(
    "/",
    () => {
      announceToScreenReader("Keyboard shortcuts help");
      // TODO: Show shortcuts help modal
      console.log("Available shortcuts:");
      console.log("- Ctrl/Cmd + K: Quick search");
      console.log("- Ctrl/Cmd + /: Show help");
      console.log("- Ctrl/Cmd + H: Go to home");
      console.log("- Ctrl/Cmd + U: Go to users");
      console.log("- Ctrl/Cmd + R: Go to roles");
      console.log("- Escape: Close modals/dialogs");
    },
    { ctrl: true }
  );

  // Ctrl/Cmd + H: Navigate to home/dashboard
  useKeyboardShortcut(
    "h",
    () => {
      navigate({ to: "/" });
      announceToScreenReader("Navigated to dashboard");
    },
    { ctrl: true }
  );

  // Ctrl/Cmd + U: Navigate to users
  useKeyboardShortcut(
    "u",
    () => {
      navigate({ to: "/dashboard/users" });
      announceToScreenReader("Navigated to users page");
    },
    { ctrl: true }
  );

  // Ctrl/Cmd + R: Navigate to roles (or statistics since roles page doesn't exist)
  useKeyboardShortcut(
    "r",
    () => {
      navigate({ to: "/dashboard/statistics" });
      announceToScreenReader("Navigated to statistics page");
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
