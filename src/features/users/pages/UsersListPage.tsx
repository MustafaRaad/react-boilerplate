import { UsersTable } from "@/features/users/components/UsersTable";
import { Button } from "@/shared/components/ui/button";
import { UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";

export const UsersListPage = () => {
  const { t } = useTranslation("users");
  const { t: tCommon } = useTranslation("common");

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {t("list.title")}
          </h1>
          <p className="text-muted-foreground">{t("list.description")}</p>
        </div>
        <Button size="default" className="gap-2">
          <UserPlus className="h-4 w-4" />
          {tCommon("actions.add")}
        </Button>
      </div>

      {/* Data Table */}
      <UsersTable />
    </div>
  );
};
