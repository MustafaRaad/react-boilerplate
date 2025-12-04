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

  const gradientId = `${baseId}-gradient`;

  return (
    <Card className={"p-0 gap-0 ".concat(className ?? "").trim()}>
      <div className="flex flex-col gap-1 px-6 pt-4">
        <p className="text-slate-500 text-lg">{title}</p>
        <h1 className="text-4xl">{value}</h1>

        <div
          className="flex gap-1 items-center text-sm"
          style={{ color: trend.color || `var(--color-${series})` }}
        >
          {trend.text}
          {trend.direction === "up" ? (
            <TrendingUp aria-hidden />
          ) : trend.direction === "down" ? (
            <TrendingDown aria-hidden />
          ) : null}
        </div>
      </div>

      <ChartContainer id={baseId} config={chartConfig} className="h-20 pb-4">
        <AreaChart accessibilityLayer data={data as any}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={`var(--color-${series})`}
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={`var(--color-${series})`}
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>
          <Area
            dataKey={series}
            type="monotone"
            fill={`url(#${gradientId})`}
            fillOpacity={0.4}
            stroke={`var(--color-${series})`}
            stackId="a"
          />
        </AreaChart>
      </ChartContainer>
    </Card>
  );
}

export default React.memo(MiniStats);
