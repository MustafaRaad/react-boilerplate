import { useRouter } from "@tanstack/react-router";
import { Compass } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export const NotFoundPage = () => {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Compass className="h-7 w-7" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{t("errors.notFound")}</h1>
        <p className="max-w-md text-muted-foreground">
          {t("errors.notFoundDescription")}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => router.history.go(-1)}>
          {t("actions.back")}
        </Button>
        <Button onClick={() => router.navigate({ to: "/dashboard" })}>
          {t("actions.dashboard")}
        </Button>
      </div>
    </div>
  );
};
