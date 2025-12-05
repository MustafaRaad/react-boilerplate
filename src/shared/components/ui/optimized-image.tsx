import { type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
}

/**
 * Optimized image component with lazy loading and proper attributes
 * 
 * Features:
 * - Lazy loading by default (unless priority=true)
 * - Proper width/height to prevent layout shift
 * - Optimized loading strategy
 * - Responsive by default
 * 
 * @example
 * <OptimizedImage
 *   src="/logo.svg"
 *   alt="Company Logo"
 *   width={200}
 *   height={50}
 * />
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  ...props
}: OptimizedImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn("max-w-full h-auto", className)}
      {...props}
    />
  );
}
