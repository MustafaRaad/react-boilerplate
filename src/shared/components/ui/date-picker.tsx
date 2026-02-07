import * as React from "react";
import { RiCalendarLine } from "@remixicon/react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { type DateRange } from "react-day-picker";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";

interface DateRangePickerProps {
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
  clearLabel?: string;
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  placeholder = "اختر تاريخ",
  className,
  clearLabel,
}: DateRangePickerProps) {
  const { t } = useTranslation("common");

  // derive clear label (Arabic vs default) if not provided
  const computedClearLabel = React.useMemo(
    () => clearLabel ?? (/[ -~]/.test(placeholder) ? "حذف" : "Clear"),
    [clearLabel, placeholder]
  );

  function handleClear(e: React.MouseEvent) {
    e.preventDefault();
    onDateRangeChange?.(undefined);
  }

  function handleQuickSelect(days: number) {
    const today = endOfDay(new Date());
    const from = startOfDay(subDays(today, days));
    onDateRangeChange?.({ from, to: today });
  }

  return (
    <Popover>
      <PopoverTrigger asChild className="bg-input dark:bg-input/30">
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left h-8",
            !dateRange && "text-muted-foreground",
            className
          )}
        >
          <RiCalendarLine className="me-2 h-4 w-4" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "LLL dd, y")} -{" "}
                {format(dateRange.to, "LLL dd, y")}
              </>
            ) : (
              format(dateRange.from, "LLL dd, y")
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[110%] p-0" align="end">
        <div className="flex items-center justify-between px-2 py-1 border-b bg-muted/20">
          <span className="text-xs font-medium select-none">{placeholder}</span>
          {dateRange?.from && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={handleClear}
            >
              {computedClearLabel}
            </Button>
          )}
        </div>
        <div className="flex gap-1 p-2 border-b">
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs flex-1"
            onClick={() => handleQuickSelect(1)}
          >
            {t("datePicker.lastDay")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs flex-1"
            onClick={() => handleQuickSelect(7)}
          >
            {t("datePicker.lastWeek")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs flex-1"
            onClick={() => handleQuickSelect(30)}
          >
            {t("datePicker.lastMonth")}
          </Button>
        </div>
        <Calendar
          dir="ltr"
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={onDateRangeChange}
          numberOfMonths={1}
          className="w-full"
        />
      </PopoverContent>
    </Popover>
  );
}
