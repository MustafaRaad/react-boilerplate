import * as React from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Loader } from "lucide-react";
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

interface ConfirmDeleteDialogProps {
  trigger: React.ReactNode;
  onConfirm: () => Promise<void> | void;
  title?: string;
  description?: string;
  disabled?: boolean;
}

export function ConfirmDeleteDialog({
  trigger,
  onConfirm,
  title,
  description,
  disabled,
}: ConfirmDeleteDialogProps) {
  const { t } = useTranslation("common");
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleConfirm = React.useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      setIsLoading(true);
      try {
        await onConfirm();
        setOpen(false);
      } catch (error) {
        console.error("Delete failed:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [onConfirm]
  );

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild disabled={disabled}>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle
                className="size-6 text-destructive"
                aria-hidden="true"
              />
            </div>
            <div className="flex-1 space-y-2">
              <AlertDialogTitle className="text-start text-xl">
                {title || t("confirmDeleteTitle")}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-start text-base">
                {description || t("confirmDeleteDescription")}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 gap-3 sm:gap-2">
          <AlertDialogCancel disabled={isLoading} className="sm:flex-1">
            {t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:flex-1"
          >
            {isLoading ? (
              <>
                <Loader className="ltr:mr-2 rtl:ml-2 size-4 animate-spin" />
                {t("deleting")}
              </>
            ) : (
              t("delete")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
