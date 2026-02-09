/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

/**
 * Reusable page header component
 * Supports list pages and detail pages with flexible configuration
 */

import * as React from "react";
import type { ComponentType } from "react";
import { RiArrowLeftLine, RiArrowRightLine } from "@remixicon/react";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useDirection } from "@/shared/hooks/useDirection";

export interface PageHeaderAction {
  label: string;
  icon?: ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?:
  | "default"
  | "outline"
  | "destructive"
  | "secondary"
  | "ghost"
  | "link";
  size?: "default" | "sm" | "lg" | "icon" | "xs" | "icon-xs" | "icon-sm" | "icon-lg";
  permission?: string;
  tooltip?: string;
  disabled?: boolean;
  className?: string;
}

export interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional description text */
  description?: string;
  /** Optional icon to display next to title */
  icon?: ComponentType<{ className?: string }>;
  /** Optional back button handler */
  onBack?: () => void;
  /** Back button tooltip text */
  backTooltip?: string;
  /** Action buttons */
  actions?: React.ReactNode | PageHeaderAction[];
  /** Optional subtitle or meta information */
  subtitle?: React.ReactNode;
  /** Custom className for the header container */
  className?: string;
  /** Custom className for the title */
  titleClassName?: string;
  /** Custom className for the description */
  descriptionClassName?: string;
  /** Size variant for the header */
  variant?: "list" | "detail";
  /** Show icon container background */
  showIconBackground?: boolean;
}

export const PageHeader = React.memo(function PageHeader({
  title,
  description,
  icon: Icon,
  onBack,
  backTooltip,
  actions,
  subtitle,
  className,
  titleClassName,
  descriptionClassName,
  variant = "list",
  showIconBackground = true,
}: PageHeaderProps) {
  const { isRtl } = useDirection();
  const isDetail = variant === "detail";
  const titleSize = isDetail ? "text-3xl" : "text-4xl";
  const gapSize = isDetail ? "gap-6" : "gap-8";

  // Use appropriate arrow icon based on RTL direction
  const BackIcon = isRtl ? RiArrowRightLine : RiArrowLeftLine;

  // Render actions
  const renderActions = () => {
    if (!actions) return null;

    // If actions is a ReactNode, render it directly
    if (React.isValidElement(actions) || typeof actions === "string") {
      return <div className="flex items-center gap-3">{actions}</div>;
    }

    // If actions is an array of PageHeaderAction
    if (Array.isArray(actions)) {
      return (
        <div className="flex items-center gap-3">
          {actions.map((action, index) => {
            const ActionIcon = action.icon;
            const button = (
              <Button
                key={index}
                variant={action.variant || "default"}
                size={action.size || "default"}
                onClick={action.onClick}
                disabled={action.disabled}
                className={cn(
                  "gap-2 font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:opacity-90 active:scale-[0.97]",
                  action.className
                )}
              >
                {ActionIcon && <ActionIcon className="h-4 w-4" />}
                {action.label}
              </Button>
            );

            // Wrap with tooltip if provided
            if (action.tooltip) {
              return (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>{button}</TooltipTrigger>
                  <TooltipContent>
                    <p>{action.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return button;
          })}
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-border/60 dark:border-border/40 bg-card backdrop-blur-sm p-8",
        className
      )}
    >
      <div
        className={cn(
          "flex flex-col sm:flex-row sm:items-center sm:justify-between",
          gapSize
        )}
      >
        <div className={cn("space-y-3", isDetail && "space-y-4")}>
          <div className="flex items-center gap-4">
            {/* Back Button (Detail pages) */}
            {onBack && (
              <div className="flex items-center gap-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon-lg"
                        className="rounded-lg"
                        onClick={onBack}
                      >
                        <BackIcon className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{backTooltip || "Back"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}

            {/* Icon */}
            {Icon && (
              <div
                className={cn(
                  "flex items-center justify-center rounded-xl border border-border/60 dark:border-border/40 shadow-sm",
                  showIconBackground && "bg-foreground/3 dark:bg-foreground/6",
                  isDetail ? "h-10 w-10" : "h-11 w-11"
                )}
              >
                <Icon
                  className={cn(
                    isDetail
                      ? "h-5 w-5 text-foreground/80 dark:text-foreground/70"
                      : "h-5 w-5 text-foreground/80 dark:text-foreground/70"
                  )}
                />
              </div>
            )}

            {/* Title */}
            <div>
              <h1
                className={cn(
                  "font-semibold tracking-[-0.02em] text-foreground leading-none",
                  titleSize,
                  titleClassName
                )}
              >
                {title}
              </h1>
              {subtitle && (
                <div className="mt-1 text-sm text-muted-foreground">
                  {subtitle}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {description && (
            <p
              className={cn(
                "text-base text-muted-foreground font-normal leading-relaxed max-w-2xl",
                Icon && !isDetail && "pl-[60px]",
                onBack && Icon && isDetail && "pl-[60px]",
                descriptionClassName
              )}
            >
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        {renderActions()}
      </div>
    </div>
  );
});
