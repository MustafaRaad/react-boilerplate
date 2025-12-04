import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { Eye, Pencil, Trash2, type LucideIcon } from "lucide-react";

/**
 * Configuration for a table action button
 * @template TData - The type of data the action operates on
 */
export interface DataTableAction<TData> {
  /** Lucide icon component to display */
  icon: LucideIcon;
  /** Label text shown in tooltip (use translated strings) */
  label: string;
  /** Callback function when action is clicked */
  onClick: (row: TData) => void;
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
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {actions.map((action, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${
                  action.variant === "destructive"
                    ? "text-destructive hover:text-destructive"
                    : ""
                }`}
                onClick={() => action.onClick(row)}
              >
                <action.icon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{action.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}

// Export icons for convenience
export { Eye, Pencil, Trash2 };
