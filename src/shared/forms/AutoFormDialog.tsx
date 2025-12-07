/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 *
 * AUTO FORM DIALOG - Fully Automated Form Component
 * =================================================
 *
 * This component renders a complete form dialog from just field configuration.
 * Zero boilerplate code needed!
 *
 * USAGE:
 * ------
 * ```tsx
 * <AutoFormDialog
 *   fields={USER_FIELDS}
 *   namespace="users"
 *   mode="create"
 *   onSubmit={handleSubmit}
 * />
 * ```
 *
 * That's all you need! The component automatically:
 * - Generates Zod schema from fields
 * - Renders all fields with proper validation
 * - Handles form submission and errors
 * - Shows loading states and success messages
 * - Supports i18n for all labels and messages
 */

"use client";

import * as React from "react";
import { useForm } from "@tanstack/react-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
  FieldGroup,
  Field,
  FieldLabel,
  /* FieldDescription, */ FieldError,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  type FieldsConfig,
  type FormMode,
  generateSchema,
  generateDefaultValues,
  getVisibleFields,
} from "./autoForm";

export interface AutoFormDialogProps<T extends FieldsConfig> {
  /**
   * Field configuration - the ONLY thing you need to define!
   */
  fields: T;

  /**
   * Translation namespace (e.g., "users", "products")
   */
  namespace: string;

  /**
   * Form mode: create or edit
   */
  mode?: FormMode;

  /**
   * Initial values for edit mode
   */
  initialValues?: Record<string, unknown>;

  /**
   * Trigger element to open dialog
   */
  trigger?: React.ReactNode;

  /**
   * Controlled open state
   */
  open?: boolean;

  /**
   * Default open state
   */
  defaultOpen?: boolean;

  /**
   * Open state change callback
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Form submission callback
   */
  onSubmit: (values: Record<string, unknown>) => Promise<void> | void;

  /**
   * Success callback
   */
  onSuccess?: (values: Record<string, unknown>) => void;

  /**
   * Error callback
   */
  onError?: (error: unknown) => void;

  /**
   * Custom dialog title (overrides default from namespace)
   */
  title?: string;

  /**
   * Custom dialog description
   */
  description?: string;

  /**
   * Custom submit button label
   */
  submitLabel?: string;

  /**
   * Custom cancel button label
   */
  cancelLabel?: string;
}

/**
 * Automated Form Dialog Component
 * Renders a complete form from field configuration
 */
export function AutoFormDialog<T extends FieldsConfig>({
  fields,
  namespace,
  mode = "create",
  initialValues,
  trigger,
  open,
  defaultOpen,
  onOpenChange,
  onSubmit,
  onSuccess,
  onError,
  title,
  description,
  submitLabel,
  cancelLabel,
}: AutoFormDialogProps<T>) {
  const { t } = useTranslation(namespace);
  const { t: tCommon } = useTranslation("common");
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  // Auto-generate schema from field configuration
  const schema = React.useMemo(
    () =>
      generateSchema(fields, mode, (key, defaultValue) =>
        t(key, { defaultValue })
      ),
    [fields, mode, t]
  );

  // Auto-generate default values
  const defaultValues = React.useMemo(
    () => generateDefaultValues(fields, mode, initialValues),
    [fields, mode, initialValues]
  );

  // Get visible fields for current mode
  const visibleFields = React.useMemo(
    () => getVisibleFields(fields, mode),
    [fields, mode]
  );

  // Auto-generate dialog configuration
  const dialogTitle =
    title ||
    t(`dialogs.${mode}.title`, mode === "create" ? "Create New" : "Edit");
  const dialogDescription =
    description ||
    t(
      `dialogs.${mode}.description`,
      mode === "create" ? "Add a new item" : "Update item information"
    );
  const buttonSubmitLabel =
    submitLabel ||
    t("actions." + mode, mode === "create" ? "Create" : "Update");
  const buttonCancelLabel = cancelLabel || tCommon("actions.cancel", "Cancel");
  const loadingLabel = t(
    `actions.${mode}ing`,
    mode === "create" ? "Creating..." : "Updating..."
  );

  // Initialize form
  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: ({ value }) => {
        const result = schema.safeParse(value);
        if (!result.success) {
          const formatted = result.error.format();
          return Object.fromEntries(
            Object.entries(formatted).map(([key, errors]) => [
              key,
              Array.isArray(errors) && errors[0]
                ? typeof errors[0] === "string"
                  ? t(errors[0], { defaultValue: errors[0] })
                  : errors[0]
                : undefined,
            ])
          );
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      try {
        setIsSubmitting(true);
        await onSubmit(value);
        onSuccess?.(value);
        form.reset();
        handleOpenChange(false);
        toast.success(
          t(
            `messages.${mode}Success`,
            mode === "create" ? "Created successfully" : "Updated successfully"
          )
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : t("errors.unexpected", "Something went wrong");
        toast.error(message);
        onError?.(error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Auto-generate field validator
  const buildFieldValidator = React.useCallback(
    (fieldName: string) => {
      return ({ value }: { value: unknown }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fieldSchema = (schema.shape as Record<string, any>)[fieldName];
        if (!fieldSchema) return undefined;

        const result = fieldSchema.safeParse(value);
        return !result.success ? result.error.issues[0]?.message : undefined;
      };
    },
    [schema]
  );

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}

      <DialogContent >
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
          className="space-y-4"
        >
          <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleFields.map(([fieldName, fieldConfig]) => (
              <form.Field
                key={fieldName}
                name={fieldName}
                validators={{
                  onChange: buildFieldValidator(fieldName),
                }}
              >
                {(fieldApi) => {
                  const label = t(fieldConfig.label, fieldConfig.label);
                  const placeholder = fieldConfig.placeholder
                    ? t(fieldConfig.placeholder, fieldConfig.placeholder)
                    : undefined;
                  // const fieldDescription = fieldConfig.description
                  //   ? t(fieldConfig.description, fieldConfig.description)
                  //   : undefined;

                  const isInvalid =
                    fieldApi.state.meta.isTouched &&
                    !fieldApi.state.meta.isValid;
                  const errorMessage =
                    isInvalid && fieldApi.state.meta.errors?.length
                      ? fieldApi.state.meta.errors[0]
                      : null;

                  // Render checkbox field
                  if (fieldConfig.type === "checkbox") {
                    return (
                      <Field data-invalid={isInvalid}>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={fieldApi.name}
                            checked={fieldApi.state.value as boolean}
                            onCheckedChange={(checked: boolean) =>
                              fieldApi.handleChange(checked as never)
                            }
                            disabled={isSubmitting || fieldConfig.disabled}
                          />
                          <FieldLabel htmlFor={fieldApi.name}>
                            {label}
                          </FieldLabel>
                        </div>
                        {/* {fieldDescription && <FieldDescription>{fieldDescription}</FieldDescription>} */}
                        {errorMessage && (
                          <FieldError>{errorMessage}</FieldError>
                        )}
                      </Field>
                    );
                  }

                  // Render select field
                  if (fieldConfig.type === "select") {
                    const options = (fieldConfig.options || []).map((opt) => ({
                      value: String(opt.value),
                      label: t(opt.label, opt.label),
                    }));

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={fieldApi.name}>{label}</FieldLabel>
                        <Select
                          value={fieldApi.state.value as string}
                          onValueChange={(value) =>
                            fieldApi.handleChange(value as never)
                          }
                          disabled={isSubmitting || fieldConfig.disabled}
                        >
                          <SelectTrigger id={fieldApi.name}>
                            <SelectValue placeholder={placeholder} />
                          </SelectTrigger>
                          <SelectContent>
                            {options.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {/* {fieldDescription && <FieldDescription>{fieldDescription}</FieldDescription>} */}
                        {errorMessage && (
                          <FieldError>{errorMessage}</FieldError>
                        )}
                      </Field>
                    );
                  }

                  // Render textarea field
                  if (fieldConfig.type === "textarea") {
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={fieldApi.name}>{label}</FieldLabel>
                        <Textarea
                          id={fieldApi.name}
                          name={fieldApi.name}
                          value={(fieldApi.state.value as string) || ""}
                          onBlur={fieldApi.handleBlur}
                          onChange={(
                            e: React.ChangeEvent<HTMLTextAreaElement>
                          ) => fieldApi.handleChange(e.target.value as never)}
                          placeholder={placeholder}
                          disabled={isSubmitting || fieldConfig.disabled}
                          aria-invalid={isInvalid}
                        />
                        {/* {fieldDescription && <FieldDescription>{fieldDescription}</FieldDescription>} */}
                        {errorMessage && (
                          <FieldError>{errorMessage}</FieldError>
                        )}
                      </Field>
                    );
                  }

                  // Render text-based fields (text, email, password, tel, number, date)
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={fieldApi.name}>{label}</FieldLabel>
                      <Input
                        id={fieldApi.name}
                        name={fieldApi.name}
                        type={fieldConfig.type}
                        value={(fieldApi.state.value as string | number) || ""}
                        onBlur={fieldApi.handleBlur}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const value =
                            fieldConfig.type === "number"
                              ? e.target.valueAsNumber
                              : e.target.value;
                          fieldApi.handleChange(value as never);
                        }}
                        placeholder={placeholder}
                        disabled={isSubmitting || fieldConfig.disabled}
                        aria-invalid={isInvalid}
                        autoComplete="off"
                      />
                      {/* {fieldDescription && <FieldDescription>{fieldDescription}</FieldDescription>} */}
                      {errorMessage && <FieldError>{errorMessage}</FieldError>}
                    </Field>
                  );
                }}
              </form.Field>
            ))}
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              {buttonCancelLabel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  {loadingLabel}
                </>
              ) : (
                buttonSubmitLabel
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AutoFormDialog;
