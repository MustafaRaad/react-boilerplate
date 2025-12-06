/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

import type { ReactNode } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/shared/components/ui/empty";

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline";
}

interface EmptyStateCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  actions: EmptyStateAction[];
  minHeight?: string;
}

/**
 * Reusable empty state card component
 * Consolidates consistent styling for error/empty states across the app
 */
export function EmptyStateCard({
  icon,
  title,
  description,
  actions,
  minHeight = "min-h-[60vh]",
}: EmptyStateCardProps) {
  return (
    <Empty className={minHeight}>
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex items-center gap-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              variant={action.variant || "default"}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </EmptyContent>
    </Empty>
  );
}
