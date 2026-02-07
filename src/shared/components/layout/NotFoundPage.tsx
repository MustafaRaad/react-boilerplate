import { useRouter } from "@tanstack/react-router";
import { RiCompassLine } from "@remixicon/react";
import { useTranslation } from "react-i18next";
import { EmptyStateCard } from "@/shared/components/error/EmptyStateCard";

export const NotFoundPage = () => {
  const { t } = useTranslation("common");
  const router = useRouter();

  return (
    <EmptyStateCard
      icon={<RiCompassLine className="text-primary" />}
      title={t("errors.notFound")}
      description={t("errors.notFoundDescription")}
      actions={[
        {
          label: t("actions.back"),
          onClick: () => router.history.go(-1),
          variant: "outline",
        },
        {
          label: t("actions.dashboard"),
          onClick: () => router.navigate({ to: "/dashboard" }),
        },
      ]}
    />
  );
};
