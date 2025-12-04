import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowUpRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { mainNavItems } from "@/shared/config/navigation";
import { cn } from "@/lib/utils";

export const Overview = () => {
  const { t } = useTranslation();

  const pages = mainNavItems
    .filter((item) => item.href !== "/dashboard")
    .map((item) => ({
      ...item,
      label: t(`navigation.${item.feature ?? item.label.toLowerCase()}`, {
        defaultValue: item.label,
      }),
      displayPath: item.href.replace(/^\/dashboard\/?/, "/"),
    }));

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {pages.map((item) => {
        const Icon = item.icon;
        const displayPath = item.displayPath === "" ? "/" : item.displayPath;
        return (
          <Link key={item.href} to={item.href} className="group focus:outline-none">
            <Card
              className={cn(
                "transition-all duration-200 hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg"
              )}
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex items-center gap-2">
                  {Icon ? (
                    <span className="rounded-full bg-primary/10 p-2 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                  ) : null}
                  <div>
                    <CardTitle className="text-lg">{item.label}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      {t("dashboard.quickStats")}
                    </CardDescription>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("actions.view", { ns: "common" })}
                    </p>
                    <p className="text-xl font-semibold">{item.label}</p>
                  </div>
                  {displayPath ? (
                    <div className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                      {displayPath}
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
};
