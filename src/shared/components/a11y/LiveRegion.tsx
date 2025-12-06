/**
 * LiveRegion Component
 *
 * ARIA live region for announcing dynamic content changes to screen readers
 */

import { useEffect, useRef, useState, type ReactNode } from "react";

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

/**
 * Hook to announce messages to screen readers
 */
export function useAnnouncement(politeness: "polite" | "assertive" = "polite") {
  const [message, setMessage] = useState("");

  const announce = (text: string) => {
    // Clear first to ensure announcement fires even for repeated messages
    setMessage("");
    setTimeout(() => setMessage(text), 10);
  };

  const AnnouncementRegion = () => (
    <LiveRegion
      politeness={politeness}
      role={politeness === "assertive" ? "alert" : "status"}
    >
      {message}
    </LiveRegion>
  );

  return { announce, AnnouncementRegion };
}
