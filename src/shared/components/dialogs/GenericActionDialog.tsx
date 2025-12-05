"use client";

import { z } from "zod";
import { useTranslation } from "react-i18next";
import {
  GenericFormDialog,
  type GenericFormDialogProps,
} from "./GenericFormDialog";

export interface GenericActionDialogProps<TSchema extends z.ZodTypeAny>
  extends Omit<
    GenericFormDialogProps<TSchema>,
    "mode" | "submitLabel" | "title"
  > {
  isCreate?: boolean;
  titleKey?: string;
  submitLabelKey?: string;
}

export function GenericActionDialog<TSchema extends z.ZodTypeAny>(
  props: GenericActionDialogProps<TSchema>
) {
  const { t } = useTranslation();
  const { isCreate = true, titleKey, submitLabelKey, ...rest } = props;

  const resolvedTitle = titleKey
    ? t(titleKey)
    : isCreate
    ? t("actions.create", "Create")
    : t("actions.edit", "Edit");

  const resolvedSubmit = submitLabelKey
    ? t(submitLabelKey)
    : isCreate
    ? t("actions.create", "Create")
    : t("actions.save", "Save changes");

  return (
    <GenericFormDialog
      mode={isCreate ? "create" : "edit"}
      title={resolvedTitle}
      submitLabel={resolvedSubmit}
      {...rest}
    />
  );
}
