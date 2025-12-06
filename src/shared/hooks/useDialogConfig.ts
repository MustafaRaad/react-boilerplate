/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

import { useMemo } from "react";
import type { SchemaFieldConfig } from "@/shared/components/dialogs/SchemaFormFields";

/**
 * Generic hook to create field configurations for dialogs
 * Automatically generates field config based on translation namespace and field definitions
 *
 * @example
 * const fieldConfig = useDialogConfig("users", t, {
 *   name: { type: "text", order: 1 },
 *   email: { type: "email", order: 2 },
 *   role: { type: "select", order: 3, options: ["admin", "user"] }
 * });
 */
export function useDialogConfig<TValues>(
  namespace: string,
  t: (key: string) => string,
  fields: Record<
    keyof TValues,
    {
      type?:
        | "text"
        | "email"
        | "password"
        | "number"
        | "textarea"
        | "select"
        | "checkbox"
        | "date";
      order?: number;
      hidden?: boolean;
      options?: Array<string | { value: string | number; label: string }>;
      customPlaceholder?: string;
    }
  >
): SchemaFieldConfig<TValues> {
  return useMemo(() => {
    const config: SchemaFieldConfig<TValues> = {};

    for (const [fieldName, fieldDef] of Object.entries(fields) as Array<
      [keyof TValues, (typeof fields)[keyof TValues]]
    >) {
      config[fieldName] = {
        label: t(`form.${String(fieldName)}.label`),
        placeholder:
          fieldDef.customPlaceholder ??
          t(`form.${String(fieldName)}.placeholder`),
        type: fieldDef.type,
        order: fieldDef.order,
        hidden: fieldDef.hidden,
        options: fieldDef.options?.map((opt) =>
          typeof opt === "string"
            ? {
                value: opt,
                label: t(
                  `${namespace === "common" ? "" : namespace + ":"}roles.${opt}`
                ),
              }
            : opt
        ),
      };
    }

    return config;
  }, [namespace, t, fields]);
}
