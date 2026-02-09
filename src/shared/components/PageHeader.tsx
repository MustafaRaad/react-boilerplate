/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

/**
 * Professional PageHeader Component
 * 
 * A flexible, performant header component for list and detail pages.
 * Built with shadcn/ui components and optimized for performance.
 * 
 * @example
 * ```tsx
 * <PageHeader
 *   title="Users"
 *   description="Manage your users"
 *   icon={RiUserLine}
 *   variant="list"
 *   actions={[
 *     {
 *       label: "Add User",
 *       icon: RiAddLine,
 *       onClick: handleAdd,
 *       variant: "default"
 *     }
 *   ]}
 * />
 * ```
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

// ============================================================================
// Types
// ============================================================================

export interface PageHeaderAction {
  /** Button label text */
  label: string;
  /** Optional icon component */
  icon?: ComponentType<{ className?: string }>;
  /** Click handler */
  onClick: () => void;
  /** Button variant */
  variant?:
  | "default"
  | "outline"
  | "destructive"
  | "secondary"
  | "ghost"
  | "link";
  /** Button size */
  size?: "default" | "sm" | "lg" | "icon" | "xs" | "icon-xs" | "icon-sm" | "icon-lg";
  /** Optional permission check (for future use) */
  permission?: string;
  /** Tooltip text */
  tooltip?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Custom className */
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
  /** Action buttons or custom ReactNode */
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

// ============================================================================
// Sub-components
// ============================================================================

interface BackButtonProps {
  onBack: () => void;
  tooltip?: string;
  isRtl: boolean;
}

const BackButton = React.memo(function BackButton({
  onBack,
  tooltip,
  isRtl,
}: BackButtonProps) {
  const BackIcon = isRtl ? RiArrowRightLine : RiArrowLeftLine;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon-lg"
            className="rounded-lg shrink-0"
            onClick={onBack}
            aria-label={tooltip || "Go back"}
          >
            <BackIcon className="size-4" />
          </Button>
        </TooltipTrigger>
        {tooltip && (
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
});

interface IconContainerProps {
  icon: ComponentType<{ className?: string }>;
  isDetail: boolean;
  showBackground: boolean;
}

const IconContainer = React.memo(function IconContainer({
  icon: Icon,
  isDetail,
  showBackground,
}: IconContainerProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl border border-border/60 dark:border-border/40 shadow-sm shrink-0",
        showBackground && "bg-foreground/3 dark:bg-foreground/6",
        isDetail ? "h-10 w-10" : "h-11 w-11"
      )}
    >
      <Icon
        className={cn(
          "h-5 w-5 text-foreground/80 dark:text-foreground/70"
        )}
      />
    </div>
  );
});

interface ActionButtonProps {
  action: PageHeaderAction;
  index: number;
}

const ActionButton = React.memo(function ActionButton({
  action,
  index,
}: ActionButtonProps) {
  const ActionIcon = action.icon;

  const button = (
    <Button
      variant={action.variant || "default"}
      size={action.size || "default"}
      onClick={action.onClick}
      disabled={action.disabled}
      className={cn(
        "gap-2 font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:opacity-90 active:scale-[0.97]",
        action.className
      )}
      aria-label={action.tooltip || action.label}
    >
      {ActionIcon && <ActionIcon className="h-4 w-4 shrink-0" />}
      <span className="whitespace-nowrap">{action.label}</span>
    </Button>
  );

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
});

interface ActionsContainerProps {
  actions: React.ReactNode | PageHeaderAction[];
}

const ActionsContainer = React.memo(function ActionsContainer({
  actions,
}: ActionsContainerProps) {
  if (!actions) return null;

  // If actions is a ReactNode, render it directly
  if (React.isValidElement(actions) || typeof actions === "string") {
    return (
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {actions}
      </div>
    );
  }

  // If actions is an array of PageHeaderAction
  if (Array.isArray(actions)) {
    return (
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {actions.map((action, index) => (
          <ActionButton key={index} action={action} index={index} />
        ))}
      </div>
    );
  }

  return null;
});

// ============================================================================
// Main Component
// ============================================================================

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

  // Computed styles based on variant
  const titleSize = isDetail
    ? "text-2xl sm:text-3xl"
    : "text-3xl sm:text-4xl";
  const gapSize = isDetail ? "gap-4 sm:gap-6" : "gap-6 sm:gap-8";
  const contentGap = isDetail ? "space-y-3 sm:space-y-4" : "space-y-3 sm:space-y-4";

  // Calculate description padding based on layout
  const hasIconOrBack = Icon || onBack;
  const descriptionPadding = hasIconOrBack
    ? "pl-0 sm:pl-[60px]"
    : "";

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-border/60 dark:border-border/40",
        "bg-card backdrop-blur-sm",
        "p-4 sm:p-6 lg:p-8",
        className
      )}
    >
      <div
        className={cn(
          "flex flex-col",
          "sm:flex-row sm:items-start sm:justify-between",
          gapSize
        )}
      >
        {/* Left Section: Title, Icon, Description */}
        <div className={cn("flex-1 min-w-0", contentGap)}>
          {/* Title Row: Back Button, Icon, Title */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            {/* Back Button */}
            {onBack && (
              <BackButton
                onBack={onBack}
                tooltip={backTooltip}
                isRtl={isRtl}
              />
            )}

            {/* Icon */}
            {Icon && (
              <IconContainer
                icon={Icon}
                isDetail={isDetail}
                showBackground={showIconBackground}
              />
            )}

            {/* Title and Subtitle */}
            <div className="flex-1 min-w-0">
              <h1
                className={cn(
                  "font-semibold tracking-[-0.02em] text-foreground leading-tight",
                  "wrap-break-word",
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
                "text-sm sm:text-base text-muted-foreground font-normal",
                "leading-relaxed max-w-2xl wrap-break-word",
                descriptionPadding,
                descriptionClassName
              )}
            >
              {description}
            </p>
          )}
        </div>

        {/* Right Section: Actions */}
        {actions && (
          <div className="shrink-0">
            <ActionsContainer actions={actions} />
          </div>
        )}
      </div>
    </div>
  );
});

// Display name for debugging
PageHeader.displayName = "PageHeader";
