import React from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { ConfirmDeleteDialog } from "@/shared/components/ConfirmDeleteDialog";
import { Eye, Pencil, Trash2, type LucideIcon } from "lucide-react";

type MaybeRenderFn<TData> = React.ReactNode | ((row: TData) => React.ReactNode);

/**
 * Configuration for a table action button
 * @template TData - The type of data the action operates on
 */
export interface DataTableAction<TData> {
  /** Lucide icon component to display */
  icon: LucideIcon;
  /** Label text shown in tooltip (use translated strings) */
  label: string;
  /** Callback function when action is clicked (non-confirm actions) */
  onClick?: (row: TData) => void;
  /** Callback when confirmation is accepted (use for destructive actions) */
  onConfirm?: (row: TData) => Promise<void> | void;
  /** Optional confirmation copy overrides */
  confirm?: {
    title?: MaybeRenderFn<TData>;
    description?: MaybeRenderFn<TData>;
    confirmLabel?: MaybeRenderFn<TData>;
    cancelLabel?: MaybeRenderFn<TData>;
  };
  /** Button variant, use "destructive" for delete actions */
  variant?: "default" | "destructive";
}

interface DataTableActionsProps<TData> {
  row: TData;
  actions: DataTableAction<TData>[];
}

export function DataTableActions<TData>({
  row,
  actions,
}: DataTableActionsProps<TData>) {
  const resolveConfirmContent = (
    value: MaybeRenderFn<TData> | undefined
  ): React.ReactNode => {
    if (typeof value === "function") {
      return value(row);
    }
    return value;
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {actions.map((action, index) => (
          <React.Fragment key={index}>
            {action.onConfirm ? (
              <ConfirmDeleteDialog
                onConfirm={() => action.onConfirm?.(row)}
                title={resolveConfirmContent(action.confirm?.title)}
                description={resolveConfirmContent(
                  action.confirm?.description
                )}
                confirmLabel={resolveConfirmContent(
                  action.confirm?.confirmLabel
                )}
                cancelLabel={resolveConfirmContent(
                  action.confirm?.cancelLabel
                )}
                trigger={
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 ${
                          action.variant === "destructive"
                            ? "text-destructive hover:text-destructive"
                            : ""
                        }`}
                      >
                        <action.icon />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{action.label}</p>
                    </TooltipContent>
                  </Tooltip>
                }
              />
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${
                      action.variant === "destructive"
                        ? "text-destructive hover:text-destructive"
                        : ""
                    }`}
                    onClick={() => action.onClick?.(row)}
                  >
                    <action.icon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{action.label}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </React.Fragment>
        ))}
      </div>
    </TooltipProvider>
  );
}

// Export icons for convenience
export { Eye, Pencil, Trash2 };
