/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { ConfirmDeleteDialog } from "@/shared/components/ConfirmDeleteDialog";
import { Eye, Pencil, Trash2, type LucideIcon } from "lucide-react";
import React from "react";

/**
 * Configuration for a table action button
 */
export interface DataTableAction<TData> {
  icon: LucideIcon;
  label: string;
  onClick?: (row: TData) => void;
  onConfirm?: (row: TData) => Promise<void> | void;
  confirmTitle?: string | ((row: TData) => string);
  confirmDescription?: string | ((row: TData) => string);
  variant?: "default" | "destructive";
  show?: boolean | ((row: TData) => boolean);
  disabled?: boolean | ((row: TData) => boolean);
}

interface DataTableActionsProps<TData> {
  row: TData;
  actions: DataTableAction<TData>[];
}

const DataTableActionsComponent = <TData,>({
  row,
  actions,
}: DataTableActionsProps<TData>) => {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {actions.map((action, index) => {
          const shouldShow =
            typeof action.show === "function"
              ? action.show(row)
              : action.show ?? true;
          if (!shouldShow) return null;

          const isDisabled =
            typeof action.disabled === "function"
              ? action.disabled(row)
              : action.disabled ?? false;

          const button = (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${
                action.variant === "destructive"
                  ? "text-destructive hover:text-destructive hover:bg-destructive/10"
                  : ""
              }`}
              disabled={isDisabled}
              onClick={() => !action.onConfirm && action.onClick?.(row)}
              aria-label={action.label}
            >
              <action.icon className="size-4" aria-hidden="true" />
            </Button>
          );

          // For confirmation actions (delete), wrap with confirmation dialog
          if (action.onConfirm) {
            const title =
              typeof action.confirmTitle === "function"
                ? action.confirmTitle(row)
                : action.confirmTitle;
            const description =
              typeof action.confirmDescription === "function"
                ? action.confirmDescription(row)
                : action.confirmDescription;

            return (
              <Tooltip key={index}>
                <ConfirmDeleteDialog
                  trigger={<TooltipTrigger asChild>{button}</TooltipTrigger>}
                  onConfirm={() => action.onConfirm?.(row)}
                  title={title}
                  description={description}
                  disabled={isDisabled}
                />
                <TooltipContent>
                  <p>{action.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          }

          // For regular actions, just wrap with tooltip
          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>{button}</TooltipTrigger>
              <TooltipContent>
                <p>{action.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export const DataTableActions = React.memo(
  DataTableActionsComponent
) as typeof DataTableActionsComponent;

export { Eye, Pencil, Trash2 };
