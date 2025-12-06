/**
 * Keyboard Shortcut Hook
 *
 * Hook for managing keyboard shortcuts with modifier key support
 */

import { useEffect } from "react";

/**
 * Keyboard shortcut handler with modifier key support
 *
 * @param key - The key to listen for (e.g., "k", "Enter")
 * @param callback - Function to execute when shortcut is pressed
 * @param modifiers - Modifier key configuration
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  modifiers: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
  } = {}
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const matchesModifiers =
        (modifiers.ctrl === undefined || e.ctrlKey === modifiers.ctrl) &&
        (modifiers.shift === undefined || e.shiftKey === modifiers.shift) &&
        (modifiers.alt === undefined || e.altKey === modifiers.alt) &&
        (modifiers.meta === undefined || e.metaKey === modifiers.meta);

      if (e.key.toLowerCase() === key.toLowerCase() && matchesModifiers) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [key, callback, modifiers]);
}
