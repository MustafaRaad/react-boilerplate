import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { cn } from "@/lib/utils";

interface DataTableSkeletonProps {
  /** Number of columns to render */
  columnCount: number;
  /** Number of rows to render (default: 10) */
  rowCount?: number;
  /** Whether to show filter row (default: false) */
  showFilters?: boolean;
  /** Whether to show toolbar with export/filter buttons (default: false) */
  showToolbar?: boolean;
  /** Custom className for container */
  className?: string;
}

export function DataTableSkeleton({
  columnCount,
  rowCount = 10,
  showFilters = false,
  showToolbar = false,
  className,
}: DataTableSkeletonProps) {
  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="bg-card rounded-lg py-4 px-4 border">
        {/* Toolbar skeleton */}
        {showToolbar && (
          <div className="flex items-center gap-2 px-1 mb-4">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-9" />
          </div>
        )}

        {/* Table skeleton */}
        <div className="border shadow rounded-lg my-4 overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader>
              {/* Header row */}
              <TableRow>
                {Array.from({ length: columnCount }).map((_, index) => (
                  <TableHead key={`header-${index}`} className="h-12 px-4">
                    <Skeleton className="h-5 w-full max-w-[120px]" />
                  </TableHead>
                ))}
              </TableRow>

              {/* Filter row skeleton */}
              {showFilters && (
                <TableRow className="bg-muted/50">
                  {Array.from({ length: columnCount }).map((_, index) => (
                    <TableHead key={`filter-${index}`} className="px-4 py-3">
                      <Skeleton className="h-8 w-full" />
                    </TableHead>
                  ))}
                </TableRow>
              )}
            </TableHeader>

            <TableBody>
              {Array.from({ length: rowCount }).map((_, rowIndex) => (
                <TableRow key={`row-${rowIndex}`}>
                  {Array.from({ length: columnCount }).map((_, cellIndex) => (
                    <TableCell
                      key={`cell-${rowIndex}-${cellIndex}`}
                      className="px-4 py-3"
                    >
                      <Skeleton
                        className={cn(
                          "h-5",
                          // Vary the widths for more realistic skeleton
                          cellIndex === 0 && "w-16",
                          cellIndex === 1 && "w-32",
                          cellIndex === 2 && "w-24",
                          cellIndex >= 3 && "w-20"
                        )}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination skeleton */}
        <div className="flex items-center justify-between px-1">
          <Skeleton className="h-5 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24" />
            <div className="flex items-center gap-1">
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
