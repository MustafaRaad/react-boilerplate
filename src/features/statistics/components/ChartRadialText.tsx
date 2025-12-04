import { TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import * as React from "react";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/shared/components/ui/chart";
import { useNumberFmt } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type Row = { key: "safari"; value: number; fill: string };

// Base data: value is in **millions**
const baseData: Row[] = [
  { key: "safari", value: 12, fill: "var(--color-safari)" },
];

export function ChartRadialText({ className }: { className?: string }) {
  const { t } = useTranslation("statistics");

  // Format plain numbers with grouping (we'll append localized "million")
  const num = useNumberFmt({ maximumFractionDigits: 0 });

  // Localize data
  const chartData = React.useMemo(
    () =>
      baseData.map((d) => ({
        series: t(`radialText.seriesKey.${d.key}`), // display name for the only series
        visitors: d.value,
        fill: d.fill,
      })),
    [t]
  );

  const chartConfig = React.useMemo(
    () =>
      ({
        visitors: {
          label: t("radialText.series.visitors"), // e.g., "Total revenue (million IQD)"
        },
        safari: {
          label: t("radialText.seriesKey.safari"), // e.g., "Safari revenue for 2025"
          color: "var(--chart-2)",
        },
      } satisfies ChartConfig),
    [t]
  );

  const centerValue = num(chartData[0].visitors); // 1,250 (localized)
  const centerCaption = t("radialText.center.caption"); // "Total revenue"
  const unitsMillion = t("radialText.units.million"); // "million"

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="items-center pb-0">
        <CardTitle>{t("radialText.title")}</CardTitle>
        <CardDescription>{t("radialText.subtitle")}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] w-full"
        >
          <RadialBarChart
            data={chartData}
            startAngle={0}
            endAngle={250}
            innerRadius={80}
            outerRadius={110}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />

            <RadialBar dataKey="visitors" background cornerRadius={10} />

            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    const cx = viewBox.cx as number;
                    const cy = viewBox.cy as number;
                    return (
                      <text
                        x={cx}
                        y={cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={cx}
                          y={cy}
                          className="fill-foreground text-4xl font-bold"
                        >
                          {centerValue} {unitsMillion}
                        </tspan>
                        <tspan
                          x={cx}
                          y={cy + 24}
                          className="fill-muted-foreground text-sm"
                        >
                          {centerCaption}
                        </tspan>
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm items-start">
        <div className="flex items-center gap-2 leading-none font-medium">
          {t("radialText.footer.delta")}{" "}
          <TrendingUp className="h-4 w-4" aria-hidden />
        </div>
        <div className="text-muted-foreground leading-none">
          {t("radialText.footer.note")}
        </div>
      </CardFooter>
    </Card>
  );
}

// Memoize for better performance
export default React.memo(ChartRadialText);
