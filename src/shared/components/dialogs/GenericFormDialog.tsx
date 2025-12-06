"use client";

import * as React from "react";
import { z, ZodObject } from "zod";
import { useForm } from "@tanstack/react-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { useTranslation } from "react-i18next";
import { useDirection } from "@/shared/hooks/useDirection";
import { SchemaFormFields } from "./SchemaFormFields";
import type { SchemaFieldConfig } from "./SchemaFormFields";
import { Loader } from "lucide-react";

export type DialogMode = "create" | "edit";

export interface GenericFormDialogProps<TSchema extends z.ZodTypeAny> {
  mode: DialogMode;
  schema: TSchema;
  initialValues?: Partial<z.infer<TSchema>>;
  title: React.ReactNode;
  description?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  fieldConfig?: SchemaFieldConfig<z.infer<TSchema>>;
  submitLabel?: React.ReactNode;
  cancelLabel?: React.ReactNode;
  onSubmit: (values: z.infer<TSchema>) => Promise<void> | void;
  trigger?: React.ReactNode;
  footerExtra?: React.ReactNode;
  onSubmitted?: () => void;
}

export function GenericFormDialog<TSchema extends z.ZodTypeAny>({
  mode,
  schema,
  initialValues,
  title,
  description,
  open,
  defaultOpen,
  onOpenChange,
  fieldConfig,
  submitLabel,
  cancelLabel,
  onSubmit,
  trigger,
  footerExtra,
  onSubmitted,
}: GenericFormDialogProps<TSchema>) {
  const { t } = useTranslation();
  const { dir } = useDirection();
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false);
  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  // Compute default values with proper schema parsing
  const defaultValues = React.useMemo(() => {
    const baseValues = initialValues ?? {};
    if (schema instanceof ZodObject) {
      try {
        return schema.partial().parse(baseValues) as z.infer<TSchema>;
      } catch {
        return baseValues as z.infer<TSchema>;
      }
    }
    return baseValues as z.infer<TSchema>;
  }, [initialValues, schema]);

  const form = useForm({
    defaultValues,
    validators: {
      onChange: ({ value }) => {
        const result = schema.safeParse(value);
        if (!result.success) return result.error.format();
        return undefined;
      },
      onSubmit: ({ value }) => {
        const result = schema.safeParse(value);
        if (!result.success) return result.error.format();
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      try {
        await onSubmit(value as z.infer<TSchema>);
        onSubmitted?.();
        handleOpenChange(false);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Reset form when dialog closes
  React.useEffect(() => {
    if (!dialogOpen) {
      form.reset();
    }
  }, [dialogOpen, form]);

  const resolvedCancelLabel = cancelLabel ?? t("actions.cancel", "Cancel");
  const resolvedSubmitLabel =
    submitLabel ??
    (mode === "create"
      ? t("actions.create", "Create")
      : t("actions.save", "Save changes"));

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}

      <DialogContent dir={dir} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
          className="space-y-4"
        >
          <SchemaFormFields
            schema={schema}
            form={form}
            fieldConfig={fieldConfig}
          />

          <DialogFooter className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              {resolvedCancelLabel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              {resolvedSubmitLabel}
            </Button>
            {footerExtra}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
