# Feature Creation Flow

**Last Updated:** January 2025  
**Purpose:** Practical, end-to-end checklist for adding a new feature while maintaining boilerplate patterns  
**Target:** AI agents, developers adding features, code generators  
**Expected Time:** 30-60 minutes for a complete CRUD feature

## 🎯 What's New

This guide has been updated with:
- ✅ **MCP Pattern** (Model-Component-Protocol) for better architecture
- ✅ **Optimistic Updates** for instant UI feedback
- ✅ **Error Boundaries** for graceful error handling
- ✅ **Data Transformers** for clean data conversion
- ✅ **Single Source of Truth** for data tables
- ✅ **Type-Safe Utilities** for better developer experience
- ✅ **PageHeader Component** for consistent page headers across features

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
│   └── useProducts.ts          # MCP Model & Protocol
├── components/
│   ├── ProductsTable.tsx        # Main table component
│   └── ProductsTable.columns.tsx # Column definitions
├── config/
│   └── products.config.ts      # Field configurations (optional)
├── pages/
│   └── ProductsPage.tsx        # Route-level component
├── schemas/
│   └── product.schema.ts       # Zod schemas
├── types/
│   └── index.ts                # TypeScript types
└── utils/                      # ✨ NEW: Feature utilities
    └── productTransformers.ts  # Data transformation logic
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

### Step 4: Create Data Transformers (Optional but Recommended) ✅

**File:** `src/features/products/utils/productTransformers.ts`

```typescript
/**
 * Product Data Transformers
 * Centralized transformation logic between UI and API formats
 */

import type { ProductFormData, ProductUpdateData } from "../types";

/**
 * Transform form data to API format
 */
export function transformProductToApi(
  data: ProductFormData | ProductUpdateData
): Record<string, unknown> {
  return {
    ...data,
    // Add any transformations here (e.g., date formatting, enum conversion)
  };
}

/**
 * Transform API data to form format
 */
export function transformProductFromApi(
  data: Record<string, unknown>
): Record<string, unknown> {
  return {
    ...data,
    // Add any transformations here (e.g., date parsing, enum conversion)
  };
}

/**
 * Get product display name for UI
 */
export function getProductDisplayName(product: {
  name?: string;
  id: number | string;
}): string {
  return product.name ?? `#${product.id}`;
}
```

### Step 5: Create Data Hooks (MCP Pattern) ✅

**File:** `src/features/products/api/useProducts.ts`

```typescript
import { useMemo } from "react";
import { createDataTableHook } from "@/shared/hooks/createDataTableHook";
import { endpoints } from "@/core/api/endpoints";
import { createCRUDProtocol } from "@/shared/mcp/createProtocol";
import { transformProductToApi } from "../utils/productTransformers";
import type {
  Product,
  ProductFormData,
  ProductUpdateData,
} from "@/features/products/types";

/**
 * Product Model Hook (MCP Pattern)
 * Handles data fetching with automatic caching and refetching
 */
export const useProducts = () => {
  const query = createDataTableHook<Product>("products", endpoints.products.list)();

  // Memoized sorted data - performance optimization
  const sortedData = useMemo(() => {
    if (!query.data?.items) return query.data;

    // Sort by created_at descending (newest first)
    const sortedItems = [...query.data.items].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });

    return {
      ...query.data,
      items: sortedItems,
    };
  }, [query.data]);

  return {
    ...query,
    data: sortedData,
  };
};

/**
 * Optimistic update helper for product operations
 * Updates the cache immediately for better UX
 */
function optimisticProductUpdater(
  old: unknown,
  variables: ProductFormData | ProductUpdateData | number
): unknown {
  if (!old || typeof old !== "object" || !("items" in old)) {
    return old;
  }

  const pagedResult = old as { items: Product[]; rowCount?: number };

  // Delete operation - remove item from list
  if (typeof variables === "number") {
    return {
      ...pagedResult,
      items: pagedResult.items.filter((item) => item.id !== variables),
      rowCount: (pagedResult.rowCount ?? pagedResult.items.length) - 1,
    };
  }

  // Update operation - update item in list (must have id)
  if (typeof variables === "object" && "id" in variables) {
    const updateData = variables as ProductUpdateData;
    return {
      ...pagedResult,
      items: pagedResult.items.map((item) =>
        item.id === updateData.id ? { ...item, ...updateData } : item
      ),
    };
  }

  return old;
}

/**
 * Product Protocol Factory (MCP Pattern)
 * Creates CRUD protocol with automatic cache invalidation and optimistic updates
 */
const productProtocolFactory = createCRUDProtocol<
  ProductFormData,
  ProductUpdateData,
  number
>({
  queryKey: ["products"],
  endpoints: {
    create: endpoints.products.create,
    update: endpoints.products.update,
    delete: endpoints.products.delete,
  },
  transforms: {
    create: transformProductToApi,
    update: transformProductToApi,
    delete: (id) => ({ id }),
  },
  invalidateQueries: [["products"]],
  // ✨ Optimistic updates for instant UI feedback
  optimisticUpdate: {
    queryKey: ["products"],
    updater: optimisticProductUpdater,
  },
});

/**
 * Product Protocol Hook (MCP Pattern)
 * Provides CRUD operations with automatic cache invalidation
 */
export const useProductProtocol = () => {
  return productProtocolFactory();
};

// Legacy exports for backward compatibility
export const useCreateProduct = (options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) => {
  const protocol = useProductProtocol();
  return protocol.create(options);
};

export const useUpdateProduct = (options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) => {
  const protocol = useProductProtocol();
  return protocol.update(options);
};

export const useDeleteProduct = (options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) => {
  const protocol = useProductProtocol();
  return protocol.delete(options);
};
```

### Step 6: Create Table Columns ✅

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

### Step 7: Create Table Component ✅

**File:** `src/features/products/components/ProductsTable.tsx`

```typescript
import { memo, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { RiEyeLine as Eye, RiPencilLine as Pencil, RiDeleteBinLine as Trash2 } from "@remixicon/react";
import { DataTable, type DataTableAction } from "@/shared/components/data-table";
import { ErrorBoundary } from "@/shared/mcp/ErrorBoundary";
import { useProducts, useUpdateProduct, useDeleteProduct } from "@/features/products/api/useProducts";
import { useProductsColumns } from "./ProductsTable.columns.tsx";
import { AutoFormDialog } from "@/shared/forms/AutoFormDialog";
import { PRODUCT_FIELDS } from "@/features/products/config/products.config";
import { useDialogState } from "@/shared/hooks/useDialogState";
import { transformProductToApi, getProductDisplayName } from "../utils/productTransformers";
import type { Product, ProductUpdateData } from "@/features/products/types";

/**
 * Products Table Component
 * Single source of truth for product data tables - uses MCP patterns
 */
export const ProductsTable = memo(function ProductsTable() {
  const { t } = useTranslation("products");
  const { t: tCommon } = useTranslation("common");
  const productsModel = useProducts(); // MCP Model
  const columns = useProductsColumns(t);
  const editDialog = useDialogState<Product>();

  // MCP Protocol hooks
  const updateProductMutation = useUpdateProduct({
    onSuccess: () => {
      toast.success(t("dialogs.edit.success"));
      editDialog.close();
    },
    onError: () => toast.error(tCommon("toasts.error")),
  });

  const deleteProductMutation = useDeleteProduct({
    onSuccess: () => toast.success(t("messages.deleteSuccess")),
    onError: () => toast.error(t("messages.deleteError")),
  });

  // Actions following MCP pattern
  const actions = useMemo<DataTableAction<Product>[]>(
    () => [
      {
        icon: Eye,
        label: tCommon("actions.view"),
        onClick: (product) => console.log("View product:", product),
      },
      {
        icon: Pencil,
        label: tCommon("actions.edit"),
        onClick: (product) => editDialog.open(product),
      },
      {
        icon: Trash2,
        label: tCommon("actions.delete"),
        onConfirm: async (product) => {
          await deleteProductMutation.mutateAsync(product.id);
        },
        confirmDescription: (product) =>
          t("dialogs.delete.description", {
            name: getProductDisplayName(product),
            defaultValue: `This will permanently delete ${getProductDisplayName(product)}.`,
          }),
        variant: "destructive",
      },
    ],
    [tCommon, editDialog, deleteProductMutation, t]
  );

  /**
   * Handle form submission with proper data transformation
   */
  const handleUpdateSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      const transformedValues = transformProductToApi(values as ProductUpdateData);
      await updateProductMutation.mutateAsync(transformedValues as ProductUpdateData);
    },
    [updateProductMutation]
  );

  return (
    <ErrorBoundary>
      <DataTable
        queryResult={productsModel}
        columns={columns}
        enableColumnFilters
        showExport
        actions={actions}
        initialState={{ sorting: [{ id: "created_at", desc: true }] }}
      />

      {editDialog.data && (
        <AutoFormDialog
          fields={PRODUCT_FIELDS}
          namespace="products"
          mode="edit"
          initialValues={editDialog.data}
          open={editDialog.isOpen}
          onOpenChange={editDialog.setOpen}
          onSubmit={handleUpdateSubmit}
          onSuccess={() => {
            toast.success(t("dialogs.edit.success"));
            editDialog.close();
          }}
          onError={(error: unknown) => {
            const errorMessage = error instanceof Error
              ? error.message
              : tCommon("toasts.error");
            toast.error(errorMessage);
          }}
        />
      )}
    </ErrorBoundary>
  );
});
```

### Step 8: Create Page Component ✅

**File:** `src/features/products/pages/ProductsPage.tsx`

```typescript
import { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { RiBoxLine, RiAddLine } from "@remixicon/react";
import { toast } from "sonner";
import { PageHeader, type PageHeaderAction } from "@/shared/components/PageHeader";
import { ProductsTable } from "../components/ProductsTable";
import { AutoFormDialog } from "@/shared/forms/AutoFormDialog";
import { PRODUCT_FIELDS } from "@/features/products/config/products.config";
import { useDialogState } from "@/shared/hooks/useDialogState";
import { useCreateProduct } from "../api/useProducts";
import type { ProductFormData } from "../types";
import { getErrorMessage } from "@/shared/utils/errorHandling";

export const ProductsPage = memo(function ProductsPage() {
  const { t } = useTranslation("products");
  const { t: tCommon } = useTranslation("common");
  const createDialog = useDialogState();

  const createProductMutation = useCreateProduct({
    onSuccess: () => {
      toast.success(t("dialogs.create.success"));
      createDialog.close();
    },
    onError: () => toast.error(tCommon("toasts.error")),
  });

  const handleCreateSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      await createProductMutation.mutateAsync(values as ProductFormData);
    },
    [createProductMutation]
  );

  const headerActions: PageHeaderAction[] = [
    {
      label: tCommon("actions.add"),
      icon: RiAddLine,
      onClick: () => createDialog.open(),
      variant: "default",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("list.title")}
        description={t("list.description")}
        icon={RiBoxLine}
        variant="list"
        actions={headerActions}
      />

      <ProductsTable />

      <AutoFormDialog
        fields={PRODUCT_FIELDS}
        namespace="products"
        mode="create"
        open={createDialog.isOpen}
        onOpenChange={createDialog.setOpen}
        onSubmit={handleCreateSubmit}
        onSuccess={() => {
          toast.success(t("dialogs.create.success"));
          createDialog.close();
        }}
        onError={(error: unknown) => {
          toast.error(getErrorMessage(error, tCommon("toasts.error")));
        }}
      />
    </div>
  );
});
```

**Key Points:**
- ✅ Use `PageHeader` component for consistent page headers
- ✅ Import icons from `@remixicon/react` (not `lucide-react`)
- ✅ Use `variant="list"` for list pages, `variant="detail"` for detail pages
- ✅ Pass actions as array of `PageHeaderAction` objects
- ✅ Page component should be a direct child of DashboardLayout (no wrapper div needed)

### Step 9: Add Route ✅

**File:** `src/app/router/routeTree.ts` (or create `routes/products.tsx` if using file-based routing)

```typescript
import { ProductsPage } from "@/features/products/pages/ProductsPage";

// In dashboardRoute children:
export const productsRoute = createFileRoute("/dashboard/products")({
  component: ProductsPage,
});
```

### Step 10: Add Navigation Link ✅

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

### Step 11: Add Translations ✅

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
- [ ] `pages/ProductsPage.tsx` exists and uses `PageHeader` component

### Endpoints
- [ ] Endpoints registered in `src/core/api/endpoints.ts`
- [ ] Imports added for types
- [ ] Paths don't have leading `/`
- [ ] Response types handle both backends (ASP.NET envelope + Laravel direct)

### Hooks & Data (MCP Pattern)
- [ ] Model hook uses `createDataTableHook` factory
- [ ] Protocol uses `createCRUDProtocol` for CRUD operations
- [ ] Optimistic updates implemented for better UX
- [ ] Data transformers created in `utils/` folder
- [ ] Query keys are consistent across hooks
- [ ] Mutations have proper error handling
- [ ] Error boundaries wrap table components

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
- [ ] Test optimistic updates (instant UI feedback)
- [ ] Test error boundaries (graceful error handling)
- [ ] Test data transformations (UI ↔ API format)
- [ ] Test with both backends (Laravel & ASP.NET)
- [ ] Test RTL layout in Arabic
- [ ] Check DevTools for console errors
- [ ] Verify cache invalidation works correctly

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

## 🎯 MCP Pattern Benefits

Using the MCP (Model-Component-Protocol) pattern provides:

1. **Better Performance**
   - Automatic caching with TanStack Query
   - Optimistic updates for instant feedback
   - Memoized data transformations

2. **Better UX**
   - Instant UI updates (optimistic)
   - Automatic error rollback
   - Loading states handled automatically

3. **Better Maintainability**
   - Separation of concerns (Model/Protocol/Component)
   - Reusable utilities (transformers, error handling)
   - Type-safe operations throughout

4. **Better Error Handling**
   - Error boundaries for graceful failures
   - Centralized error utilities
   - Consistent error messages

## 📚 References & Documentation

- **Full patterns & examples**: [AI_AGENT_IMPLEMENTATION_GUIDE.md](./AI_AGENT_IMPLEMENTATION_GUIDE.md)
- **Backend contracts & debugging**: [BACKEND_SWITCHING_GUIDE.md](./BACKEND_SWITCHING_GUIDE.md)
- **MCP Pattern Guide**: [MCP_MIGRATION_GUIDE.md](./MCP_MIGRATION_GUIDE.md)
- **MCP Utilities**: `src/shared/mcp/README.md`
- **Data Table Guide**: `src/shared/components/data-table/README.md`
- **Quick start guide**: [README.md](../README.md)
