/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

import { memo, useCallback, useMemo } from "react";
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
import { createUserUpdateSchema } from "../schemas/user.schema";
import { userEditFieldsDefinition } from "../config/dialogConfig";
import { useUpdateUser, useDeleteUser } from "../api/useUsers";
import type { User, UserUpdateData } from "@/features/users/types";

export const UsersTable = memo(function UsersTable() {
  const { t } = useTranslation("users");
  const { t: tCommon } = useTranslation("common");
  const usersQuery = useUsers();
  const columns = useMemo(() => createUsersColumns(t), [t]);
  const editDialog = useDialogState<User>();

  const updateUserMutation = useUpdateUser({
    onSuccess: () => {
      toast.success(t("dialogs.edit.success"));
      editDialog.close();
    },
    onError: () => toast.error(tCommon("toasts.error")),
  });

  const deleteUserMutation = useDeleteUser({
    onSuccess: () => toast.success(t("messages.deleteSuccess")),
    onError: () => toast.error(t("messages.deleteError")),
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
        onConfirm: async (user) => {
          await deleteUserMutation.mutateAsync(user.id);
        },
        confirmDescription: (user) =>
          t("dialogs.delete.description", {
            name: user.name ?? user.email ?? `#${user.id}`,
            defaultValue: `This will permanently delete ${
              user.name ?? user.email ?? "this user"
            }.`,
          }),
        variant: "destructive",
      },
    ],
    [tCommon, editDialog.open, deleteUserMutation, t]
  );

  // Memoize submit handler to prevent child re-renders
  const handleUpdateSubmit = useCallback(
    async (values: UserUpdateData) => {
      await updateUserMutation.mutateAsync(values);
    },
    [updateUserMutation]
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

      {editDialog.data && (
        <GenericActionDialog
          isCreate={false}
          schema={createUserUpdateSchema(t)}
          initialValues={editDialog.data}
          open={editDialog.isOpen}
          onOpenChange={editDialog.setOpen}
          onSubmit={handleUpdateSubmit}
          titleKey="users:dialogs.edit.title"
          description={t("dialogs.edit.description")}
          namespace="users"
          fieldsDefinition={userEditFieldsDefinition}
        />
      )}
    </>
  );
});
