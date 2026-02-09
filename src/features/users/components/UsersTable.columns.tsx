/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 *
 * Users Table Columns - Based on API Response Structure
 * =====================================================
 *
 * Columns are defined to match the API response structure
 */

import type { ColumnDef } from "@tanstack/react-table";
import type { User } from "@/features/users/types";
import { endpoints } from "@/core/api/endpoints";
import { Badge } from "@/shared/components/ui/badge";
import { RiCheckLine, RiCloseLine } from "@remixicon/react";

type TFn = (key: string) => string;

/**
 * Create columns definition for users table
 * Based on the API response structure
 */
export const useUsersColumns = (t: TFn): ColumnDef<User, unknown>[] => {
  return [
    {
      accessorKey: "id",
      header: t("list.columns.id"),
      enableColumnFilter: true,
    },
    {
      accessorKey: "username",
      header: t("list.columns.username"),
      enableColumnFilter: true,
    },
    {
      accessorKey: "phoneNumber",
      header: t("list.columns.phoneNumber"),
      enableColumnFilter: true,
    },
    {
      accessorKey: "firstName",
      header: t("list.columns.firstName"),
      enableColumnFilter: true,
    },
    {
      accessorKey: "secondName",
      header: t("list.columns.secondName"),
      enableColumnFilter: true,
    },
    {
      accessorKey: "lastName",
      header: t("list.columns.lastName"),
      enableColumnFilter: true,
    },
    {
      accessorKey: "surname",
      header: t("list.columns.surname"),
      enableColumnFilter: true,
    },
    {
      accessorKey: "fullName",
      header: t("list.columns.fullName"),
      enableColumnFilter: true,
    },
    {
      accessorKey: "photo",
      header: t("list.columns.photo"),
      enableColumnFilter: false,
      cell: ({ row }) => {
        const photo = row.getValue("photo") as string;
        if (!photo) return "-";
        return (
          <img
            src={photo}
            alt="User photo"
            className="h-10 w-10 rounded-full object-cover"
          />
        );
      },
    },
    {
      accessorKey: "status",
      header: t("list.columns.status"),
      enableColumnFilter: true,
      cell: ({ row }) => {
        const status = row.getValue("status") as number;
        return status ?? "-";
      },
      meta: {
        filterVariant: "select",
        filterOptions: [
          { id: "0", name: t("options.status.0") },
          { id: "1", name: t("options.status.1") },
        ],
      },
    },
    {
      accessorKey: "role",
      header: t("list.columns.role"),
      enableColumnFilter: true,
      cell: ({ row }) => {
        const role = row.getValue("role") as { id: string; name: string } | undefined;
        return role?.name ?? "-";
      },
      meta: {
        filterVariant: "combobox",
        filterEndpoint: endpoints.roles.list,
        filterTransformItem: <TData = unknown>(item: TData) => {
          const role = item as { id: string; name: string };
          return {
            value: role.id,
            label: role.name,
          };
        },
      },
    },
    {
      accessorKey: "isDeleted",
      header: t("list.columns.isDeleted"),
      enableColumnFilter: true,
      cell: ({ row }) => {
        const isDeleted = row.getValue("isDeleted") as boolean;
        const label = isDeleted
          ? t("options.isDeleted.yes")
          : t("options.isDeleted.no");

        return (
          <Badge
            variant={isDeleted ? "destructive" : "secondary"}
            className="gap-1.5"
          >
            {isDeleted ? (
              <RiCloseLine className="size-3" />
            ) : (
              <RiCheckLine className="size-3" />
            )}
            {label}
          </Badge>
        );
      },
      meta: {
        filterVariant: "select",
        filterOptions: [
          { id: "true", name: t("options.isDeleted.yes") },
          { id: "false", name: t("options.isDeleted.no") },
        ],
      },
    },
  ];
};
