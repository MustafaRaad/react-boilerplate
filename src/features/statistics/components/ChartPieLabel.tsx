import { TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import * as React from "react";
import { Pie, PieChart } from "recharts";
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
import { useCurrencyFmt, usePercentFmt } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type Row = {
  investorKey: "mustafa" | "sarah" | "laith" | "zainab" | "omar";
  amount: number; // millions of IQD
  fill: string;
};

// Base data (amounts in "millions")
const baseData: Row[] = [
  { investorKey: "mustafa", amount: 300, fill: "var(--color-chart-1)" },
  { investorKey: "sarah", amount: 200, fill: "var(--color-chart-2)" },
  { investorKey: "laith", amount: 187, fill: "var(--color-chart-3)" },
  { investorKey: "zainab", amount: 173, fill: "var(--color-chart-4)" },
  { investorKey: "omar", amount: 90, fill: "var(--color-chart-5)" },
];

export function ChartPieLabel({ className }: { className?: string }) {
  const { t } = useTranslation("statistics");

  // Intl helpers
  const amountFmt = useCurrencyFmt("IQD", { maximumFractionDigits: 0 });
  const percentFmt = usePercentFmt({ maximumFractionDigits: 1 });

  // Localize data (investor display names)
  const chartData = React.useMemo(
    () =>
      baseData.map((d) => ({
        investor: t(`pieLabel.investors.${d.investorKey}`),
        amount: d.amount,
        fill: d.fill,
      })),
    [t]
  );

  const chartConfig = React.useMemo(
    () =>
      ({
        amount: {
          label: t("pieLabel.series.amount"),
        },
      } satisfies ChartConfig),
    [t]
  );

  const formatAmount = (v: number) =>
    `${amountFmt(v)} ${t("pieLabel.units.million")}`;

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="items-center pb-0">
        <CardTitle>{t("pieLabel.title")}</CardTitle>
        <CardDescription>{t("pieLabel.subtitle")}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[250px] pb-0 w-full"
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, _name, payload) => [
                    formatAmount(Number(value)),
                    payload?.payload?.investor ?? "",
                  ]}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="investor"
              label={({ name, percent }) =>
                `${name as string} ${percentFmt(percent ?? 0)}`
              }
              labelLine={false}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm items-start">
        <div className="flex gap-2 leading-none font-medium">
          {t("pieLabel.footer.topInvestor")}{" "}
          <TrendingUp className="h-4 w-4" aria-hidden />
        </div>
        <div className="text-muted-foreground leading-none">
          {t("pieLabel.footer.note")}
        </div>
      </CardFooter>
    </Card>
  );
}

// Memoize for better performance
export default React.memo(ChartPieLabel);
