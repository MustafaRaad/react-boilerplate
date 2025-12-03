import { i18n } from "@/core/i18n/i18n";
import { type UnifiedApiError } from "@/core/types/api";
import { toast } from "sonner";

export const notifySuccess = (messageKeyOrText: string) => {
  const message = i18n.t(messageKeyOrText);
  toast.success(message);
};

export const notifyError = (error: UnifiedApiError) => {
  const errorMessage = error?.message ?? "";
  const message =
    errorMessage.trim() === ""
      ? i18n.t("errors.unexpected", { ns: "common" })
      : errorMessage;
  toast.error(message);
};
