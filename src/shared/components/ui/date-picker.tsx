import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { type DateRange } from "react-day-picker";

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
  // derive clear label (Arabic vs default) if not provided
  const computedClearLabel = React.useMemo(
    () => clearLabel ?? (/[ -~]/.test(placeholder) ? "حذف" : "Clear"),
    [clearLabel, placeholder]
  );

  function handleClear(e: React.MouseEvent) {
    e.preventDefault();
    onDateRangeChange?.(undefined);
  }
  return (
    <Popover>
      <PopoverTrigger asChild className="bg-input">
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-8",
            !dateRange && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="me-2 h-4 w-4" />
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
        <div className="flex items-center justify-between px-2 py-1 border-b bg-muted/40">
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
