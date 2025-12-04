import { useTranslation } from "react-i18next";
import { ChartAreaInteractive } from "../components/ChartAreaInteractive";
import { ChartBarLabelCustom } from "../components/ChartBarLabelCustom";
import { ChartBarStacked } from "../components/ChartBarStacked";
import { ChartLineLabel } from "../components/ChartLineLabel";
import { ChartPieLabel } from "../components/ChartPieLabel";
import { ChartRadialText } from "../components/ChartRadialText";
import { MiniStats } from "../components/MiniStats";

// Sample data for mini stats
const miniStatsSales = Array.from({ length: 30 }, (_, i) => ({
  date: `2024-${String(i + 1).padStart(2, "0")}`,
  amount: 200 + Math.random() * 100,
}));

const miniStatsTransactions = Array.from({ length: 30 }, (_, i) => ({
  date: `2024-${String(i + 1).padStart(2, "0")}`,
  count: 30 + Math.random() * 20,
}));

const miniStatsCustomers = Array.from({ length: 30 }, (_, i) => ({
  date: `2024-${String(i + 1).padStart(2, "0")}`,
  count: 2 + Math.random() * 4,
}));

export function StatisticsPage() {
  const { t } = useTranslation("statistics");

  return (
    <div className="container mx-auto space-y-6">
      {/* Mini Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <MiniStats
          title={t("miniStats.sales.title")}
          value="260,000,000"
          trend={{
            text: t("miniStats.sales.trend"),
            direction: "up",
            color: "text-emerald-500",
          }}
          data={miniStatsSales}
          seriesKey="amount"
          color="var(--chart-1)"
        />
        <MiniStats
          title={t("miniStats.transactions.title")}
          value="1,300"
          trend={{
            text: t("miniStats.transactions.trend"),
            direction: "up",
            color: "text-emerald-500",
          }}
          data={miniStatsTransactions}
          seriesKey="count"
          color="var(--chart-2)"
        />
        <MiniStats
          title={t("miniStats.customers.title")}
          value="92"
          trend={{
            text: t("miniStats.customers.trend"),
            direction: "down",
            color: "text-rose-500",
          }}
          data={miniStatsCustomers}
          seriesKey="count"
          color="var(--chart-3)"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartAreaInteractive />
        <ChartBarLabelCustom />
        <ChartBarStacked />
        <ChartLineLabel />
        <ChartRadialText />
        <ChartPieLabel />
      </div>
    </div>
  );
}
