import { memo, useCallback } from "react";
import { UsersTable } from "@/features/users/components/UsersTable";
import { RiUserAddLine, RiGroupLine } from "@remixicon/react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AutoFormDialog } from "@/shared/forms/AutoFormDialog";
import { USER_FIELDS } from "@/features/users/config/users.config";
import { useDialogState } from "@/shared/hooks/useDialogState";
import { useCreateUser } from "../api/useUsers";
import type { UserFormData } from "../types";
import { getErrorMessage } from "@/shared/utils/errorHandling";
import { PageHeader, type PageHeaderAction } from "@/shared/components/PageHeader";

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

  const headerActions: PageHeaderAction[] = [
    {
      label: tCommon("actions.add"),
      icon: RiUserAddLine,
      onClick: () => createDialog.open(),
      variant: "default",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("list.title")}
        description={t("list.description")}
        icon={RiGroupLine}
        variant="list"
        actions={headerActions}
      />

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
          toast.error(getErrorMessage(error, tCommon("toasts.error")));
        }}
      />
    </div>
  );
});
