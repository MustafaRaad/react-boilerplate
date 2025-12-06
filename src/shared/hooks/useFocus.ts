/**
 * Focus Management Hooks
 *
 * Hooks for managing keyboard focus and navigation
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { getFocusableElements } from "@/shared/utils/a11y";

/**
 * Auto-focus an element when component mounts
 */
export function useAutoFocus<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, []);

  return ref;
}

/**
 * Restore focus to the previously focused element
 */
export function useRestoreFocus() {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousActiveElement.current = document.activeElement as HTMLElement;

    return () => {
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, []);
}

/**
 * Track focus within a container
 */
export function useFocusWithin<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const isFocusWithinRef = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleFocusIn = () => (isFocusWithinRef.current = true);
    const handleFocusOut = (e: FocusEvent) => {
      if (!element.contains(e.relatedTarget as Node)) {
        isFocusWithinRef.current = false;
      }
    };

    element.addEventListener("focusin", handleFocusIn);
    element.addEventListener("focusout", handleFocusOut);

    return () => {
      element.removeEventListener("focusin", handleFocusIn);
      element.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  return { ref, isFocusWithin: isFocusWithinRef.current };
}

/**
 * Roving tabindex pattern for composite widgets
 */
export function useRovingTabIndex<T extends HTMLElement>(
  containerRef: React.RefObject<T>,
  orientation: "horizontal" | "vertical" | "both" = "both"
) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!containerRef.current) return;

      const focusableElements = getFocusableElements(containerRef.current);
      const currentIndex = focusableElements.indexOf(
        document.activeElement as HTMLElement
      );

      if (currentIndex === -1) return;

      let nextIndex = currentIndex;

      const isHorizontal =
        orientation === "horizontal" || orientation === "both";
      const isVertical = orientation === "vertical" || orientation === "both";

      switch (e.key) {
        case "ArrowRight":
          if (isHorizontal) {
            e.preventDefault();
            nextIndex = (currentIndex + 1) % focusableElements.length;
          }
          break;
        case "ArrowLeft":
          if (isHorizontal) {
            e.preventDefault();
            nextIndex =
              currentIndex === 0
                ? focusableElements.length - 1
                : currentIndex - 1;
          }
          break;
        case "ArrowDown":
          if (isVertical) {
            e.preventDefault();
            nextIndex = (currentIndex + 1) % focusableElements.length;
          }
          break;
        case "ArrowUp":
          if (isVertical) {
            e.preventDefault();
            nextIndex =
              currentIndex === 0
                ? focusableElements.length - 1
                : currentIndex - 1;
          }
          break;
        case "Home":
          e.preventDefault();
          nextIndex = 0;
          break;
        case "End":
          e.preventDefault();
          nextIndex = focusableElements.length - 1;
          break;
      }

      if (nextIndex !== currentIndex) {
        focusableElements[nextIndex]?.focus();
      }
    },
    [containerRef, orientation]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("keydown", handleKeyDown as EventListener);

    return () => {
      container.removeEventListener("keydown", handleKeyDown as EventListener);
    };
  }, [containerRef, handleKeyDown]);
}

/**
 * Keyboard shortcut handler
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
