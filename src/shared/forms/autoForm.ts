/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 *
 * AUTOMATED FORM SYSTEM - SINGLE SOURCE OF TRUTH
 * ==============================================
 *
 * This file provides a COMPLETE form system that requires ONLY a field configuration.
 * Everything else (schema, validation, rendering, defaults) is 100% automated.
 *
 * USAGE FOR ANY FEATURE:
 * ----------------------
 *
 * 1. Define your fields in one config object
 * 2. Use AutoFormDialog component - DONE!
 *
 * Example for Products:
 * ```typescript
 * const PRODUCT_FIELDS = defineFields({
 *   name: text({ required: true, min: 2 }),
 *   price: number({ required: true, min: 0 }),
 *   category: select({
 *     required: true,
 *     options: [
 *       { value: 'electronics', label: 'products.category.electronics' },
 *       { value: 'clothing', label: 'products.category.clothing' }
 *     ]
 *   })
 * });
 *
 * <AutoFormDialog
 *   fields={PRODUCT_FIELDS}
 *   namespace="products"
 *   mode="create"
 *   onSubmit={handleSubmit}
 * />
 * ```
 *
 * That's it! No schema files, no manual validation, no field rendering code needed.
 */

import * as z from "zod";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type FieldType =
  | "text"
  | "email"
  | "tel"
  | "password"
  | "number"
  | "select"
  | "textarea"
  | "checkbox"
  | "date";

export type FormMode = "create" | "edit";

export interface FieldOption {
  value: string | number;
  label: string;
}

export interface ValidationRules {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  integer?: boolean;
  positive?: boolean;
  custom?: (value: unknown) => string | undefined;
}

export interface FieldConfig {
  type: FieldType;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  validation?: ValidationRules;
  options?: FieldOption[];
  defaultValue?: unknown;
  showInMode?: FormMode[];
  disabled?: boolean;
}

export type FieldsConfig = Record<string, FieldConfig>;

export interface FormConfig<T extends FieldsConfig = FieldsConfig> {
  fields: T;
  modes: {
    create: {
      title: string;
      description?: string;
      submitLabel?: string;
      successMessage?: string;
    };
    edit: {
      title: string;
      description?: string;
      submitLabel?: string;
      successMessage?: string;
    };
  };
}

// ============================================================================
// FIELD BUILDERS - Fluent API for easy field definition
// ============================================================================

export const field = {
  text: (config: Partial<Omit<FieldConfig, "type">> = {}): FieldConfig => ({
    type: "text",
    label: config.label || "",
    placeholder: config.placeholder,
    description: config.description,
    required: config.required ?? false,
    validation: config.validation,
    defaultValue: config.defaultValue ?? "",
    showInMode: config.showInMode,
    disabled: config.disabled,
  }),

  email: (config: Partial<Omit<FieldConfig, "type">> = {}): FieldConfig => ({
    type: "email",
    label: config.label || "",
    placeholder: config.placeholder,
    description: config.description,
    required: config.required ?? false,
    validation: config.validation,
    defaultValue: config.defaultValue ?? "",
    showInMode: config.showInMode,
    disabled: config.disabled,
  }),

  tel: (config: Partial<Omit<FieldConfig, "type">> = {}): FieldConfig => ({
    type: "tel",
    label: config.label || "",
    placeholder: config.placeholder,
    description: config.description,
    required: config.required ?? false,
    validation: config.validation,
    defaultValue: config.defaultValue ?? "",
    showInMode: config.showInMode,
    disabled: config.disabled,
  }),

  password: (config: Partial<Omit<FieldConfig, "type">> = {}): FieldConfig => ({
    type: "password",
    label: config.label || "",
    placeholder: config.placeholder,
    description: config.description,
    required: config.required ?? false,
    validation: config.validation,
    defaultValue: config.defaultValue ?? "",
    showInMode: config.showInMode ?? ["create"],
    disabled: config.disabled,
  }),

  number: (config: Partial<Omit<FieldConfig, "type">> = {}): FieldConfig => ({
    type: "number",
    label: config.label || "",
    placeholder: config.placeholder,
    description: config.description,
    required: config.required ?? false,
    validation: config.validation,
    defaultValue: config.defaultValue ?? 0,
    showInMode: config.showInMode,
    disabled: config.disabled,
  }),

  select: (
    config: Partial<Omit<FieldConfig, "type">> & { options: FieldOption[] }
  ): FieldConfig => ({
    type: "select",
    label: config.label || "",
    placeholder: config.placeholder,
    description: config.description,
    required: config.required ?? false,
    validation: config.validation,
    options: config.options,
    defaultValue: config.defaultValue ?? "",
    showInMode: config.showInMode,
    disabled: config.disabled,
  }),

  textarea: (config: Partial<Omit<FieldConfig, "type">> = {}): FieldConfig => ({
    type: "textarea",
    label: config.label || "",
    placeholder: config.placeholder,
    description: config.description,
    required: config.required ?? false,
    validation: config.validation,
    defaultValue: config.defaultValue ?? "",
    showInMode: config.showInMode,
    disabled: config.disabled,
  }),

  checkbox: (config: Partial<Omit<FieldConfig, "type">> = {}): FieldConfig => ({
    type: "checkbox",
    label: config.label || "",
    description: config.description,
    required: config.required ?? false,
    defaultValue: config.defaultValue ?? false,
    showInMode: config.showInMode,
    disabled: config.disabled,
  }),

  date: (config: Partial<Omit<FieldConfig, "type">> = {}): FieldConfig => ({
    type: "date",
    label: config.label || "",
    placeholder: config.placeholder,
    description: config.description,
    required: config.required ?? false,
    validation: config.validation,
    defaultValue: config.defaultValue ?? "",
    showInMode: config.showInMode,
    disabled: config.disabled,
  }),
};

// ============================================================================
// AUTOMATED SCHEMA GENERATION
// ============================================================================

/**
 * Automatically generates Zod schema from field configuration
 * No manual schema writing needed!
 */
export function generateSchema<T extends FieldsConfig>(
  fields: T,
  mode: FormMode,
  t: (key: string, defaultValue?: string) => string
): z.ZodObject<Record<keyof T, z.ZodTypeAny>> {
  const schemaShape: Record<string, z.ZodTypeAny> = {};

  Object.entries(fields).forEach(([fieldName, fieldConfig]) => {
    // Skip fields not visible in current mode
    if (fieldConfig.showInMode && !fieldConfig.showInMode.includes(mode)) {
      return;
    }

    let fieldSchema: z.ZodTypeAny;

    // Build schema based on field type
    switch (fieldConfig.type) {
      case "email":
        fieldSchema = z
          .string()
          .email(t("validation.invalidEmail", "Invalid email"));
        break;

      case "tel":
        fieldSchema = z.string();
        if (fieldConfig.validation?.minLength) {
          fieldSchema = (fieldSchema as z.ZodString).min(
            fieldConfig.validation.minLength,
            t(
              "validation.minLength",
              `Minimum ${fieldConfig.validation.minLength} characters`
            )
          );
        }
        if (fieldConfig.validation?.maxLength) {
          fieldSchema = (fieldSchema as z.ZodString).max(
            fieldConfig.validation.maxLength,
            t(
              "validation.maxLength",
              `Maximum ${fieldConfig.validation.maxLength} characters`
            )
          );
        }
        break;

      case "number":
        fieldSchema = z.number();
        if (fieldConfig.validation?.min !== undefined) {
          fieldSchema = (fieldSchema as z.ZodNumber).min(
            fieldConfig.validation.min,
            t(
              "validation.min",
              `Minimum value is ${fieldConfig.validation.min}`
            )
          );
        }
        if (fieldConfig.validation?.max !== undefined) {
          fieldSchema = (fieldSchema as z.ZodNumber).max(
            fieldConfig.validation.max,
            t(
              "validation.max",
              `Maximum value is ${fieldConfig.validation.max}`
            )
          );
        }
        if (fieldConfig.validation?.integer) {
          fieldSchema = (fieldSchema as z.ZodNumber).int(
            t("validation.integer", "Must be an integer")
          );
        }
        if (fieldConfig.validation?.positive) {
          fieldSchema = (fieldSchema as z.ZodNumber).positive(
            t("validation.positive", "Must be positive")
          );
        }
        break;

      case "checkbox":
        fieldSchema = z.boolean();
        break;

      case "date":
        fieldSchema = z.string();
        break;

      case "select":
        fieldSchema = z.string();
        if (fieldConfig.required) {
          fieldSchema = (fieldSchema as z.ZodString).min(
            1,
            t("validation.required", "This field is required")
          );
        }
        break;

      case "password":
        fieldSchema = z.string();
        if (fieldConfig.validation?.minLength) {
          fieldSchema = (fieldSchema as z.ZodString).min(
            fieldConfig.validation.minLength,
            t(
              "validation.minLength",
              `Minimum ${fieldConfig.validation.minLength} characters`
            )
          );
        }
        break;

      case "text":
      case "textarea":
      default:
        fieldSchema = z.string();
        if (fieldConfig.validation?.minLength) {
          fieldSchema = (fieldSchema as z.ZodString).min(
            fieldConfig.validation.minLength,
            t(
              "validation.minLength",
              `Minimum ${fieldConfig.validation.minLength} characters`
            )
          );
        }
        if (fieldConfig.validation?.maxLength) {
          fieldSchema = (fieldSchema as z.ZodString).max(
            fieldConfig.validation.maxLength,
            t(
              "validation.maxLength",
              `Maximum ${fieldConfig.validation.maxLength} characters`
            )
          );
        }
        break;
    }

    // Apply required/optional
    if (!fieldConfig.required) {
      fieldSchema = fieldSchema.optional();
    } else if (
      fieldConfig.type !== "number" &&
      fieldConfig.type !== "checkbox"
    ) {
      fieldSchema = z
        .string({ message: t("validation.required", "This field is required") })
        .pipe(fieldSchema as z.ZodString);
    }

    schemaShape[fieldName] = fieldSchema;
  });

  return z.object(schemaShape) as z.ZodObject<Record<keyof T, z.ZodTypeAny>>;
}

/**
 * Automatically generates default values from field configuration
 */
export function generateDefaultValues<T extends FieldsConfig>(
  fields: T,
  mode: FormMode,
  initialValues?: Record<string, unknown>
): Record<keyof T, unknown> {
  const defaults: Record<string, unknown> = {};

  Object.entries(fields).forEach(([fieldName, fieldConfig]) => {
    // Skip fields not visible in current mode
    if (fieldConfig.showInMode && !fieldConfig.showInMode.includes(mode)) {
      return;
    }

    // Use initial value if provided, otherwise use default
    if (initialValues?.[fieldName] !== undefined) {
      defaults[fieldName] = initialValues[fieldName];
    } else {
      defaults[fieldName] =
        fieldConfig.defaultValue ?? getDefaultValueForType(fieldConfig.type);
    }
  });

  return defaults as Record<keyof T, unknown>;
}

function getDefaultValueForType(type: FieldType): unknown {
  switch (type) {
    case "number":
      return 0;
    case "checkbox":
      return false;
    default:
      return "";
  }
}

/**
 * Gets visible fields for a specific mode
 */
export function getVisibleFields<T extends FieldsConfig>(
  fields: T,
  mode: FormMode
): Array<[string, FieldConfig]> {
  return Object.entries(fields).filter(([, config]) => {
    if (!config.showInMode) return true;
    return config.showInMode.includes(mode);
  });
}

/**
 * Helper to define form configuration with type inference
 */
export function defineFormConfig<T extends FieldsConfig>(
  config: FormConfig<T>
): FormConfig<T> {
  return config;
}

/**
 * Helper to define fields with type inference
 */
export function defineFields<T extends FieldsConfig>(fields: T): T {
  return fields;
}
