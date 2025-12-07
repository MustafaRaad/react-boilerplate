/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

"use client";

import { z, ZodObject } from "zod";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/shared/components/ui/field";

export type BaseFieldType =
  | "text"
  | "number"
  | "textarea"
  | "select"
  | "checkbox"
  | "date"
  | "email"
  | "password";

export type SchemaFieldConfig<TValues> = {
  [K in keyof TValues]?: {
    label?: string;
    placeholder?: string;
    type?: BaseFieldType;
    hidden?: boolean;
    options?: { value: string | number; label: string }[];
    order?: number;
  };
};

interface SchemaFormFieldsProps<TSchema extends z.ZodTypeAny> {
  schema: TSchema;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  fieldConfig?: SchemaFieldConfig<z.infer<TSchema>>;
}

const resolveZodType = (zodType?: z.ZodTypeAny): BaseFieldType => {
  if (!zodType) return "text";
  const typeName = (zodType._def as { typeName?: string }).typeName;

  // Unwrap wrapper types
  if (typeName === "ZodOptional" || typeName === "ZodNullable") {
    return resolveZodType(
      (zodType._def as { innerType?: z.ZodTypeAny }).innerType
    );
  }
  if (typeName === "ZodEffects") {
    return resolveZodType((zodType._def as { schema?: z.ZodTypeAny }).schema);
  }
  if (typeName === "ZodDefault") {
    return resolveZodType(
      (zodType._def as { innerType?: z.ZodTypeAny }).innerType
    );
  }

  // Handle base types
  switch (typeName) {
    case "ZodNumber":
      return "number";
    case "ZodBoolean":
      return "checkbox";
    case "ZodDate":
      return "date";
    case "ZodEnum":
      return "select";
    case "ZodString": {
      // Check for specific string validations
      const checks =
        (zodType._def as { checks?: Array<{ kind?: string }> }).checks || [];
      if (checks.some((check) => check.kind === "email")) {
        return "email";
      }
      return "text";
    }
    default:
      return "text";
  }
};

export function SchemaFormFields<TSchema extends z.ZodTypeAny>({
  schema,
  form,
  fieldConfig,
}: SchemaFormFieldsProps<TSchema>) {
  const shape = schema instanceof ZodObject ? schema.shape : undefined;
  const rawFields = shape ? Object.keys(shape) : [];

  if (!rawFields.length) return null;

  // Sort fields by order if specified in config
  const fields = rawFields.sort((a, b) => {
    const orderA = fieldConfig?.[a as keyof z.infer<TSchema>]?.order ?? 999;
    const orderB = fieldConfig?.[b as keyof z.infer<TSchema>]?.order ?? 999;
    return orderA - orderB;
  });

  return fields.map((key) => {
    const fieldKey = key as keyof z.infer<TSchema> & string;
    const config = fieldConfig?.[fieldKey];
    if (config?.hidden) return null;

    const zodField = shape?.[fieldKey];
    const inferredType = config?.type ?? resolveZodType(zodField);
    const label = config?.label ?? fieldKey;
    const placeholder = config?.placeholder;

    // Auto-generate options from ZodEnum
    let options = config?.options;
    const fieldTypeName = (zodField?._def as { typeName?: string })?.typeName;
    if (!options && fieldTypeName === "ZodEnum") {
      const enumValues = (zodField._def as { values?: string[] }).values || [];
      options = enumValues.map((value) => ({ value, label: value }));
    }

    const isCheckbox = inferredType === "checkbox";

    return (
      <form.Field key={fieldKey} name={fieldKey}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(field: any) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;

          return isCheckbox ? (
            <Field orientation="horizontal" data-invalid={isInvalid}>
              <Checkbox
                id={field.name}
                checked={Boolean(field.state.value)}
                onCheckedChange={(checked) => field.handleChange(checked)}
                aria-invalid={isInvalid}
              />
              <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            </Field>
          ) : (
            <Field data-invalid={isInvalid}>
              {label && <FieldLabel htmlFor={field.name}>{label}</FieldLabel>}
              {inferredType === "textarea" ? (
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value ?? ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={placeholder}
                  aria-invalid={isInvalid}
                />
              ) : inferredType === "number" ? (
                <Input
                  id={field.name}
                  name={field.name}
                  type="number"
                  value={field.state.value ?? ""}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(
                      e.target.value === "" ? undefined : Number(e.target.value)
                    )
                  }
                  placeholder={placeholder}
                  aria-invalid={isInvalid}
                />
              ) : inferredType === "email" ? (
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  value={field.state.value ?? ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={placeholder}
                  aria-invalid={isInvalid}
                />
              ) : inferredType === "password" ? (
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  value={field.state.value ?? ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={placeholder}
                  aria-invalid={isInvalid}
                />
              ) : inferredType === "select" ? (
                <Select
                  value={String(field.state.value ?? "")}
                  onValueChange={(value) => field.handleChange(value)}
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={isInvalid}
                    className="w-full"
                  >
                    <SelectValue placeholder={placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {options?.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={String(option.value)}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : inferredType === "date" ? (
                <Input
                  id={field.name}
                  name={field.name}
                  type="date"
                  value={field.state.value ?? ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                />
              ) : (
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value ?? ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={placeholder}
                  aria-invalid={isInvalid}
                />
              )}
              {isInvalid && field.state.meta.errors.length > 0 && (
                <FieldError errors={field.state.meta.errors} />
              )}
            </Field>
          );
        }}
      </form.Field>
    );
  });
}
