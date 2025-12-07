/\*\*

- @copyright Copyright (c) 2025 Mustafa Raad Mutashar
- @license MIT
- @contact mustf.raad@gmail.com
  \*/

# Feature Implementation Guide for AI Agents

**Last Updated:** December 7, 2025  
**Purpose:** Step-by-step instructions for implementing new features from user requirements

---

## 🎯 Quick Start: Feature Implementation Workflow

### Phase 1: Requirements Analysis

1. **Identify the feature type:**

   - List/Table feature (with CRUD)
   - Detail/Form feature
   - API integration feature
   - Authentication/Permission feature

2. **Understand the data:**

   - What fields does it have?
   - What are the types? (string, number, boolean, date)
   - What validations are needed?
   - Does it need translations?

3. **Plan the structure:**
   ```
   src/features/{featureName}/
   ├── types/
   ├── schemas/
   ├── api/
   ├── components/
   ├── hooks/
   ├── pages/
   └── config/
   ```

---

## 📋 Complete Feature Implementation Steps

### Step 1: Create Type Definitions

**File:** `src/features/{featureName}/types/{featureName}.types.ts`

```typescript
/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

export interface Feature {
  id: number;
  name: string;
  email: string;
  // ... other fields
}

export interface FeatureFormData {
  name: string;
  email: string;
  // ... fields without id
}
```

**Rules:**

- Always include copyright header
- Name interfaces clearly: `{Feature}`, `{Feature}FormData`, `{Feature}Response`
- Don't include `id` in form data types
- Include all fields from backend API response

---

### Step 2: Create Zod Schemas

**File:** `src/features/{featureName}/schemas/{featureName}.schema.ts`

```typescript
/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

import { z } from "zod";

/**
 * Feature schema from backend API
 */
export const featureSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  created_at: z.string(),
  updated_at: z.string(),
});

/**
 * Shared feature field validation
 * Used in both create and update schemas
 */
const featureFieldValidation = (t: (key: string) => string) => ({
  name: z.string().min(2, t("validation.nameMinLength")),
  email: z.string().email(t("validation.invalidEmail")),
});

/**
 * Feature form schema for create
 */
export const featureFormSchema = (t: (key: string) => string) =>
  z.object({
    ...featureFieldValidation(t),
    password: z.string().min(6, t("validation.passwordMinLength")),
  });

/**
 * Feature update schema (all fields optional except id)
 */
export const featureUpdateFormSchema = (t: (key: string) => string) =>
  z.object({
    id: z.number(),
    ...(Object.fromEntries(
      Object.entries(featureFieldValidation(t)).map(([key, schema]) => [
        key,
        (schema as z.ZodTypeAny).optional(),
      ])
    ) as ReturnType<typeof featureFieldValidation>),
  });

export type Feature = z.infer<typeof featureSchema>;
export type FeatureFormData = z.infer<ReturnType<typeof featureFormSchema>>;
export type FeatureUpdateData = z.infer<
  ReturnType<typeof featureUpdateFormSchema>
>;
```

**Rules:**

- Create shared `fieldValidation` function to avoid duplication (DRY principle)
- Use translation keys for error messages: `validation.{fieldName}`
- For update schemas: dynamically apply `.optional()` using `Object.fromEntries()` and `.map()` to all fields
- Cast fields with `as z.ZodTypeAny` before applying `.optional()`
- Cast the result with `as ReturnType<typeof fieldValidation>` for proper type inference
- Export derived types using `z.infer<>`
- **Live Reference:** See `src/features/users/schemas/user.schema.ts` for the exact implementation pattern

---

### Step 3: Create API Endpoints

**File:** `src/features/{featureName}/api/{featureName}.endpoints.ts`

```typescript
/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

import { type EndpointDef } from "@/core/api/endpoints";
import {
  type Feature,
  type FeatureFormData,
} from "../types/{featureName}.types";

export const featureEndpoints = {
  list: {
    path: "/features",
    method: "GET",
    requiresAuth: true,
  } as EndpointDef<undefined, Feature[]>,

  get: {
    path: "/features/:id",
    method: "GET",
    requiresAuth: true,
  } as EndpointDef<{ id: number }, Feature>,

  create: {
    path: "/features",
    method: "POST",
    requiresAuth: true,
  } as EndpointDef<FeatureFormData, Feature>,

  update: {
    path: "/features/:id",
    method: "PUT",
    requiresAuth: true,
  } as EndpointDef<Partial<FeatureFormData>, Feature>,

  delete: {
    path: "/features/:id",
    method: "DELETE",
    requiresAuth: true,
  } as EndpointDef<{ id: number }, null>,
};
```

**Rules:**

- Use RESTful paths: `/features`, `/features/:id`
- Always set `requiresAuth: true` for protected endpoints
- Define both request and response types
- Use appropriate HTTP methods: GET, POST, PUT, DELETE
- Store in feature-specific endpoints file

---

### Step 4: Create API Hooks

**File:** `src/features/{featureName}/api/use{Feature}.ts`

```typescript
/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

import { useApiMutation, useApiQuery } from "@/core/api/hooks";
import { featureEndpoints } from "./{featureName}.endpoints";
import type { Feature, FeatureFormData } from "../types/{featureName}.types";

export const useFeatures = () => {
  return useApiQuery<Feature[]>(
    featureEndpoints.list,
    ["features"],
    { staleTime: 5 * 60 * 1000 } // 5 minutes
  );
};

export const useFeature = (id: number) => {
  return useApiQuery<Feature>(
    featureEndpoints.get,
    ["features", id],
    { staleTime: 10 * 60 * 1000 },
    { id }
  );
};

export const useCreateFeature = (options?: {
  onSuccess?: (data: Feature) => void;
  onError?: (error: unknown) => void;
}) => {
  return useApiMutation<Feature, FeatureFormData>(
    featureEndpoints.create,
    ["features"],
    options
  );
};

export const useUpdateFeature = (options?: {
  onSuccess?: (data: Feature) => void;
  onError?: (error: unknown) => void;
}) => {
  return useApiMutation<Feature, Partial<FeatureFormData>>(
    featureEndpoints.update,
    ["features"],
    options
  );
};

export const useDeleteFeature = (options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) => {
  return useApiMutation<null, { id: number }>(
    featureEndpoints.delete,
    ["features"],
    options
  );
};
```

**Rules:**

- Query hook names: `use{Plural}`, `use{Singular}`
- Mutation hook names: `use{Action}{Feature}`
- Set appropriate `staleTime` values (usually 5-10 minutes)
- Pass query keys as arrays: `["features"]`, `["features", id]`
- Accept `onSuccess` and `onError` callbacks

---

### Step 5: Create Data Table Columns (If List Feature)

**File:** `src/features/{featureName}/components/{Feature}Table.columns.tsx`

```typescript
/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

import { createColumnHelper } from "@tanstack/react-table";
import type { Feature } from "../types/{featureName}.types";

const columnHelper = createColumnHelper<Feature>();

export const createFeatureColumns = (t: (key: string) => string) => [
  columnHelper.accessor("id", {
    header: t("table.columns.id"),
    cell: (info) => `#${info.getValue()}`,
  }),

  columnHelper.accessor("name", {
    header: t("table.columns.name"),
  }),

  columnHelper.accessor("email", {
    header: t("table.columns.email"),
  }),

  columnHelper.accessor("created_at", {
    header: t("table.columns.createdAt"),
    cell: (info) => new Date(info.getValue()).toLocaleDateString(),
  }),
];
```

**Rules:**

- Use TanStack Table's `createColumnHelper`
- All text should be translated using the `t` function
- Format dates using `new Date().toLocaleDateString()`
- Return array of columns that will be used in DataTable component

---

### Step 6: Create Dialog/Form Configuration

**Important:** Forms use TanStack Form with shadcn Field components (Field, FieldLabel, FieldError) for consistent UI/UX.

**File:** `src/features/{featureName}/config/dialogConfig.ts`

```typescript
/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

import type { SchemaFieldConfig } from "@/shared/components/dialogs/SchemaFormFields";

export const featureFieldsDefinition: SchemaFieldConfig<FeatureFormData> = {tureFormData> = {
  name: {
    type: "text",
    label: "Name",
    placeholder: "Enter name",
    order: 1,
  },
  email: {
    type: "email",
    label: "Email",
    placeholder: "user@example.com",
    order: 2,
  },
};

export const featureEditFieldsDefinition: SchemaFieldConfig<FeatureUpdateData> = {
  id: {
    type: "number",
    hidden: true,
  },
  ...featureFieldsDefinition,
};
```

**Rules:**

- Define field types: `text`, `email`, `number`, `checkbox`, `select`, `textarea`, `password`, `date`
- Use `label` and `placeholder` properties for field display text
- Set `hidden: true` to hide fields (useful for id in edit forms)
- Use `order` property to control field rendering order
- For select fields, provide `options: [{ value, label }]`
- Create separate definitions for create vs. edit if needed
- Forms use TanStack Form's `useForm` hook with Zod schema validation
- Field components (Field, FieldLabel, FieldError) from shadcn provide consistent styling

---

### Step 7: Create Table Component (If List Feature)

**File:** `src/features/{featureName}/components/{Feature}Table.tsx`

```typescript
/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

import { memo, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Eye, Pencil, Trash2 } from "lucide-react";
import {
  DataTable,
  type DataTableAction,
} from "@/shared/components/data-table/DataTable.tsx";
import { useFeatures } from "../api/use{Feature}";
import { createFeatureColumns } from "./Feature}Table.columns.tsx";
import { GenericActionDialog } from "@/shared/components/dialogs/GenericActionDialog";
import { useDialogState } from "@/shared/hooks/useDialogState";
import { featureUpdateFormSchema } from "../schemas/{featureName}.schema";
import { featureEditFieldsDefinition } from "../config/dialogConfig";
import { useUpdateFeature, useDeleteFeature } from "../api/use{Feature}";
import type { Feature, FeatureUpdateData } from "../types/{featureName}.types";

export const FeatureTable = memo(function FeatureTable() {
  const { t } = useTranslation("{featureName}");
  const { t: tCommon } = useTranslation("common");
  const featuresQuery = useFeatures();
  const columns = useMemo(() => createFeatureColumns(t), [t]);
  const editDialog = useDialogState<Feature>();

  const updateMutation = useUpdateFeature({
    onSuccess: () => {
      toast.success(t("dialogs.edit.success"));
      editDialog.close();
    },
    onError: () => toast.error(tCommon("toasts.error")),
  });

  const deleteMutation = useDeleteFeature({
    onSuccess: () => toast.success(t("messages.deleteSuccess")),
    onError: () => toast.error(t("messages.deleteError")),
  });

  const actions: DataTableAction<Feature>[] = useMemo(
    () => [
      {
        icon: Eye,
        label: tCommon("actions.view"),
        onClick: (feature) => console.log("View:", feature),
      },
      {
        icon: Pencil,
        label: tCommon("actions.edit"),
        onClick: editDialog.open,
      },
      {
        icon: Trash2,
        label: tCommon("actions.delete"),
        onConfirm: async (feature) => {
          await deleteMutation.mutateAsync({ id: feature.id });
        },
        confirmDescription: (feature) =>
          t("dialogs.delete.description", {
            name: feature.name,
            defaultValue: `Delete ${feature.name}?`,
          }),
        variant: "destructive",
      },
    ],
    [tCommon, editDialog.open, deleteMutation, t]
  );

  const handleUpdateSubmit = useCallback(
    async (values: FeatureUpdateData) => {
      await updateMutation.mutateAsync(values);
    },
    [updateMutation]
  );

  return (
    <>
      <DataTable
        columns={columns}
        queryResult={featuresQuery}
        enableColumnFilters
        showExport
        actions={actions}
      />

      {editDialog.data && (
        <GenericActionDialog
          isCreate={false}
          schema={featureUpdateFormSchema(t)}
          initialValues={editDialog.data}
          open={editDialog.isOpen}
          onOpenChange={editDialog.setOpen}
          onSubmit={handleUpdateSubmit}
          titleKey="{featureName}:dialogs.edit.title"
          namespace="{featureName}"
          fieldsDefinition={featureEditFieldsDefinition}
        />
      )}
    </>
  );
});
```

**Rules:**

- Use `memo` to prevent unnecessary re-renders
- Implement table actions: view, edit, delete
- Use `useDialogState` for form dialogs
- Show success/error toasts using `sonner`
- Keep mutations in `useMemo` to prevent re-renders

---

### Step 8: Create List Page Component

**File:** `src/features/{featureName}/pages/{Feature}ListPage.tsx`

```typescript
/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

import { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Plus } from "lucide-react";
import { FeatureTable } from "../components/FeatureTable";
import { GenericActionDialog } from "@/shared/components/dialogs/GenericActionDialog";
import { useDialogState } from "@/shared/hooks/useDialogState";
import { featureFormSchema } from "../schemas/{featureName}.schema";
import { featureFieldsDefinition } from "../config/dialogConfig";
import { useCreateFeature } from "../api/use{Feature}";
import type { FeatureFormData } from "../types/{featureName}.types";

export const FeatureListPage = memo(function FeatureListPage() {
  const { t } = useTranslation("{featureName}");
  const { t: tCommon } = useTranslation("common");
  const createDialog = useDialogState();

  const createMutation = useCreateFeature({
    onSuccess: () => {
      toast.success(t("dialogs.create.success"));
      createDialog.close();
    },
    onError: () => toast.error(tCommon("toasts.error")),
  });

  const handleCreateSubmit = useCallback(
    async (values: FeatureFormData) => {
      await createMutation.mutateAsync(values);
    },
    [createMutation]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {t("list.title")}
          </h1>
          <p className="text-muted-foreground">{t("list.description")}</p>
        </div>
        <Button
          size="default"
          className="gap-2"
          onClick={() => createDialog.open()}
        >
          <Plus className="h-4 w-4" />
          {tCommon("actions.add")}
        </Button>
      </div>

      <FeatureTable />

      <GenericActionDialog
        schema={featureFormSchema(t)}
        open={createDialog.isOpen}
        onOpenChange={createDialog.setOpen}
        onSubmit={handleCreateSubmit}
        titleKey="{featureName}:dialogs.create.title"
        description={t("dialogs.create.description")}
        namespace="{featureName}"
        fieldsDefinition={featureFieldsDefinition}
      />
    </div>
  );
});
```

**Rules:**

- Always wrap in `memo` with named function
- Show title + description header
- Include "Add" button to open create dialog
- Pass schema, fields config, and namespace to GenericActionDialog
- Handle form submission with async mutation

---

### Step 9: Add Route to Router

**File:** `src/app/router/routeTree.ts`

```typescript
// Add to your route tree:
{
  path: "/features",
  component: lazy(() =>
    import("@/features/{featureName}/pages/{Feature}ListPage").then((m) => ({
      default: m.FeatureListPage,
    }))
  ),
}
```

**Rules:**

- Use `lazy` for code splitting
- Match feature name in path
- Import from pages directory

---

### Step 10: Add i18n Translations

**File:** `src/locales/en/{featureName}.json`

```json
{
  "list": {
    "title": "Features",
    "description": "Manage all features in the system"
  },
  "fields": {
    "name": "Feature Name",
    "email": "Email Address"
  },
  "table": {
    "columns": {
      "id": "ID",
      "name": "Name",
      "email": "Email",
      "createdAt": "Created At"
    }
  },
  "dialogs": {
    "create": {
      "title": "Create Feature",
      "description": "Add a new feature to the system",
      "success": "Feature created successfully"
    },
    "edit": {
      "title": "Edit Feature",
      "description": "Update feature details",
      "success": "Feature updated successfully"
    },
    "delete": {
      "description": "Delete {{name}}?"
    }
  },
  "messages": {
    "deleteSuccess": "Feature deleted successfully",
    "deleteError": "Failed to delete feature"
  }
}
```

**File:** `src/locales/ar/{featureName}.json`

```json
{
  "list": {
    "title": "الميزات",
    "description": "إدارة جميع الميزات في النظام"
  },
  "fields": {
    "name": "اسم الميزة",
    "email": "عنوان البريد الإلكتروني"
  },
  "table": {
    "columns": {
      "id": "الرقم",
      "name": "الاسم",
      "email": "البريد الإلكتروني",
      "createdAt": "تاريخ الإنشاء"
    }
  },
  "dialogs": {
    "create": {
      "title": "إنشاء ميزة",
      "description": "أضف ميزة جديدة إلى النظام",
      "success": "تم إنشاء الميزة بنجاح"
    },
    "edit": {
      "title": "تعديل الميزة",
      "description": "تحديث تفاصيل الميزة",
      "success": "تم تحديث الميزة بنجاح"
    },
    "delete": {
      "description": "حذف {{name}}؟"
    }
  },
  "messages": {
    "deleteSuccess": "تم حذف الميزة بنجاح",
    "deleteError": "فشل حذف الميزة"
  }
}
```

**Rules:**

- Create separate files for each namespace
- Include both English and Arabic translations
- Use consistent key structure across locales
- Include all UI strings: titles, buttons, messages, errors

---

## ✅ Checklist: Feature Implementation Complete

- [ ] Types defined in `types/{featureName}.types.ts`
- [ ] Schemas created in `schemas/{featureName}.schema.ts`
- [ ] API endpoints defined in `api/{featureName}.endpoints.ts`
- [ ] API hooks created in `api/use{Feature}.ts`
- [ ] Table columns created (if list feature)
- [ ] Dialog config created in `config/dialogConfig.ts`
- [ ] Table component created (if list feature)
- [ ] List page created
- [ ] Route added to router
- [ ] English translations in `locales/en/{featureName}.json`
- [ ] Arabic translations in `locales/ar/{featureName}.json`
- [ ] All files have copyright headers
- [ ] No duplication in validation rules
- [ ] TypeScript errors resolved
- [ ] Feature tested in browser

---

## 🚀 Quick Reference: File Locations

```
src/features/{featureName}/
├── types/
│   └── {featureName}.types.ts
├── schemas/
│   └── {featureName}.schema.ts
├── api/
│   ├── {featureName}.endpoints.ts
│   └── use{Feature}.ts
├── components/
│   └── {Feature}Table.tsx
│   └── {Feature}Table.columns.tsx
├── pages/
│   └── {Feature}ListPage.tsx
└── config/
    └── dialogConfig.ts

src/locales/
├── en/
│   └── {featureName}.json
└── ar/
    └── {featureName}.json
```

---

## 📝 Common Implementation Issues & Solutions

### Issue: TypeScript errors with `z.infer<>`

**Solution:** Ensure the schema function returns a `ZodObject`, not the schema itself.

### Issue: Validation keys not translating

**Solution:** Check that namespace in useTranslation matches the translation file name.

### Issue: Form not submitting

**Solution:** Verify that `GenericActionDialog` receives correct `schema` and `fieldsDefinition`.

### Issue: Table not showing data

**Solution:** Check that API hook returns proper format. Use browser DevTools Network tab to verify API response.

### Issue: Dialog not closing after submit

**Solution:** Ensure mutation `onSuccess` callback calls `dialog.close()`.

---

## 🎓 Best Practices Summary

1. **Always** include copyright headers
2. **Never** duplicate validation rules - use shared `fieldValidation`
3. **Always** test with both English and Arabic
4. **Always** use async/await for mutations
5. **Always** handle success/error toasts
6. **Always** memoize components and columns
7. **Never** hardcode strings - use translations
8. **Always** type everything with TypeScript
9. **Always** follow RESTful API naming conventions
10. **Always** validate on both client and server

---

**For questions or issues, refer to the main AI_AGENT_IMPLEMENTATION_GUIDE.md**
