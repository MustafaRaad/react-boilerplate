/\*\*

- @copyright Copyright (c) 2025 Mustafa Raad Mutashar
- @license MIT
- @contact mustf.raad@gmail.com
  \*/

# Form System Architecture

**Last Updated:** December 7, 2025

## Overview

This project uses **TanStack Form** with **shadcn Field components** for all form implementations. This provides:

- Type-safe form state management
- Zod schema validation with translated error messages
- Consistent UI/UX across all forms
- Headless form state (no framework lock-in)

## Technology Stack

- **[@tanstack/react-form](https://tanstack.com/form)** - Form state management
- **[Zod](https://zod.dev/)** - Schema validation
- **[shadcn/ui Field components](https://ui.shadcn.com/docs/components/field)** - UI components (Field, FieldLabel, FieldError, FieldGroup)
- **[i18next](https://www.i18next.com/)** - Internationalization for validation messages

## Architecture

### 1. Form State Management (TanStack Form)

TanStack Form provides headless form state with:

- Form-level and field-level validation
- Render props pattern for field rendering
- TypeScript support
- No UI dependencies

**Example:**

```typescript
import { useForm } from "@tanstack/react-form";

const form = useForm({
  defaultValues: { email: "", password: "" },
  validators: {
    onSubmit: async ({ value }) => {
      // Form-level validation
      try {
        schema.parse(value);
        return undefined;
      } catch (error) {
        return convertZodErrorToFieldErrors(error);
      }
    },
  },
  onSubmit: async ({ value }) => {
    await mutation.mutateAsync(value);
  },
});
```

### 2. Validation (Zod Schemas)

Zod schemas define:

- Field types and constraints
- Validation rules
- Translated error messages

**Pattern:**

```typescript
// Define schema with translation function parameter
export const loginSchema = (t: (key: string) => string) => z.object({
  email: z
    .string()
    .min(1, t("validation.email.required"))
    .email(t("validation.email.invalid")),
  password: z
    .string()
    .min(6, t("validation.password.min")),
});

// Translation keys in locales/en/common.json:
{
  "validation": {
    "email": {
      "required": "Email is required",
      "invalid": "Invalid email address"
    },
    "password": {
      "min": "Password must be at least 6 characters"
    }
  }
}
```

### 3. UI Components (Shadcn Field Components)

Field components provide consistent styling and accessibility:

**Available Components:**

- `Field` - Wrapper with error state styling
- `FieldLabel` - Label with proper htmlFor association
- `FieldError` - Error message display
- `FieldGroup` - Group multiple fields with spacing
- `FieldDescription` - Helper text for fields

**Example:**

```typescript
<form.Field
  name="email"
  validators={{
    onChange: ({ value }) => {
      const result = schema.shape.email.safeParse(value);
      return result.success ? undefined : t(result.error.issues[0]?.message);
    },
  }}
>
  {(field) => (
    <Field data-invalid={field.state.meta.errors?.length > 0}>
      <FieldLabel htmlFor={field.name}>{t("auth.email")}</FieldLabel>
      <Input
        id={field.name}
        type="email"
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      {field.state.meta.errors?.length ? (
        <FieldError>{field.state.meta.errors[0]}</FieldError>
      ) : null}
    </Field>
  )}
</form.Field>
```

## Form Components

### GenericFormDialog

Reusable dialog component for CRUD operations with automatic field generation.

**Features:**

- Automatic field rendering from Zod schema
- Field type inference (text, number, email, select, checkbox, etc.)
- Form-level and field-level validation
- Loading states and error handling
- Translated validation messages

**Usage:**

```typescript
import { GenericFormDialog } from "@/shared/components/dialogs/GenericFormDialog";

<GenericFormDialog
  mode="create" // or "edit"
  schema={userFormSchema(t)}
  initialValues={initialValues}
  title={t("users.dialogs.create.title")}
  description={t("users.dialogs.create.description")}
  onSubmit={async (values) => {
    await createUser.mutateAsync(values);
  }}
  open={isOpen}
  onOpenChange={setIsOpen}
  fieldConfig={{
    name: {
      type: "text",
      label: t("users.form.name.label"),
      placeholder: t("users.form.name.placeholder"),
      order: 1,
    },
    email: {
      type: "email",
      label: t("users.form.email.label"),
      placeholder: t("users.form.email.placeholder"),
      order: 2,
    },
  }}
/>;
```

### SchemaFormFields

Component that dynamically generates form fields from a Zod schema.

**Features:**

- Automatic type inference from Zod schema
- Supports: text, number, email, password, textarea, date, select, checkbox
- Auto-generates select options from ZodEnum
- Customizable field configuration

**Automatic Type Resolution:**

```typescript
// Schema determines field type:
z.string() → text input
z.string().email() → email input
z.number() → number input
z.boolean() → checkbox
z.date() → date input
z.enum([...]) → select dropdown
```

## Validation Flow

### 1. Form-Level Validation (onSubmit)

Validates entire form when submitted:

```typescript
validators: {
  onSubmit: async ({ value }) => {
    try {
      schema.parse(value);
      return undefined; // No errors
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert ZodError to field errors
        const fieldErrors: Record<string, string[]> = {};
        error.issues.forEach((issue) => {
          const path = issue.path.join(".");
          if (!fieldErrors[path]) fieldErrors[path] = [];
          fieldErrors[path].push(t(issue.message)); // Translate message
        });
        return fieldErrors;
      }
    }
  },
}
```

### 2. Field-Level Validation (onChange)

Validates individual field on change:

```typescript
validators: {
  onChange: ({ value }) => {
    const result = schema.shape.email.safeParse(value);
    return result.success
      ? undefined
      : t(result.error.issues[0]?.message); // Translate message
  },
}
```

## Translation Pattern

### 1. Define Translation Keys in Schema

```typescript
export const userFormSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(2, t("validation.nameMinLength")),
    email: z.string().email(t("validation.invalidEmail")),
  });
```

### 2. Add Translations to Locale Files

**English (locales/en/users.json):**

```json
{
  "validation": {
    "nameMinLength": "Name must be at least 2 characters",
    "invalidEmail": "Invalid email address"
  }
}
```

**Arabic (locales/ar/users.json):**

```json
{
  "validation": {
    "nameMinLength": "يجب أن يكون الاسم حرفين على الأقل",
    "invalidEmail": "عنوان البريد الإلكتروني غير صالح"
  }
}
```

### 3. Translate in Validators

```typescript
const { t } = useTranslation();
const schema = userFormSchema(t); // Pass t function

// Field validator translates messages
validators: {
  onChange: ({ value }) => {
    const result = schema.shape.name.safeParse(value);
    return result.success
      ? undefined
      : t(result.error.issues[0]?.message);
  },
}
```

## Best Practices

### 1. Schema Design

✅ **DO:**

- Create schema factory functions that accept `t` function
- Use shared field validation functions (DRY principle)
- Export TypeScript types from schemas using `z.infer<>`
- Use descriptive validation message keys

❌ **DON'T:**

- Hardcode error messages in schemas
- Duplicate field validation logic
- Mix validation logic with UI components

### 2. Field Configuration

✅ **DO:**

- Define `fieldConfig` for consistent field ordering
- Use `hidden: true` for fields like `id` in edit forms
- Provide meaningful labels and placeholders
- Group related fields with `FieldGroup`

❌ **DON'T:**

- Rely on default field ordering
- Expose internal IDs in UI
- Use generic labels like "Field 1"

### 3. Error Handling

✅ **DO:**

- Always translate error messages using `t()` function
- Handle both form-level and field-level validation
- Display errors immediately after field blur
- Provide clear, actionable error messages

❌ **DON'T:**

- Show raw Zod error messages
- Wait until submit to show all errors
- Use technical jargon in error messages

### 4. Performance

✅ **DO:**

- Use field-level validation for immediate feedback
- Debounce expensive async validations
- Memoize schema creation with `useMemo`
- Use `useCallback` for form handlers

❌ **DON'T:**

- Re-create schemas on every render
- Run expensive validations on every keystroke
- Validate entire form on every field change

## Examples

### Simple Login Form

```typescript
import { useForm } from "@tanstack/react-form";
import { useTranslation } from "react-i18next";
import { Field, FieldLabel, FieldError } from "@/shared/components/ui/field";

export function LoginForm() {
  const { t } = useTranslation();
  const loginMutation = useLogin();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = loginSchema(t).safeParse(value);
        if (!result.success) {
          return translateZodErrors(result.error, t);
        }
      },
    },
    onSubmit: async ({ value }) => {
      await loginMutation.mutateAsync(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field name="email">
        {(field) => (
          <Field>
            <FieldLabel>{t("auth.email")}</FieldLabel>
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors?.length ? (
              <FieldError>{field.state.meta.errors[0]}</FieldError>
            ) : null}
          </Field>
        )}
      </form.Field>

      <form.Field name="password">
        {(field) => (
          <Field>
            <FieldLabel>{t("auth.password")}</FieldLabel>
            <Input
              type="password"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors?.length ? (
              <FieldError>{field.state.meta.errors[0]}</FieldError>
            ) : null}
          </Field>
        )}
      </form.Field>

      <Button type="submit">{t("auth.submit")}</Button>
    </form>
  );
}
```

### CRUD Form with GenericFormDialog

```typescript
import { GenericFormDialog } from "@/shared/components/dialogs/GenericFormDialog";
import { userFormSchema } from "./schemas/user.schema";

function UsersPage() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const createUser = useCreateUser();

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        {t("users.actions.create")}
      </Button>

      <GenericFormDialog
        mode="create"
        schema={userFormSchema(t)}
        title={t("users.dialogs.create.title")}
        onSubmit={async (values) => {
          await createUser.mutateAsync(values);
          toast.success(t("users.dialogs.create.success"));
        }}
        open={isOpen}
        onOpenChange={setIsOpen}
        fieldConfig={{
          name: {
            type: "text",
            label: t("users.form.name.label"),
            placeholder: t("users.form.name.placeholder"),
            order: 1,
          },
          email: {
            type: "email",
            label: t("users.form.email.label"),
            placeholder: t("users.form.email.placeholder"),
            order: 2,
          },
        }}
      />
    </>
  );
}
```

## Migration Notes

This project was migrated from react-hook-form to TanStack Form on December 7, 2025.

**Changes Made:**

- ✅ Removed `react-hook-form` and `@hookform/resolvers` dependencies
- ✅ Removed `src/shared/components/ui/form.tsx` (FormItem, FormLabel, etc.)
- ✅ Added TanStack Form with shadcn Field components
- ✅ Updated all forms (LoginForm, GenericFormDialog, SchemaFormFields)
- ✅ Added validation translations for login form
- ✅ Updated documentation

**Benefits of Migration:**

- Smaller bundle size (TanStack Form is lighter than react-hook-form)
- Better TypeScript support with full type inference
- Headless architecture (no UI coupling)
- Consistent with other TanStack libraries (Query, Router, Table)
- Official shadcn pattern with Field components

## Resources

- [TanStack Form Documentation](https://tanstack.com/form/latest)
- [Shadcn Field Components](https://ui.shadcn.com/docs/components/field)
- [Shadcn TanStack Form Integration](https://ui.shadcn.com/docs/forms/tanstack-form)
- [Zod Documentation](https://zod.dev/)
- [Feature Implementation Checklist](./FEATURE_IMPLEMENTATION_CHECKLIST.md)
- [AI Agent Implementation Guide](./AI_AGENT_IMPLEMENTATION_GUIDE.md)
