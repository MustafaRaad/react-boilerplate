/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

"use client";

import * as React from "react";
import { useForm } from "@tanstack/react-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
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
import { Field, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Loader } from "lucide-react";
import { toast } from "sonner";

export interface PasswordResetDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (email: string) => Promise<void> | void;
}

export function PasswordResetDialog({
  trigger,
  open,
  defaultOpen,
  onOpenChange,
  onSubmit,
}: PasswordResetDialogProps) {
  const { t } = useTranslation();
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

  // Password reset schema
  const resetSchema = z.object({
    email: z
      .string()
      .min(1, t("validation.email.required"))
      .email(t("validation.email.invalid")),
  });

  type ResetFormValues = z.infer<typeof resetSchema>;

  const form = useForm({
    defaultValues: {
      email: "",
    } satisfies ResetFormValues,
    validators: {
      onSubmit: ({ value }) => {
        const result = resetSchema.safeParse(value);
        if (!result.success) {
          const formatted = result.error.format();
          return Object.fromEntries(
            Object.entries(formatted).map(([key, errors]) => [
              key,
              Array.isArray(errors) && errors.length > 0
                ? errors.map((msg: string) =>
                    typeof msg === "string" ? t(msg) : msg
                  )
                : errors,
            ])
          );
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      try {
        setIsSubmitting(true);
        if (onSubmit) {
          await onSubmit(value.email);
        }
        toast.success(
          t(
            "auth.resetSuccess",
            "Password reset link has been sent to your email"
          )
        );
        form.reset();
        handleOpenChange(false);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : t("errors.unexpected", "Something went wrong");
        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("auth.resetTitle", "Reset Password")}</DialogTitle>
          <DialogDescription>
            {t(
              "auth.resetDescription",
              "Enter your email address and we'll send you a link to reset your password."
            )}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => {
                const result = resetSchema.shape.email.safeParse(value);
                if (!result.success) {
                  return result.error.issues[0]?.message
                    ? t(result.error.issues[0].message)
                    : undefined;
                }
                return undefined;
              },
            }}
          >
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    {t("auth.email")}
                  </FieldLabel>
                  <Input
                    id={field.name}
                    type="email"
                    placeholder={t("auth.emailPlaceholder", "your@example.com")}
                    required
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    autoComplete="email"
                    disabled={isSubmitting}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && field.state.meta.errors?.length ? (
                    <FieldError>{field.state.meta.errors[0]}</FieldError>
                  ) : null}
                </Field>
              );
            }}
          </form.Field>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              {t("actions.cancel", "Cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  {t("auth.sending", "Sending...")}
                </>
              ) : (
                t("auth.sendReset", "Send Reset Link")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default PasswordResetDialog;
