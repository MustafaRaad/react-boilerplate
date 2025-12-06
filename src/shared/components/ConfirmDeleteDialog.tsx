"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { useTranslation } from "react-i18next";

export interface ConfirmDeleteDialogProps {
  /** React node that opens the dialog (wrapped with asChild to preserve styles) */
  trigger: React.ReactNode;
  /** Called when user confirms delete */
  onConfirm: () => Promise<void> | void;
  /** Optional overrides for dialog copy */
  title?: React.ReactNode;
  description?: React.ReactNode;
  confirmLabel?: React.ReactNode;
  cancelLabel?: React.ReactNode;
  /** Optional callback after confirm succeeds */
  onConfirmed?: () => void;
  /** Disable trigger and actions */
  disabled?: boolean;
}

export function ConfirmDeleteDialog({
  trigger,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirmed,
  disabled,
}: ConfirmDeleteDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleConfirm = React.useCallback(async () => {
    if (isSubmitting || disabled) return;
    setIsSubmitting(true);
    try {
      await onConfirm();
      onConfirmed?.();
      setOpen(false);
    } catch (error) {
      console.error("ConfirmDeleteDialog onConfirm failed", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [disabled, isSubmitting, onConfirm, onConfirmed]);

  const resolvedTitle = title ?? t("common.confirmDeleteTitle", "Are you sure?");
  const resolvedDescription =
    description ??
    t(
      "common.confirmDeleteDescription",
      "This action cannot be undone. This will permanently delete this item."
    );
  const resolvedConfirmLabel = confirmLabel ?? t("common.delete", "Delete");
  const resolvedCancelLabel = cancelLabel ?? t("common.cancel", "Cancel");

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isSubmitting || disabled) return;
        setOpen(nextOpen);
      }}
    >
      <AlertDialogTrigger asChild>
        <span
          aria-disabled={disabled || isSubmitting}
          className={disabled ? "pointer-events-none opacity-60" : undefined}
          onClick={(event) => {
            if (disabled || isSubmitting) {
              event.preventDefault();
              event.stopPropagation();
            }
          }}
        >
          {trigger}
        </span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{resolvedTitle}</AlertDialogTitle>
          <AlertDialogDescription>{resolvedDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>
            {resolvedCancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {resolvedConfirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
