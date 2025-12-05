import { TrendingDown, TrendingUp } from "lucide-react";
import * as React from "react";
import { Area, AreaChart } from "recharts";
import { Card } from "@/shared/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/shared/components/ui/chart";

type AnyRecord = Record<string, unknown>;
type TrendDirection = "up" | "down" | null;

type MiniStatsProps<T extends AnyRecord = AnyRecord> = {
  id?: string;
  title: string;
  value: string | number;
  trend: {
    text: string;
    direction: TrendDirection;
    color?: string;
  };
  data: T[];
  seriesKey: keyof T | string;
  color?: string;
  className?: string;
};

function stableHash(input: string) {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = (h * 33) ^ input.charCodeAt(i);
  return (h >>> 0).toString(36);
}

export function MiniStats<T extends AnyRecord = AnyRecord>({
  id,
  title,
  value,
  trend,
  data,
  seriesKey,
  color = "var(--chart-4)",
  className,
}: MiniStatsProps<T>) {
  const series = String(seriesKey);

  const chartConfig = React.useMemo(
    () =>
      ({
        [series]: {
          label: title,
          color,
        },
      } satisfies ChartConfig),
    [series, title, color]
  );

  const baseId = React.useMemo(() => {
    if (id) return id;
    return `mini-${stableHash(`${series}|${title}`)}`;
  }, [id, series, title]);

  return (
    <Card
      className={"overflow-hidden border-border/40 shadow-sm hover:shadow-md hover:border-border transition-all duration-300 "
        .concat(className ?? "")
        .trim()}
    >
      <div className="flex flex-col gap-3 p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {title}
          </p>
          <div
            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
              trend.direction === "up"
                ? "text-green-700 dark:text-green-400 ring-1 ring-green-200 dark:ring-green-900/30"
                : trend.direction === "down"
                ? "text-red-700 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-900/30"
                : "text-muted-foreground ring-1 ring-border"
            }`}
          >
            {trend.direction === "up" ? (
              <TrendingUp className="w-3.5 h-3.5" aria-hidden />
            ) : trend.direction === "down" ? (
              <TrendingDown className="w-3.5 h-3.5" aria-hidden />
            ) : null}
            {trend.text}
          </div>
        </div>

        {/* Value Section */}
        <div className="flex items-baseline gap-2">
          <h2 className="text-4xl font-bold tracking-tight">{value}</h2>
        </div>

        {/* Chart Section */}
        <div className="mt-2 -mx-2">
          <ChartContainer
            id={baseId}
            config={chartConfig}
            className="h-16 w-full"
          >
            <AreaChart
              accessibilityLayer
              data={data}
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            >
              <Area
                dataKey={series}
                type="monotone"
                fill="none"
                stroke={`var(--color-${series})`}
                strokeWidth={2}
                dot={false}
                activeDot={false}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </div>
    </Card>
  );
}

export default React.memo(MiniStats);
