/**
 * FocusTrap Component
 *
 * Traps keyboard focus within a container (for modals, dialogs, etc.)
 */

import { useEffect, useRef, type ReactNode } from "react";
import { trapFocus } from "@/shared/utils/a11y";

interface FocusTrapProps {
  children: ReactNode;
  enabled?: boolean;
  restoreFocus?: boolean;
}

export function FocusTrap({
  children,
  enabled = true,
  restoreFocus = true,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    // Store the currently focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus the first focusable element in the container
    const focusableElements =
      containerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Trap focus within the container
    const cleanup = trapFocus(containerRef.current);

    // Cleanup function
    return () => {
      cleanup();

      // Restore focus to the previously focused element
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [enabled, restoreFocus]);

  return <div ref={containerRef}>{children}</div>;
}
