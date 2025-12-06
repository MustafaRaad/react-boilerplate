import { type AnyFieldApi } from "@tanstack/form-core";
import { type ReactNode } from "react";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/lib/utils";
import { generateId } from "@/shared/utils/a11y";

type FormFieldProps = {
  field: AnyFieldApi;
  label?: string;
  className?: string;
  children: ReactNode;
};

export const FormField = ({
  field,
  label,
  className,
  children,
}: FormFieldProps) => {
  const error = field.state.meta.errors?.[0]?.message as string | undefined;
  const errorId = error ? generateId("error") : undefined;

  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <Label
          htmlFor={field.name}
          className="flex justify-between text-sm font-medium"
        >
          <span>{label}</span>
        </Label>
      ) : null}
      <div aria-describedby={errorId} aria-invalid={!!error}>
        {children}
      </div>
      {error ? (
        <p
          id={errorId}
          className="text-sm text-destructive"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
};
