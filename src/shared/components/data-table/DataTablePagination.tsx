/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

import { useTranslation } from "react-i18next";
import { RiArrowLeftLine, RiArrowRightLine } from "@remixicon/react";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "@/lib/utils";
import React from "react";

interface DataTablePaginationProps {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

const DataTablePaginationComponent = ({
  pageIndex,
  pageSize,
  pageCount,
  canPreviousPage,
  canNextPage,
  onPreviousPage,
  onNextPage,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 30, 50, 100],
}: DataTablePaginationProps) => {
  const { t } = useTranslation();

  // Generate page numbers to display
  const getPageNumbers = () => {
    const currentPage = pageIndex + 1;
    const pages: (number | string)[] = [];
    const maxVisible = 7; // Maximum number of page buttons to show

    if (pageCount <= maxVisible) {
      // Show all pages if total pages is less than maxVisible
      for (let i = 1; i <= pageCount; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 3) {
        // Near the start
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(pageCount);
      } else if (currentPage >= pageCount - 2) {
        // Near the end
        pages.push("ellipsis");
        for (let i = pageCount - 3; i <= pageCount; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(pageCount);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col gap-4 px-1 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2"
          onClick={onPreviousPage}
          disabled={!canPreviousPage}
        >
          <RiArrowLeftLine className="h-4 w-4 rtl:rotate-180" />
          <span className="hidden sm:inline">{t("table.previous")}</span>
        </Button>
        
        {/* Page number buttons */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === "ellipsis") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-sm text-muted-foreground"
                >
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isCurrentPage = pageNum === pageIndex + 1;

            return (
              <Button
                key={pageNum}
                variant={isCurrentPage ? "default" : "outline"}
                size="sm"
                className={cn(
                  "h-8 min-w-8 px-2",
                  isCurrentPage && "bg-primary text-primary-foreground"
                )}
                onClick={() => onPageChange(pageNum - 1)}
                aria-label={t("table.page") + " " + pageNum}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2"
          onClick={onNextPage}
          disabled={!canNextPage}
        >
          <span className="hidden sm:inline">{t("table.next")}</span>
          <RiArrowRightLine className="h-4 w-4 rtl:rotate-180" />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-sm text-muted-foreground whitespace-nowrap hidden sm:inline">
          {t("table.perPage")}:
        </p>
        <Select
          value={`${pageSize}`}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={`${size}`}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export const DataTablePagination = React.memo(DataTablePaginationComponent);
