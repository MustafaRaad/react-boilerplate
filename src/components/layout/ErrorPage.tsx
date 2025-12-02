import { useRouter } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

type ErrorPageProps = {
  error?: unknown;
};

export const ErrorPage = ({ error }: ErrorPageProps) => {
  const { t } = useTranslation();
  const router = useRouter();

  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
      ? error
      : t("errors.unexpected");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{t("errors.unexpected")}</h1>
        <p className="max-w-md text-muted-foreground">{message}</p>
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
