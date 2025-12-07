import { memo, useCallback } from "react";
import { UsersTable } from "@/features/users/components/UsersTable";
import { Button } from "@/shared/components/ui/button";
import { UserPlus, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AutoFormDialog } from "@/shared/forms/AutoFormDialog";
import { USER_FIELDS } from "@/features/users/config/users.config";
import { useDialogState } from "@/shared/hooks/useDialogState";
import { useCreateUser } from "../api/useUsers";
import type { UserFormData } from "../types";

export const UsersListPage = memo(function UsersListPage() {
  const { t } = useTranslation("users");
  const { t: tCommon } = useTranslation("common");
  const createDialog = useDialogState();

  const createUserMutation = useCreateUser({
    onSuccess: () => {
      toast.success(t("dialogs.create.success"));
      createDialog.close();
    },
    onError: () => toast.error(tCommon("toasts.error")),
  });

  // Memoize submit handler to prevent child re-renders
  const handleCreateSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      await createUserMutation.mutateAsync(values as UserFormData);
    },
    [createUserMutation]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Users className="h-6 w-6 text-secondary" />
            {t("list.title")}
          </h1>
          <p className="text-muted-foreground">{t("list.description")}</p>
        </div>
        <Button
          size="default"
          className="gap-2"
          onClick={() => createDialog.open()}
        >
          <UserPlus className="h-4 w-4" />
          {tCommon("actions.add")}
        </Button>
      </div>

      <UsersTable />

      <AutoFormDialog
        fields={USER_FIELDS}
        namespace="users"
        mode="create"
        open={createDialog.isOpen}
        onOpenChange={createDialog.setOpen}
        onSubmit={handleCreateSubmit}
        onSuccess={() => {
          toast.success(t("dialogs.create.success"));
          createDialog.close();
        }}
        onError={(error: unknown) => {
          toast.error(
            error instanceof Error ? error.message : tCommon("toasts.error")
          );
        }}
      />
    </div>
  );
});
