import { useRouter } from "@tanstack/react-router";
import { RiErrorWarningLine } from "@remixicon/react";
import { useTranslation } from "react-i18next";
import { EmptyStateCard } from "@/shared/components/error/EmptyStateCard";
import { getErrorMessage } from "@/shared/utils/errorHandling";

type ErrorPageProps = {
  error?: unknown;
};

export const ErrorPage = ({ error }: ErrorPageProps) => {
  const { t } = useTranslation("common");
  const router = useRouter();

  const message = getErrorMessage(error, t("errors.unexpected"));

  return (
    <EmptyStateCard
      icon={<RiErrorWarningLine className="text-destructive" />}
      title={t("errors.unexpected")}
      description={message}
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
