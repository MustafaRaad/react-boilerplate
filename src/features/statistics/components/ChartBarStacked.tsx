/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

import { RiArrowUpLine } from "@remixicon/react";
import { useTranslation } from "react-i18next";
import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { useNumberFmt } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type Row = {
  monthKey: "jul" | "aug" | "sep" | "oct";
  buys: number;
  sells: number;
};

const baseData: Row[] = [
  { monthKey: "jul", buys: 186, sells: 140 },
  { monthKey: "aug", buys: 305, sells: 220 },
  { monthKey: "sep", buys: 237, sells: 180 },
  { monthKey: "oct", buys: 298, sells: 210 },
];

export function ChartBarStacked({ className }: { className?: string }) {
  const { t } = useTranslation("statistics");
  const num = useNumberFmt(); // localized separators

  const data = React.useMemo(
    () =>
      baseData.map((d) => ({
        month: t(`barStacked.months.${d.monthKey}`),
        buys: d.buys,
        sells: d.sells,
      })),
    [t]
  );

  const chartConfig = React.useMemo(
    () =>
      ({
        buys: {
          label: t("barStacked.series.buys"),
          color: "var(--chart-5)",
        },
        sells: {
          label: t("barStacked.series.sells"),
          color: "var(--chart-4)",
        },
      } satisfies ChartConfig),
    [t]
  );

  const fmtTooltip = (v: number) => `${num(v)} ${t("barStacked.units.order")}`;

  return (
    <Card className={cn("h-full flex flex-col " + className)}>
      <CardHeader>
        <CardTitle>{t("barStacked.title")}</CardTitle>
        <CardDescription>{t("barStacked.subtitle")}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.35 }}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, key) => [
                    fmtTooltip(Number(value)),
                    key === "buys"
                      ? t("barStacked.series.buys")
                      : t("barStacked.series.sells"),
                  ]}
                />
              }
            />

            <ChartLegend content={<ChartLegendContent />} />

            <Bar
              dataKey="buys"
              stackId="a"
              fill="var(--color-buys)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="sells"
              stackId="a"
              fill="var(--color-sells)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {t("barStacked.footer.topBuys")}{" "}
          <RiArrowUpLine className="h-4 w-4" aria-hidden />
        </div>
        <div className="text-muted-foreground leading-none">
          {t("barStacked.footer.note")}
        </div>
      </CardFooter>
    </Card>
  );
}

// Memoize for better performance
export default React.memo(ChartBarStacked);
