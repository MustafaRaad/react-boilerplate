/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 * 
 * Users Table - Single Source of Truth Implementation
 * Uses the unified DataTable component following MCP patterns
 */

import { memo, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { RiEyeLine as Eye, RiPencilLine as Pencil, RiDeleteBinLine as Trash2 } from "@remixicon/react";
import { DataTable, type DataTableAction } from "@/shared/components/data-table";
import { ErrorBoundary } from "@/shared/mcp/ErrorBoundary";
import { useUsers, useUpdateUser, useDeleteUser } from "@/features/users/api/useUsers";
import { useUsersColumns } from "./UsersTable.columns.tsx";
import { AutoFormDialog } from "@/shared/forms/AutoFormDialog";
import { USER_FIELDS } from "@/features/users/config/users.config";
import { useDialogState } from "@/shared/hooks/useDialogState";
import {
  transformUserFromApi,
  getUserDisplayName,
} from "../utils/userTransformers";
import type { User, UserUpdateData } from "@/features/users/types";
import { getErrorMessage } from "@/shared/utils/errorHandling";

/**
 * Users Table Component
 * Single source of truth for user data tables - uses MCP patterns
 */
export const UsersTable = memo(function UsersTable() {
  const { t } = useTranslation("users");
  const { t: tCommon } = useTranslation("common");
  const usersModel = useUsers(); // MCP Model
  const columns = useUsersColumns(t);
  const editDialog = useDialogState<User>();

  // MCP Protocol hooks
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

  // Actions following MCP pattern
  const actions = useMemo<DataTableAction<User>[]>(
    () => [
      {
        icon: Eye,
        label: tCommon("actions.view"),
        onClick: (user) => console.log("View user:", user),
      },
      {
        icon: Pencil,
        label: tCommon("actions.edit"),
        onClick: (user) => editDialog.open(user),
      },
      {
        icon: Trash2,
        label: tCommon("actions.delete"),
        onConfirm: async (user) => {
          await deleteUserMutation.mutateAsync(user.id);
        },
        confirmDescription: (user) =>
          t("dialogs.delete.description", {
            name: getUserDisplayName(user),
            defaultValue: `This will permanently delete ${getUserDisplayName(user)}.`,
          }),
        variant: "destructive",
      },
    ],
    [tCommon, editDialog, deleteUserMutation, t]
  );

  /**
   * Handle form submission with proper data transformation
   */
  const handleUpdateSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      await updateUserMutation.mutateAsync(values as UserUpdateData);
    },
    [updateUserMutation]
  );

  return (
    <ErrorBoundary>
      <DataTable
        queryResult={usersModel}
        columns={columns}
        enableColumnFilters
        showExport
        actions={actions}
        initialState={{ sorting: [{ id: "created_at", desc: true }] }}
      />

      {editDialog.data && (
        <AutoFormDialog
          fields={USER_FIELDS}
          namespace="users"
          mode="edit"
          initialValues={transformUserFromApi(
            editDialog.data as unknown as Record<string, unknown>
          )}
          open={editDialog.isOpen}
          onOpenChange={editDialog.setOpen}
          onSubmit={handleUpdateSubmit}
          onSuccess={() => {
            toast.success(t("dialogs.edit.success"));
            editDialog.close();
          }}
          onError={(error: unknown) => {
            toast.error(getErrorMessage(error, tCommon("toasts.error")));
          }}
        />
      )}
    </ErrorBoundary>
  );
});
