import { TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import * as React from "react";
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts";
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
import { useDirection } from "@/shared/hooks/useDirection";

type Row = {
  companyKey: "zain" | "asiacell" | "korek" | "earthlink" | "newroz";
  volume: number; // millions of IQD
};

// Base data (amounts in "millions")
const baseData: Row[] = [
  { companyKey: "zain", volume: 275 },
  { companyKey: "asiacell", volume: 200 },
  { companyKey: "korek", volume: 187 },
  { companyKey: "earthlink", volume: 173 },
  { companyKey: "newroz", volume: 90 },
];

export function ChartBarLabelCustom({ className }: { className?: string }) {
  const { t } = useTranslation("statistics");
  const { dir } = useDirection();

  // IQD currency using our intl helper; show integer amounts for readability.
  const amountFmt = useCurrencyFmt("IQD", { maximumFractionDigits: 0 });

  // Localize company names
  const data = React.useMemo(
    () =>
      baseData.map((d) => ({
        company: t(`barLabelCustom.companies.${d.companyKey}`),
        volume: d.volume,
      })),
    [t]
  );

  const chartConfig = React.useMemo(
    () =>
      ({
        volume: {
          label: t("barLabelCustom.series.volume"),
          color: "var(--chart-2)",
        },
        label: {
          color: "var(--background)",
        },
      } satisfies ChartConfig),
    [t]
  );

  const formatValue = (value: number) =>
    `${amountFmt(value)} ${t("barLabelCustom.units.million")}`;

  return (
    <Card className={cn(className)} dir={dir}>
      <CardHeader>
        <CardTitle>{t("barLabelCustom.title")}</CardTitle>
        <CardDescription>{t("barLabelCustom.subtitle")}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1">
        <ChartContainer config={chartConfig} className="w-full" dir="ltr">
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{ right: 16 }}
          >
            <YAxis
              dataKey="company"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              hide
            />
            <XAxis dataKey="volume" type="number" hide />

            <ChartTooltip
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.35 }}
              content={
                <ChartTooltipContent
                  indicator="line"
                  formatter={(value) => [
                    formatValue(Number(value)),
                    t("barLabelCustom.series.volumeShort"),
                  ]}
                />
              }
            />

            <Bar
              dataKey="volume"
              layout="vertical"
              fill="var(--color-volume)"
              radius={4}
            >
              {/* Company names inside left */}
              <LabelList
                dataKey="company"
                position="insideLeft"
                offset={8}
                className="fill-background font-medium"
                fontSize={12}
              />
              {/* Values on the right edge */}
              <LabelList
                dataKey="volume"
                position="right"
                offset={8}
                className="fill-foreground font-medium"
                fontSize={12}
                formatter={(v: number) => formatValue(v)}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {t("barLabelCustom.footer.topCompany")}{" "}
          <TrendingUp className="h-4 w-4" aria-hidden />
        </div>
        <div className="text-muted-foreground leading-none">
          {t("barLabelCustom.footer.note")}
        </div>
      </CardFooter>
    </Card>
  );
}

// Memoize for better performance
export default React.memo(ChartBarLabelCustom);
