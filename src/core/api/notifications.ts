import { i18n } from "@/core/i18n/i18n";
import { type UnifiedApiError } from "@/core/types/api";
import { toast } from "sonner";

export const notifySuccess = (messageKeyOrText: string) => {
  // Try to translate if it's a key, otherwise use the text as-is
  const message = i18n.exists(messageKeyOrText)
    ? i18n.t(messageKeyOrText)
    : messageKeyOrText;
  toast.success(message);
};

export const notifyError = (error: UnifiedApiError) => {
  const errorMessage = error?.message ?? "";
  let message: string;

  if (errorMessage.trim() === "") {
    // No error message provided, use default
    message = i18n.t("errors.unexpected", { ns: "common" });
  } else if (i18n.exists(errorMessage)) {
    // Error message is a translation key
    message = i18n.t(errorMessage);
  } else {
    // Error message is already a string
    message = errorMessage;
  }

  toast.error(message);
};
