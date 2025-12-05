import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Eye, Pencil, Trash2 } from "lucide-react";
import {
  DataTable,
  type DataTableAction,
} from "@/shared/components/data-table/DataTable.tsx";
import { useUsers } from "@/features/users/api/useUsers";
import { createUsersColumns } from "./UsersTable.columns.tsx";
import { GenericActionDialog } from "@/shared/components/dialogs/GenericActionDialog";
import { useDialogState } from "@/shared/hooks/useDialogState";
import { useDialogConfig } from "@/shared/hooks/useDialogConfig";
import { createUserUpdateSchema } from "../schemas/user.schema";
import { userEditFieldsDefinition } from "../config/dialogConfig";
import { useUpdateUser, useDeleteUser } from "../api/useUsers";
import type { User, UserUpdateData } from "@/features/users/types";

export const UsersTable = () => {
  const { t } = useTranslation("users");
  const { t: tCommon } = useTranslation("common");
  const usersQuery = useUsers();
  const columns = useMemo(() => createUsersColumns(t), [t]);
  const editDialog = useDialogState<User>();

  // Auto-generated field config from definition
  const fieldConfig = useDialogConfig<UserUpdateData>(
    "users",
    t,
    userEditFieldsDefinition
  );

  // Use the update user mutation hook
  const updateUserMutation = useUpdateUser({
    onSuccess: () => {
      toast.success(t("dialogs.edit.success"));
      editDialog.close();
    },
    onError: () => {
      toast.error("Failed to update user");
    },
  });

  // Use the delete user mutation hook
  const deleteUserMutation = useDeleteUser({
    onSuccess: () => {
      toast.success(t("messages.deleteSuccess"));
    },
    onError: () => {
      toast.error(t("messages.deleteError"));
    },
  });

  const actions: DataTableAction<User>[] = useMemo(
    () => [
      {
        icon: Eye,
        label: tCommon("actions.view"),
        onClick: (user) => console.log("View user:", user),
      },
      {
        icon: Pencil,
        label: tCommon("actions.edit"),
        onClick: editDialog.open,
      },
      {
        icon: Trash2,
        label: tCommon("actions.delete"),
        onClick: (user) => deleteUserMutation.mutate(user.id),
        variant: "destructive",
      },
    ],
    [tCommon, editDialog.open, deleteUserMutation]
  );

  return (
    <>
      <DataTable
        columns={columns}
        queryResult={usersQuery}
        enableColumnFilters
        showExport
        actions={actions}
      />

      {/* Edit Dialog - Auto-generated fields */}
      {editDialog.data && (
        <GenericActionDialog
          isCreate={false}
          schema={createUserUpdateSchema(t)}
          initialValues={editDialog.data}
          open={editDialog.isOpen}
          onOpenChange={editDialog.setOpen}
          onSubmit={async (values) => {
            await updateUserMutation.mutateAsync(values);
          }}
          titleKey="users:dialogs.edit.title"
          description={t("dialogs.edit.description")}
          fieldConfig={fieldConfig}
        />
      )}
    </>
  );
};
