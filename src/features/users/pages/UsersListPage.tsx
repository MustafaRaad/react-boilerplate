import { UsersTable } from "@/features/users/components/UsersTable";
import { Button } from "@/shared/components/ui/button";
import { UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { GenericActionDialog } from "@/shared/components/dialogs/GenericActionDialog";
import { useDialogState } from "@/shared/hooks/useDialogState";
import { useDialogConfig } from "@/shared/hooks/useDialogConfig";
import { createUserFormSchema } from "../schemas/user.schema";
import { userFieldsDefinition } from "../config/dialogConfig";
import { useCreateUser } from "../api/useUsers";
import type { UserFormData } from "../types";

export const UsersListPage = () => {
  const { t } = useTranslation("users");
  const { t: tCommon } = useTranslation("common");
  const createDialog = useDialogState();

  // Auto-generated field config from definition
  const fieldConfig = useDialogConfig<UserFormData>(
    "users",
    t,
    userFieldsDefinition
  );

  // Use the create user mutation hook
  const createUserMutation = useCreateUser({
    onSuccess: () => {
      toast.success(t("dialogs.create.success"));
      createDialog.close();
    },
    onError: () => {
      toast.error("Failed to create user");
    },
  });

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
        <Button
          size="default"
          className="gap-2"
          onClick={() => createDialog.open()}
        >
          <UserPlus className="h-4 w-4" />
          {tCommon("actions.add")}
        </Button>
      </div>

      {/* Data Table */}
      <UsersTable />

      {/* Create Dialog - Auto-generated fields */}
      <GenericActionDialog
        schema={createUserFormSchema(t)}
        open={createDialog.isOpen}
        onOpenChange={createDialog.setOpen}
        onSubmit={async (values) => {
          await createUserMutation.mutateAsync(values);
        }}
        titleKey="users:dialogs.create.title"
        description={t("dialogs.create.description")}
        fieldConfig={fieldConfig}
      />
    </div>
  );
};
