/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

/**
 * VisuallyHidden Component
 *
 * Hides content visually but keeps it accessible to screen readers
 */

import { type ReactNode, type ElementType } from "react";

interface VisuallyHiddenProps {
  children: ReactNode;
  as?: ElementType;
}

export function VisuallyHidden({
  children,
  as: Component = "span",
}: VisuallyHiddenProps) {
  return <Component className="sr-only">{children}</Component>;
}
