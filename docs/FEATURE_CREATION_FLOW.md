# Feature Creation Flow

**Last Updated:** December 7, 2025  
**Purpose:** Practical, end-to-end checklist for adding a new feature while maintaining boilerplate patterns  
**Target:** AI agents, developers adding features, code generators  
**Expected Time:** 30-60 minutes for a complete CRUD feature

## Prerequisites

- Backend reachable at `VITE_API_BASE_URL` with `VITE_BACKEND_KIND` set (`aspnet` or `laravel`) in `.env`
- Dependencies installed: `pnpm install` (Node 18+)
- Know the API contract you are targeting (request/response shapes and pagination style)

## Step-by-Step Walkthrough (Using "Products" as Example)

### Step 1: Plan & Setup ✅

**Tasks:**
- [ ] Decide on CRUD operations needed (list, get, create, update, delete)
- [ ] Know backend endpoint paths and response formats
- [ ] Decide on translation namespaces (usually `<feature>` + `common`)
- [ ] Verify backend is running and reachable

**Folder Structure to Create:**
```
src/features/products/
├── api/
│   └── useProducts.ts
├── components/
│   ├── ProductsTable.tsx
│   └── ProductsTable.columns.tsx
├── pages/
│   └── ProductsPage.tsx
├── schemas/
│   └── product.schema.ts
└── types/
    └── index.ts
```

### Step 2: Define Schema & Types ✅

**File:** `src/features/products/schemas/product.schema.ts`

```typescript
import { z } from "zod";

// ✅ Base schema with all fields
export const productSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "validation.product.name.required"),
  description: z.string().optional(),
  price: z.number().positive("validation.product.price.positive"),
  categoryId: z.number(),
  createdAt: z.string(),
});

// ✅ Create schema (omit id and createdAt)
export const productCreateSchema = productSchema.omit({
  id: true,
  createdAt: true,
});

// ✅ Update schema (all fields optional)
export const productUpdateSchema = productCreateSchema.partial();

// ✅ Type exports
export type Product = z.infer<typeof productSchema>;
export type ProductCreate = z.infer<typeof productCreateSchema>;
export type ProductUpdate = z.infer<typeof productUpdateSchema>;
```

**File:** `src/features/products/types/index.ts`

```typescript
// Re-export from schemas for centralized access
export type {
  Product,
  ProductCreate,
  ProductUpdate,
} from "../schemas/product.schema";
```

### Step 3: Register Endpoints ✅

**File:** `src/core/api/endpoints.ts`

1. Import your types at the top:

```typescript
import {
  type Product,
  type ProductCreate,
  type ProductUpdate,
} from "@/features/products/types";
```

2. Add to `endpoints` object (before the closing `} as const;`):

```typescript
export const endpoints = {
  auth: authEndpoints,
  users: { /* ... */ },
  
  // ✅ ADD YOUR ENDPOINTS HERE
  products: {
    list: {
      path: "Products/List",
      method: "GET",
      requiresAuth: true,
    } as EndpointDef<
      Record<string, unknown> | undefined,
      AspNetEnvelope<AspNetPagedResult<Product>> | LaravelDataTableResponse<Product>
    >,
    get: {
      path: "Products/Get",
      method: "GET",
      requiresAuth: true,
    } as EndpointDef<{ id: number }, AspNetEnvelope<Product> | Product>,
    create: {
      path: "Products/Create",
      method: "POST",
      requiresAuth: true,
    } as EndpointDef<ProductCreate, AspNetEnvelope<Product> | Product>,
    update: {
      path: "Products/Update",
      method: "PUT",
      requiresAuth: true,
    } as EndpointDef<ProductUpdate, AspNetEnvelope<Product> | Product>,
    delete: {
      path: "Products/Delete",
      method: "DELETE",
      requiresAuth: true,
    } as EndpointDef<{ id: number }, AspNetEnvelope<null> | null>,
  },
} as const;
```

**⚠️ Critical Rules:**
- NO leading `/` in paths: `"Products/List"` ✅, not `"/Products/List"` ❌
- `VITE_API_BASE_URL` MUST end with `/`: `https://api.example.com/api/` ✅
- Type parameters match backend format (see Backend Switching Guide for details)

### Step 4: Create Data Hooks ✅

**File:** `src/features/products/api/useProducts.ts`

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/core/api/client";
import { endpoints } from "@/core/api/endpoints";
import { createDataTableHook } from "@/shared/hooks/createDataTableHook";
import {
  type Product,
  type ProductCreate,
  type ProductUpdate,
} from "@/features/products/types";

// ✅ List hook (uses factory pattern)
export const useProducts = createDataTableHook<Product>(
  "products",
  endpoints.products.list
);

// ✅ Create mutation
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProductCreate) => {
      return await apiFetch(endpoints.products.create, { body: data });
    },
    onSuccess: () => {
      // ⚠️ IMPORTANT: Invalidate with same queryKey as list hook
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

// ✅ Update mutation
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProductUpdate) => {
      return await apiFetch(endpoints.products.update, { body: data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

// ✅ Delete mutation
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return await apiFetch(endpoints.products.delete, { query: { id } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
```

### Step 5: Create Table Columns ✅

**File:** `src/features/products/components/ProductsTable.columns.tsx`

```typescript
import { type ColumnDef } from "@tanstack/react-table";
import { type TFunction } from "i18next";
import { type Product } from "@/features/products/types";

export const createProductsColumns = (t: TFunction): ColumnDef<Product>[] => [
  {
    accessorKey: "id",
    header: t("products:columns.id"),
    enableColumnFilter: false,
  },
  {
    accessorKey: "name",
    header: t("products:columns.name"),
    enableColumnFilter: true,
    meta: {
      filterVariant: "input",
    },
  },
  {
    accessorKey: "price",
    header: t("products:columns.price"),
    cell: ({ row }) => {
      const price = row.original.price;
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price);
    },
  },
  {
    accessorKey: "categoryId",
    header: t("products:columns.category"),
    enableColumnFilter: true,
    meta: {
      filterVariant: "select",
    },
  },
];
```

### Step 6: Create Table Component ✅

**File:** `src/features/products/components/ProductsTable.tsx`

```typescript
import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { DataTable, type DataTableAction } from "@/shared/components/data-table/DataTable";
import {
  useProducts,
  useDeleteProduct,
} from "@/features/products/api/useProducts";
import { createProductsColumns } from "./ProductsTable.columns";
import { type Product } from "@/features/products/types";

export const ProductsTable = memo(function ProductsTable() {
  const { t } = useTranslation("products");
  const { t: tCommon } = useTranslation("common");
  const productsQuery = useProducts();
  const columns = useMemo(() => createProductsColumns(t), [t]);

  const deleteMutation = useDeleteProduct();

  const actions: DataTableAction<Product>[] = useMemo(
    () => [
      {
        icon: Eye,
        label: tCommon("actions.view"),
        onClick: (product) => console.log("View:", product),
      },
      {
        icon: Pencil,
        label: tCommon("actions.edit"),
        onClick: (product) => {
          console.log("Edit:", product);
        },
      },
      {
        icon: Trash2,
        label: tCommon("actions.delete"),
        onClick: (product) => {
          if (confirm(t("dialogs.delete.confirmation"))) {
            deleteMutation.mutate(product.id, {
              onSuccess: () => toast.success(t("messages.deleteSuccess")),
              onError: () => toast.error(t("messages.deleteError")),
            });
          }
        },
        variant: "destructive",
      },
    ],
    [t, tCommon, deleteMutation]
  );

  return (
    <DataTable
      columns={columns}
      queryResult={productsQuery}
      enableColumnFilters
      actions={actions}
    />
  );
});
```

### Step 7: Create Page Component ✅

**File:** `src/features/products/pages/ProductsPage.tsx`

```typescript
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Package, Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { DashboardLayout } from "@/shared/components/layout/DashboardLayout";
import { ProductsTable } from "../components/ProductsTable";

export const ProductsPage = memo(function ProductsPage() {
  const { t } = useTranslation("products");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with icon */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
              <Package className="h-6 w-6 text-secondary" />
              {t("page.title")}
            </h1>
            <p className="text-muted-foreground">{t("page.subtitle")}</p>
          </div>
          <Button>
            <Plus className="h-4 w-4" />
            {t("actions.create")}
          </Button>
        </div>

        {/* Table */}
        <ProductsTable />
      </div>
    </DashboardLayout>
  );
});
```

### Step 8: Add Route ✅

**File:** `src/app/router/routeTree.ts` (or create `routes/products.tsx` if using file-based routing)

```typescript
import { ProductsPage } from "@/features/products/pages/ProductsPage";

// In dashboardRoute children:
export const productsRoute = createFileRoute("/dashboard/products")({
  component: ProductsPage,
});
```

### Step 9: Add Navigation Link ✅

**File:** `src/shared/config/navigation.ts`

```typescript
import { Package } from "lucide-react";

export const mainNavItems = [
  {
    label: "dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  // ✅ ADD YOUR FEATURE HERE
  {
    label: "products",
    href: "/dashboard/products",
    icon: Package,
  },
  // ... other items
];
```

### Step 10: Add Translations ✅

**File:** `src/locales/en/products.json`

```json
{
  "page": {
    "title": "Products",
    "subtitle": "Manage your product catalog"
  },
  "columns": {
    "id": "ID",
    "name": "Name",
    "price": "Price",
    "category": "Category"
  },
  "actions": {
    "create": "Add Product"
  },
  "dialogs": {
    "create": {
      "title": "Create Product",
      "submit": "Create"
    },
    "edit": {
      "title": "Edit Product",
      "submit": "Save"
    },
    "delete": {
      "confirmation": "Are you sure you want to delete this product?"
    }
  },
  "messages": {
    "deleteSuccess": "Product deleted successfully",
    "deleteError": "Failed to delete product",
    "createSuccess": "Product created successfully",
    "updateSuccess": "Product updated successfully"
  }
}
```

**File:** `src/locales/ar/products.json` (Arabic translations)

```json
{
  "page": {
    "title": "المنتجات",
    "subtitle": "إدارة كتالوج المنتجات الخاص بك"
  },
  "columns": {
    "id": "المعرف",
    "name": "الاسم",
    "price": "السعر",
    "category": "الفئة"
  },
  "actions": {
    "create": "إضافة منتج"
  },
  "dialogs": {
    "create": {
      "title": "إنشاء منتج",
      "submit": "إنشاء"
    },
    "edit": {
      "title": "تعديل المنتج",
      "submit": "حفظ"
    },
    "delete": {
      "confirmation": "هل أنت متأكد من رغبتك في حذف هذا المنتج؟"
    }
  },
  "messages": {
    "deleteSuccess": "تم حذف المنتج بنجاح",
    "deleteError": "فشل حذف المنتج",
    "createSuccess": "تم إنشاء المنتج بنجاح",
    "updateSuccess": "تم تحديث المنتج بنجاح"
  }
}
```

---

## Pre-Delivery Checklist

Before marking the feature as complete, verify:

### File Structure
- [ ] `src/features/products/` exists with all subdirectories
- [ ] `schemas/product.schema.ts` has Zod schemas
- [ ] `types/index.ts` exports all types
- [ ] `api/useProducts.ts` has list + mutations
- [ ] `components/ProductsTable.tsx` uses DataTable
- [ ] `components/ProductsTable.columns.tsx` defines columns
- [ ] `pages/ProductsPage.tsx` exists and renders table

### Endpoints
- [ ] Endpoints registered in `src/core/api/endpoints.ts`
- [ ] Imports added for types
- [ ] Paths don't have leading `/`
- [ ] Response types handle both backends (ASP.NET envelope + Laravel direct)

### Hooks & Data
- [ ] List hook uses `createDataTableHook` factory
- [ ] Mutations use `useQueryClient` and `invalidateQueries`
- [ ] Query keys are consistent across hooks
- [ ] Mutations have proper error handling

### Routing & Navigation
- [ ] Route created in router/route tree
- [ ] Navigation item added to `src/shared/config/navigation.ts`
- [ ] Icon imported from Lucide React
- [ ] Route is protected if needed

### Translations
- [ ] `src/locales/en/products.json` has all keys
- [ ] `src/locales/ar/products.json` has all Arabic translations
- [ ] Validation strings reuse `common.validation` namespace
- [ ] No hardcoded strings in components

### Quality Checks
- [ ] Run `pnpm lint` — no errors
- [ ] Run `pnpm build` — TypeScript compiles successfully
- [ ] Test list page loads
- [ ] Test create/edit/delete operations
- [ ] Test with both backends (Laravel & ASP.NET)
- [ ] Test RTL layout in Arabic
- [ ] Check DevTools for console errors

### Testing Procedure

```bash
# 1. Start dev server
pnpm dev

# 2. In another terminal, run lint
pnpm lint

# 3. Try building (won't deploy, but verifies types)
pnpm build

# 4. Manual testing in browser:
# - Navigate to /dashboard/products
# - Verify table loads with data
# - Create a new item
# - Edit an existing item
# - Delete an item
# - Switch to Arabic mode (verify RTL)
# - Switch back to English
# - Refresh page (data persists)
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Cannot find module" errors | Run `pnpm install` and restart dev server |
| Endpoints not found (404) | Check path doesn't start with `/`, URL ends with `/` |
| Type errors on endpoints | Verify type parameters match response format |
| List doesn't update after mutation | Check `invalidateQueries` uses correct queryKey |
| Translations showing keys like `"products:title"` | Add keys to JSON files, run `pnpm intlayer:build` |
| RTL layout broken | Use `useDirection()` hook and `dir={dir}` prop |

---

## References & Documentation

- **Full patterns & examples**: [AI_AGENT_IMPLEMENTATION_GUIDE.md](./AI_AGENT_IMPLEMENTATION_GUIDE.md)
- **Backend contracts & debugging**: [BACKEND_SWITCHING_GUIDE.md](./BACKEND_SWITCHING_GUIDE.md)
- **Quick start guide**: [README.md](../README.md)
