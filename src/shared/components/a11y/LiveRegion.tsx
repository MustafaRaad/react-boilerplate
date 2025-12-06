/**
 * LiveRegion Component
 *
 * ARIA live region for announcing dynamic content changes to screen readers
 */

import { type ReactNode } from "react";

interface LiveRegionProps {
  children: ReactNode;
  politeness?: "polite" | "assertive" | "off";
  atomic?: boolean;
  relevant?: "additions" | "removals" | "text" | "all";
  role?: "status" | "alert" | "log";
}

export function LiveRegion({
  children,
  politeness = "polite",
  atomic = true,
  relevant = "all",
  role = "status",
}: LiveRegionProps) {
  return (
    <div
      role={role}
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className="sr-only"
    >
      {children}
    </div>
  );
}
