/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

import { TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import * as React from "react";
import { CartesianGrid, LabelList, Line, LineChart, XAxis } from "recharts";
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
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { useCurrencyFmt } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type Row = {
  monthKey: "apr" | "may" | "jun" | "jul" | "aug" | "sep";
  income: number;
};

// Base data in millions
const baseData: Row[] = [
  { monthKey: "apr", income: 312 },
  { monthKey: "may", income: 358 },
  { monthKey: "jun", income: 402 },
  { monthKey: "jul", income: 376 },
  { monthKey: "aug", income: 395 },
  { monthKey: "sep", income: 418 },
];

export function ChartLineLabel({ className }: { className?: string }) {
  const { t } = useTranslation("statistics");

  // IQD currency using our intl helper; show integer amounts for readability.
  const amountFmt = useCurrencyFmt("IQD", { maximumFractionDigits: 0 });

  // Localize months & strings
  const data = React.useMemo(
    () =>
      baseData.map((d) => ({
        month: t(`lineLabel.months.${d.monthKey}`),
        income: d.income,
      })),
    [t]
  );

  const chartConfig = React.useMemo(
    () =>
      ({
        income: {
          label: t("lineLabel.series.income"),
          color: "var(--chart-1)",
        },
      } satisfies ChartConfig),
    [t]
  );

  const formatTooltipValue = (value: number) =>
    `${amountFmt(value)} ${t("lineLabel.units.million")}`;

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>{t("lineLabel.title")}</CardTitle>
        <CardDescription>{t("lineLabel.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={data}
            margin={{ top: 20, left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => String(value)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  formatter={(value) => [
                    formatTooltipValue(Number(value)),
                    t("lineLabel.series.incomeShort"),
                  ]}
                />
              }
            />
            <Line
              dataKey="income"
              type="natural"
              stroke="var(--color-income)"
              strokeWidth={2}
              dot={{ fill: "var(--color-income)" }}
              activeDot={{ r: 6 }}
            >
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
                formatter={(v: number) => formatTooltipValue(v)}
              />
            </Line>
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {t("lineLabel.footer.topRevenue")}{" "}
          <TrendingUp className="h-4 w-4" aria-hidden />
        </div>
        <div className="text-muted-foreground leading-none">
          {t("lineLabel.footer.note")}
        </div>
      </CardFooter>
    </Card>
  );
}

// Memoize for better performance
export default React.memo(ChartLineLabel);
