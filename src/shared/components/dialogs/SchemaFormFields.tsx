/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

"use client";

import { z, ZodObject } from "zod";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Checkbox } from "@/shared/components/ui/checkbox";

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
  form: any; // TanStack Form instance - no proper type available
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

  return (
    <>
      {fields.map((key) => {
        const fieldKey = key as keyof z.infer<TSchema> & string;
        const config = fieldConfig?.[fieldKey];
        if (config?.hidden) return null;

        const zodField = shape?.[fieldKey];
        const inferredType = config?.type ?? resolveZodType(zodField);
        const label = config?.label ?? fieldKey;
        const placeholder = config?.placeholder;

        // Auto-generate options from ZodEnum
        let options = config?.options;
        const fieldTypeName = (zodField?._def as { typeName?: string })
          ?.typeName;
        if (!options && fieldTypeName === "ZodEnum") {
          const enumValues =
            (zodField._def as { values?: string[] }).values || [];
          options = enumValues.map((value) => ({ value, label: value }));
        }

        const isCheckbox = inferredType === "checkbox";

        return (
          <form.Field key={fieldKey} name={fieldKey}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(field: any) => {
              const showError =
                field.state.meta.touched && field.state.meta.errors?.length > 0;
              const rawError = showError
                ? field.state.meta.errors?.[0]
                : undefined;
              const errorMessage =
                typeof rawError === "string"
                  ? rawError
                  : rawError?._errors?.[0];

              const renderControl = () => {
                switch (inferredType) {
                  case "textarea":
                    return (
                      <Textarea
                        id={fieldKey}
                        value={field.state.value ?? ""}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        onBlur={field.handleBlur}
                        placeholder={placeholder}
                      />
                    );
                  case "number":
                    return (
                      <Input
                        id={fieldKey}
                        type="number"
                        value={
                          field.state.value === undefined
                            ? ""
                            : String(field.state.value)
                        }
                        onChange={(event) => {
                          const next = event.target.value;
                          const parsed =
                            next === ""
                              ? undefined
                              : Number(event.target.value);
                          field.handleChange(parsed);
                        }}
                        onBlur={field.handleBlur}
                        placeholder={placeholder}
                      />
                    );
                  case "email":
                    return (
                      <Input
                        id={fieldKey}
                        type="email"
                        value={field.state.value ?? ""}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        onBlur={field.handleBlur}
                        placeholder={placeholder}
                      />
                    );
                  case "password":
                    return (
                      <Input
                        id={fieldKey}
                        type="password"
                        value={field.state.value ?? ""}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        onBlur={field.handleBlur}
                        placeholder={placeholder}
                      />
                    );
                  case "select":
                    return (
                      <Select
                        value={
                          field.state.value === undefined ||
                          field.state.value === null
                            ? undefined
                            : String(field.state.value)
                        }
                        onValueChange={(nextValue) => {
                          const matched = options?.find(
                            (option) => String(option.value) === nextValue
                          );
                          const parsedValue: string | number = matched
                            ? matched.value
                            : nextValue;
                          field.handleChange(parsedValue);
                        }}
                      >
                        <SelectTrigger className="w-full">
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
                    );
                  case "checkbox":
                    return (
                      <Label className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-primary has-[[aria-checked=true]]:bg-primary/5 dark:has-[[aria-checked=true]]:border-primary dark:has-[[aria-checked=true]]:bg-primary/10 cursor-pointer">
                        <Checkbox
                          id={fieldKey}
                          checked={Boolean(field.state.value)}
                          onCheckedChange={(checked) =>
                            field.handleChange(Boolean(checked))
                          }
                          className="data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:border-primary dark:data-[state=checked]:bg-primary mt-0.5"
                        />
                        <div className="grid gap-1.5 font-normal">
                          <p className="text-sm leading-none font-medium">
                            {label}
                          </p>
                        </div>
                      </Label>
                    );
                  case "date":
                    return (
                      <Input
                        id={fieldKey}
                        type="date"
                        value={
                          field.state.value === undefined
                            ? ""
                            : String(field.state.value)
                        }
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        onBlur={field.handleBlur}
                        placeholder={placeholder}
                      />
                    );
                  case "text":
                  default:
                    return (
                      <Input
                        id={fieldKey}
                        value={field.state.value ?? ""}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        onBlur={field.handleBlur}
                        placeholder={placeholder}
                      />
                    );
                }
              };

              return (
                <div className={`${isCheckbox ? "col-span-2" : "space-y-1.5"}`}>
                  {!isCheckbox && label ? (
                    <Label htmlFor={fieldKey}>{label}</Label>
                  ) : null}
                  {renderControl()}
                  {showError && !isCheckbox ? (
                    <p className="text-xs text-destructive">{errorMessage}</p>
                  ) : null}
                </div>
              );
            }}
          </form.Field>
        );
      })}
    </>
  );
}
