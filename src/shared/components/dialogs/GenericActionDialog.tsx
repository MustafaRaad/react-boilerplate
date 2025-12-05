"use client";

import { z } from "zod";
import { useTranslation } from "react-i18next";
import {
  GenericFormDialog,
  type GenericFormDialogProps,
} from "./GenericFormDialog";
import { useDialogConfig } from "@/shared/hooks/useDialogConfig";

export interface GenericActionDialogProps<TSchema extends z.ZodTypeAny>
  extends Omit<
    GenericFormDialogProps<TSchema>,
    "mode" | "submitLabel" | "title"
  > {
  isCreate?: boolean;
  titleKey?: string;
  submitLabelKey?: string;
  namespace?: string;
  fieldsDefinition?: Record<keyof z.infer<TSchema>, unknown>;
}

export function GenericActionDialog<TSchema extends z.ZodTypeAny>({
  isCreate = true,
  titleKey,
  submitLabelKey,
  namespace,
  fieldsDefinition,
  fieldConfig: providedFieldConfig,
  ...rest
}: GenericActionDialogProps<TSchema>) {
  const { t } = useTranslation();
  const { t: tNamespace } = useTranslation(namespace ?? "common");

  // Always call the hook but only use its result if namespace and fieldsDefinition are provided
  const generatedFieldConfig = useDialogConfig<z.infer<TSchema>>(
    namespace ?? "",
    tNamespace,
    // @ts-expect-error - Type mismatch is expected when fieldsDefinition is empty object
    fieldsDefinition ?? {}
  );
  
  // Use generated config only if namespace and fieldsDefinition were provided
  const fieldConfig = namespace && fieldsDefinition ? generatedFieldConfig : providedFieldConfig;

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
      fieldConfig={fieldConfig}
      {...rest}
    />
  );
}
