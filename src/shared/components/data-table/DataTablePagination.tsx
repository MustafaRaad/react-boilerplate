import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

interface DataTablePaginationProps {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export function DataTablePagination({
  pageIndex,
  pageSize,
  pageCount,
  canPreviousPage,
  canNextPage,
  onPreviousPage,
  onNextPage,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 30, 50, 100],
}: DataTablePaginationProps) {
  const { t } = useTranslation();

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
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          <span className="hidden sm:inline">{t("table.previous")}</span>
        </Button>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium whitespace-nowrap">
            {t("table.page")} {pageIndex + 1} {t("table.of")} {pageCount}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2"
          onClick={onNextPage}
          disabled={!canNextPage}
        >
          <span className="hidden sm:inline">{t("table.next")}</span>
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
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
}
