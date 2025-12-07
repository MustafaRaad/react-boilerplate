/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

"use client";

import { z, ZodObject } from "zod";
import type { UseFormReturn } from "react-hook-form";
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
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";

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
  form: UseFormReturn<any>;
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
      <FormField
        key={fieldKey}
        control={form.control}
        name={fieldKey}
        render={({ field }) => (
          <FormItem className={isCheckbox ? "col-span-2" : ""}>
            {!isCheckbox && label ? <FormLabel>{label}</FormLabel> : null}
            <FormControl>
              {inferredType === "textarea" ? (
                <Textarea placeholder={placeholder} {...field} />
              ) : inferredType === "number" ? (
                <Input
                  type="number"
                  placeholder={placeholder}
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? undefined : Number(e.target.value)
                    )
                  }
                />
              ) : inferredType === "email" ? (
                <Input type="email" placeholder={placeholder} {...field} />
              ) : inferredType === "password" ? (
                <Input type="password" placeholder={placeholder} {...field} />
              ) : inferredType === "select" ? (
                <Select
                  value={String(field.value ?? "")}
                  onValueChange={field.onChange}
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
              ) : inferredType === "date" ? (
                <Input type="date" {...field} />
              ) : inferredType === "checkbox" ? (
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={Boolean(field.value)}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  />
                  <Label className="font-normal cursor-pointer">{label}</Label>
                </div>
              ) : (
                <Input placeholder={placeholder} {...field} />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  });
}
