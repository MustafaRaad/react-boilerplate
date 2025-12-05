import { useState, useCallback } from "react";

/**
 * Generic hook for managing dialog state
 * Provides open/close handlers and selected item state
 *
 * @example
 * const createDialog = useDialogState<UserFormData>();
 * const editDialog = useDialogState<User>();
 *
 * <Button onClick={createDialog.open}>Create</Button>
 * <GenericCreateDialog open={createDialog.isOpen} onOpenChange={createDialog.setOpen} />
 */
export function useDialogState<TData = void>() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<TData | null>(null);

  const open = useCallback((itemData?: TData) => {
    if (itemData !== undefined) {
      setData(itemData);
    }
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Delay clearing data to allow exit animations
    setTimeout(() => setData(null), 300);
  }, []);

  return {
    isOpen,
    setOpen: setIsOpen,
    data,
    open,
    close,
  };
}

/**
 * Hook for managing form submission with loading and error states
 *
 * @example
 * const submit = useDialogSubmit(async (values) => {
 *   await api.createUser(values);
 * }, {
 *   onSuccess: () => toast.success("Created!"),
 *   onClose: dialog.close
 * });
 */
export function useDialogSubmit<TValues>(
  submitFn: (values: TValues) => Promise<void> | void,
  options?: {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
    onClose?: () => void;
  }
) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (values: TValues) => {
      setIsSubmitting(true);
      try {
        await submitFn(values);
        options?.onSuccess?.();
        options?.onClose?.();
      } catch (error) {
        options?.onError?.(error);
        throw error; // Re-throw to let GenericFormDialog handle it
      } finally {
        setIsSubmitting(false);
      }
    },
    [submitFn, options]
  );

  return { handleSubmit, isSubmitting };
}
