/**
 * Shared PWA Prompt Card Component
 *
 * Provides consistent layout for PWA prompts (install, update, etc.)
 */

import { type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/lib/utils";

interface PwaPromptAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline" | "destructive";
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  icon?: ReactNode;
}

interface PwaPromptCardProps {
  icon: ReactNode;
  iconColor?: string;
  title: string;
  description: string;
  actions: PwaPromptAction[];
  onDismiss?: () => void;
  dismissLabel?: string;
  position?: "top" | "bottom";
  className?: string;
}

export function PwaPromptCard({
  icon,
  iconColor = "bg-primary/10 text-primary",
  title,
  description,
  actions,
  onDismiss,
  dismissLabel,
  position = "bottom",
  className,
}: PwaPromptCardProps) {
  const positionClasses =
    position === "top"
      ? "top-4 animate-in slide-in-from-top-4"
      : "bottom-4 animate-in slide-in-from-bottom-4";

  return (
    <div
      className={cn(
        "fixed ltr:right-4 rtl:left-4 z-50 max-w-sm",
        positionClasses,
        className
      )}
    >
      <div className="rounded-lg border bg-card p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
              iconColor
            )}
          >
            {icon}
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-sm">{title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>

            <div className="mt-3 flex gap-2">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant={action.variant || "default"}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={index === 0 ? "flex-1" : ""}
                >
                  {action.loading ? (
                    <>
                      {action.icon}
                      {action.loadingLabel || action.label}
                    </>
                  ) : (
                    action.label
                  )}
                </Button>
              ))}
            </div>
          </div>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="rounded-sm opacity-70 transition-opacity hover:opacity-100"
              aria-label={dismissLabel || "Dismiss"}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
