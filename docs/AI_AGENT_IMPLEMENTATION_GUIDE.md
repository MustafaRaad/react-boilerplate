# AI Agent Implementation Guide

**Last Updated:** December 6, 2025  
**Target Audience:** AI Assistants, Developers, Code Generators

This document provides exact, step-by-step instructions for implementing new features in this React + TypeScript + Vite boilerplate project. Follow these patterns precisely to maintain consistency and quality.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Folder Structure](#folder-structure)
4. [Core Principles](#core-principles)
5. [How to Add a New Feature](#how-to-add-a-new-feature)
6. [How to Add a List Page](#how-to-add-a-list-page)
7. [How to Add Create/Edit Forms](#how-to-add-createedit-forms)
8. [How to Use i18n and Direction](#how-to-use-i18n-and-direction)
9. [How to Use Auth & Permissions](#how-to-use-auth--permissions)
10. [Best Practices](#best-practices)
11. [Common Patterns Reference](#common-patterns-reference)

---

## Overview

This is a **multi-backend React boilerplate** that supports both **Laravel** and **ASP.NET** backends. It uses modern React patterns with TypeScript and emphasizes:

- **Type Safety**: Zod schemas + TypeScript everywhere
- **Performance**: TanStack Query for caching, memoization, virtual scrolling
- **DRY Principle**: Reusable factories and shared components
- **Accessibility**: WCAG 2.1 AA compliant
- **i18n**: English & Arabic with RTL support
- **Backend Agnostic**: Unified API layer handles Laravel/ASP.NET differences

---

## Tech Stack

**DO NOT CHANGE OR ADD TO THIS STACK**

### Core Framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server

### Routing & Data
- **TanStack Router** - File-based routing, type-safe navigation
- **TanStack Query** - Server state management, caching
- **TanStack Form** - Form state & validation
- **TanStack Table** - Data tables with sorting, filtering, pagination

### State Management
- **Zustand** - Client-only state (auth, UI)
- **Zustand Persist Middleware** - LocalStorage persistence

### UI & Styling
- **shadcn/ui** - Component library (based on Radix UI)
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icons

### i18n
- **react-i18next** - Translation library
- **Intlayer** - Additional i18n utilities

### Backend Support
- **Laravel** (current default)
- **ASP.NET** (fully supported)

---

## Folder Structure

**RESPECT THIS STRUCTURE - DO NOT INVENT NEW PATTERNS**

```
src/
├── core/                     # Core infrastructure (DO NOT modify without approval)
│   ├── api/
│   │   ├── client.ts         # ✅ Central API client - ALL requests go through here
│   │   ├── endpoints.ts      # ✅ Endpoint definitions
│   │   ├── hooks.ts          # ✅ useApiQuery, useApiMutation wrappers
│   │   ├── normalizers.ts    # ✅ Backend normalization layer (NEW)
│   │   ├── interceptors.ts   # Request/response interceptors
│   │   ├── retry.ts          # Exponential backoff retry logic
│   │   └── queryClient.ts    # TanStack Query configuration
│   ├── config/
│   │   └── env.ts            # Environment variables & backend kind
│   ├── i18n/
│   │   ├── i18n.ts           # i18next configuration
│   │   └── direction.ts      # RTL/LTR helpers
│   ├── schemas/              # Shared Zod schemas
│   ├── security/             # CSRF, XSS, rate limiting
│   └── types/
│       ├── api.ts            # API-related types
│       └── auth.ts           # Auth-related types
│
├── features/                 # Feature modules (ADD NEW FEATURES HERE)
│   ├── auth/
│   │   ├── api/
│   │   │   └── auth.endpoints.ts
│   │   ├── components/
│   │   │   └── LoginForm.tsx
│   │   ├── hooks/
│   │   │   └── useLogin.ts
│   │   ├── schemas/
│   │   │   └── auth.schema.ts
│   │   └── types/
│   │       └── auth.types.ts
│   ├── users/
│   │   ├── api/
│   │   │   └── useUsers.ts    # Data fetching hooks
│   │   ├── components/
│   │   │   ├── UsersTable.tsx
│   │   │   └── UsersTable.columns.tsx
│   │   ├── config/
│   │   │   └── dialogConfig.ts
│   │   ├── schemas/
│   │   │   └── user.schema.ts
│   │   └── types/
│   │       └── index.ts
│   └── [feature]/            # ← Add new features following this structure
│       ├── api/
│       ├── components/
│       ├── config/
│       ├── pages/            # Route-level components (if needed)
│       ├── schemas/
│       ├── store/            # Feature-specific Zustand store (if needed)
│       └── types/
│
├── shared/                   # Shared/reusable code
│   ├── components/
│   │   ├── ui/               # shadcn components (button, input, etc.)
│   │   ├── layout/           # DashboardLayout, Header, Sidebar
│   │   ├── data-table/       # DataTable component & utilities
│   │   ├── dialogs/          # Generic form dialogs
│   │   └── form/             # Form field components
│   ├── hooks/                # Reusable hooks
│   │   ├── useDataTableQuery.ts
│   │   ├── createDataTableHook.ts
│   │   ├── useDirection.ts
│   │   └── useLocaleDirection.ts
│   └── utils/                # Utility functions
│
├── locales/                  # Translation files
│   ├── en/
│   │   ├── common.json
│   │   ├── users.json
│   │   └── [namespace].json
│   └── ar/
│       ├── common.json
│       ├── users.json
│       └── [namespace].json
│
├── routes/                   # TanStack Router routes
│   ├── __root.tsx
│   ├── index.tsx
│   ├── dashboard.tsx
│   └── [route].tsx
│
└── store/                    # Global Zustand stores
    ├── auth.store.ts         # Auth state (user, tokens, permissions)
    └── ui.store.ts           # UI state (sidebar, theme)
```

---

## Core Principles

### 1. **DO NOT CHANGE THE TECH STACK**
- No new routers (use TanStack Router)
- No new state managers (use TanStack Query + Zustand)
- No new UI libraries (use shadcn/ui + Tailwind)
- No new form libraries (use TanStack Form + Zod)

### 2. **USE CENTRALIZED API CLIENT**
✅ **CORRECT:**
```typescript
import { apiFetch } from "@/core/api/client";
import { endpoints } from "@/core/api/endpoints";

const users = await apiFetch(endpoints.users.list);
```

❌ **WRONG:**
```typescript
const response = await fetch("/api/users");  // ← NEVER DO THIS
```

**WHY:** The central client handles:
- Backend normalization (Laravel vs ASP.NET)
- Token injection
- Error handling
- CSRF protection
- Rate limiting
- Retry logic
- Response transformation

### 3. **SERVER DATA = TANSTACK QUERY, CLIENT STATE = ZUSTAND**
✅ **Use TanStack Query for:**
- API data (users, products, orders)
- Server-side pagination
- Background refetching
- Cache invalidation

✅ **Use Zustand for:**
- UI state (sidebar open/closed, theme)
- Auth tokens & user profile
- Client-only preferences

❌ **NEVER:**
- Put server data in Zustand
- Put UI state in TanStack Query

### 4. **MULTI-BACKEND IS FIRST-CLASS**

The project supports **two backends simultaneously**:

```typescript
type BackendKind = "aspnet" | "laravel";
```

**All backend differences MUST be handled in `src/core/api/normalizers.ts`**

DO NOT scatter backend logic across components or hooks.

---

## How to Add a New Feature

Follow these steps **in order** to create a new feature (e.g., "products"):

### Step 1: Create Feature Folder Structure

```bash
src/features/products/
├── api/
│   └── useProducts.ts
├── components/
│   ├── ProductsTable.tsx
│   └── ProductsTable.columns.tsx
├── config/
│   └── dialogConfig.ts
├── schemas/
│   └── product.schema.ts
└── types/
    └── index.ts
```

### Step 2: Define Zod Schema (`schemas/product.schema.ts`)

```typescript
import { z } from "zod";

export const productSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "validation.name.required"),
  description: z.string().optional(),
  price: z.number().positive("validation.price.positive"),
  categoryId: z.number(),
  createdAt: z.string(),
});

export const productCreateSchema = productSchema.omit({ id: true, createdAt: true });
export const productUpdateSchema = productCreateSchema.partial();

export type Product = z.infer<typeof productSchema>;
export type ProductCreate = z.infer<typeof productCreateSchema>;
export type ProductUpdate = z.infer<typeof productUpdateSchema>;
```

### Step 3: Add Types (`types/index.ts`)

```typescript
export type {
  Product,
  ProductCreate,
  ProductUpdate,
} from "../schemas/product.schema";
```

### Step 4: Add Endpoints (`src/core/api/endpoints.ts`)

```typescript
import { type EndpointDef } from "@/core/api/endpoints";
import { type Product } from "@/features/products/types";

export const endpoints = {
  // ... existing endpoints
  products: {
    list: {
      path: "Products/List",  // ← NO leading slash
      method: "GET",
      requiresAuth: true,
    } as EndpointDef<Record<string, unknown>, PagedResult<Product>>,
    
    get: {
      path: "Products/Get",
      method: "GET",
      requiresAuth: true,
    } as EndpointDef<{ id: number }, Product>,
    
    create: {
      path: "Products/Create",
      method: "POST",
      requiresAuth: true,
    } as EndpointDef<ProductCreate, Product>,
    
    update: {
      path: "Products/Update",
      method: "PUT",
      requiresAuth: true,
    } as EndpointDef<ProductUpdate, Product>,
    
    delete: {
      path: "Products/Delete",
      method: "DELETE",
      requiresAuth: true,
    } as EndpointDef<{ id: number }, null>,
  },
} as const;
```

### Step 5: Create API Hooks (`api/useProducts.ts`)

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/core/api/client";
import { endpoints } from "@/core/api/endpoints";
import { createDataTableHook } from "@/shared/hooks/createDataTableHook";
import { type Product, type ProductCreate, type ProductUpdate } from "@/features/products/types";

// ✅ List hook using factory
export const useProducts = createDataTableHook<Product>(
  "products",
  endpoints.products.list
);

// ✅ Create mutation
export const useCreateProduct = (options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProductCreate) => {
      return await apiFetch(endpoints.products.create, { body: data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      options?.onSuccess?.();
    },
    onError: (error) => {
      console.error("Create product failed:", error);
      options?.onError?.(error);
    },
  });
};

// ✅ Update mutation
export const useUpdateProduct = (options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProductUpdate) => {
      return await apiFetch(endpoints.products.update, { body: data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      options?.onSuccess?.();
    },
    onError: (error) => {
      console.error("Update product failed:", error);
      options?.onError?.(error);
    },
  });
};

// ✅ Delete mutation
export const useDeleteProduct = (options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return await apiFetch(endpoints.products.delete, { query: { id } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      options?.onSuccess?.();
    },
    onError: (error) => {
      console.error("Delete product failed:", error);
      options?.onError?.(error);
    },
  });
};
```

### Step 6: Create Table Columns (`components/ProductsTable.columns.tsx`)

```typescript
import { type ColumnDef } from "@tanstack/react-table";
import { type TFunction } from "i18next";
import { type Product } from "@/features/products/types";

export const createProductsColumns = (
  t: TFunction
): ColumnDef<Product>[] => [
  {
    accessorKey: "id",
    header: t("id"),
    enableColumnFilter: false,
  },
  {
    accessorKey: "name",
    header: t("name"),
    enableColumnFilter: true,
    meta: {
      filterVariant: "input",
    },
  },
  {
    accessorKey: "price",
    header: t("price"),
    cell: ({ row }) => {
      const price = row.original.price;
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price);
    },
    enableColumnFilter: false,
  },
  {
    accessorKey: "categoryId",
    header: t("category"),
    enableColumnFilter: true,
    meta: {
      filterVariant: "select",
      filterOptions: [
        { id: 1, name: "Electronics" },
        { id: 2, name: "Clothing" },
        { id: 3, name: "Food" },
      ],
    },
  },
];
```

### Step 7: Create Table Component (`components/ProductsTable.tsx`)

```typescript
import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { DataTable, type DataTableAction } from "@/shared/components/data-table/DataTable";
import { useProducts, useDeleteProduct } from "@/features/products/api/useProducts";
import { createProductsColumns } from "./ProductsTable.columns";
import { type Product } from "@/features/products/types";

export const ProductsTable = memo(function ProductsTable() {
  const { t } = useTranslation("products");
  const { t: tCommon } = useTranslation("common");
  const productsQuery = useProducts();
  const columns = useMemo(() => createProductsColumns(t), [t]);

  const deleteProductMutation = useDeleteProduct({
    onSuccess: () => toast.success(t("messages.deleteSuccess")),
    onError: () => toast.error(t("messages.deleteError")),
  });

  const actions: DataTableAction<Product>[] = useMemo(
    () => [
      {
        icon: Eye,
        label: tCommon("actions.view"),
        onClick: (product) => console.log("View product:", product),
      },
      {
        icon: Pencil,
        label: tCommon("actions.edit"),
        onClick: (product) => {
          // Open edit dialog
        },
      },
      {
        icon: Trash2,
        label: tCommon("actions.delete"),
        onClick: (product) => deleteProductMutation.mutate(product.id),
        variant: "destructive",
      },
    ],
    [tCommon, deleteProductMutation]
  );

  return (
    <DataTable
      columns={columns}
      queryResult={productsQuery}
      enableColumnFilters
      showExport
      actions={actions}
    />
  );
});
```

### Step 8: Add Translation Keys (`locales/en/products.json`)

```json
{
  "title": "Products",
  "subtitle": "Manage your product catalog",
  "id": "ID",
  "name": "Product Name",
  "description": "Description",
  "price": "Price",
  "category": "Category",
  "messages": {
    "deleteSuccess": "Product deleted successfully",
    "deleteError": "Failed to delete product"
  }
}
```

Add Arabic translations in `locales/ar/products.json`.

### Step 9: Create Route (`routes/products.tsx`)

```typescript
import { createFileRoute } from "@tanstack/react-router";
import { ProductsTable } from "@/features/products/components/ProductsTable";
import { DashboardLayout } from "@/shared/components/layout/DashboardLayout";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/products")({
  component: ProductsPage,
});

function ProductsPage() {
  const { t } = useTranslation("products");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <ProductsTable />
      </div>
    </DashboardLayout>
  );
}
```

### Step 10: Add Navigation Link (if needed)

In `src/shared/components/layout/Sidebar.tsx`, add:

```typescript
{
  label: t("nav.products"),
  href: "/products",
  icon: Package,  // Import from lucide-react
},
```

---

## How to Add a List Page

**Use the factory pattern - DO NOT write pagination logic manually.**

### Pattern A: Simple List (No Filters)

```typescript
import { createDataTableHook } from "@/shared/hooks/createDataTableHook";
import { endpoints } from "@/core/api/endpoints";
import { type Product } from "./types";

export const useProducts = createDataTableHook<Product>(
  "products",          // ← Query key
  endpoints.products.list
);
```

**That's it!** The factory handles:
- ✅ URL-based pagination (`?page=1&pageSize=10`)
- ✅ Backend-aware query params (Laravel vs ASP.NET)
- ✅ Automatic refetching
- ✅ TanStack Query integration

### Pattern B: List with Server-Side Filters (ASP.NET)

```typescript
export const useProducts = (filters?: { categoryId?: number; status?: string }) => {
  return createDataTableHook<Product>(
    "products",
    endpoints.products.list,
    {
      filters,  // ← Sent to server as query params
    }
  )(filters);
};
```

### Pattern C: List with Client-Side Filters (Laravel)

```typescript
export const useProducts = createDataTableHook<Product>(
  "products",
  endpoints.products.list,
  {
    clientFilter: (items, filters) => {
      if (!filters?.search) return items;
      return items.filter(item =>
        item.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    },
  }
);
```

---

## How to Add Create/Edit Forms

### Step 1: Use Generic Dialog Components

**TWO OPTIONS:**

#### Option A: `GenericFormDialog` (Full Control)

```typescript
import { GenericFormDialog } from "@/shared/components/dialogs/GenericFormDialog";
import { productCreateSchema } from "./schemas/product.schema";

<GenericFormDialog
  mode="create"  // or "edit"
  schema={productCreateSchema}
  initialValues={{}}
  title="Create Product"
  description="Add a new product to the catalog"
  onSubmit={async (values) => {
    await createProduct.mutateAsync(values);
  }}
  open={isOpen}
  onOpenChange={setIsOpen}
/>
```

#### Option B: `GenericActionDialog` (Simpler)

```typescript
import { GenericActionDialog } from "@/shared/components/dialogs/GenericActionDialog";
import { productCreateSchema } from "./schemas/product.schema";
import { productFieldsDefinition } from "./config/dialogConfig";

<GenericActionDialog
  isCreate={true}  // false for edit
  schema={productCreateSchema}
  titleKey="products:dialogs.create.title"
  description={t("dialogs.create.description")}
  namespace="products"
  fieldsDefinition={productFieldsDefinition}
  onSubmit={async (values) => {
    await createProduct.mutateAsync(values);
  }}
  open={isOpen}
  onOpenChange={setIsOpen}
  initialValues={isCreate ? {} : selectedProduct}
/>
```

### Step 2: Define Field Configuration (`config/dialogConfig.ts`)

```typescript
import { type Product } from "../types";

export const productFieldsDefinition: Record<keyof Product, unknown> = {
  name: { type: "text", order: 1 },
  description: { type: "textarea", order: 2 },
  price: { type: "number", order: 3 },
  categoryId: { 
    type: "select", 
    order: 4,
    options: [
      { id: 1, name: "Electronics" },
      { id: 2, name: "Clothing" },
      { id: 3, name: "Food" },
    ],
  },
};
```

### Step 3: Add Dialog State Management

```typescript
import { useDialogState } from "@/shared/hooks/useDialogState";

const createDialog = useDialogState<Product>();
const editDialog = useDialogState<Product>();

// Open create dialog
<Button onClick={() => createDialog.open()}>Create Product</Button>

// Open edit dialog
<Button onClick={() => editDialog.open(product)}>Edit</Button>

// Render dialogs
{createDialog.isOpen && (
  <GenericActionDialog
    isCreate={true}
    schema={productCreateSchema}
    onSubmit={handleCreate}
    open={createDialog.isOpen}
    onOpenChange={createDialog.setOpen}
  />
)}

{editDialog.data && (
  <GenericActionDialog
    isCreate={false}
    schema={productUpdateSchema}
    initialValues={editDialog.data}
    onSubmit={handleUpdate}
    open={editDialog.isOpen}
    onOpenChange={editDialog.setOpen}
  />
)}
```

---

## How to Use i18n and Direction

### Translation Keys

```typescript
import { useTranslation } from "react-i18next";

const { t } = useTranslation("products");  // ← Namespace

// Use keys
t("title")                    // → "Products"
t("messages.deleteSuccess")   // → "Product deleted successfully"

// Fallback
t("unknownKey", "Default text")
```

### Direction Support (RTL/LTR)

```typescript
import { useDirection } from "@/shared/hooks/useDirection";

const { dir } = useDirection();  // ← "rtl" or "ltr"

<div dir={dir} className={cn(dir === "rtl" && "font-arabic")}>
  {content}
</div>
```

### Language Switching

```typescript
import { useTranslation } from "react-i18next";

const { i18n } = useTranslation();

const changeLanguage = (lang: "en" | "ar") => {
  i18n.changeLanguage(lang);
};
```

---

## How to Use Auth & Permissions

### Check if User is Logged In

```typescript
import { useAuthStore } from "@/store/auth.store";

const { user, tokens } = useAuthStore();

if (!user || !tokens) {
  // User not logged in
}
```

### Selective Subscriptions (Performance)

```typescript
import { useAuthUser, useAuthPermissions } from "@/store/auth.store";

// ✅ Component only rerenders when user changes
const user = useAuthUser();

// ✅ Component only rerenders when permissions change
const permissions = useAuthPermissions();
```

### Check Permissions (Laravel)

```typescript
const { hasPermission } = useAuthStore();

if (hasPermission("products.create")) {
  // Show create button
}
```

### Check Role (ASP.NET)

```typescript
const { user } = useAuthStore();

if (user?.role === "Admin") {
  // Show admin features
}
```

### Protected Routes

```typescript
import { useAuthGuard } from "@/features/auth/hooks/useAuthGuard";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  beforeLoad: () => {
    useAuthGuard();  // ← Redirects to /login if not authenticated
  },
});
```

---

## Best Practices

### 1. **Always Memoize Expensive Computations**

✅ **DO:**
```typescript
const columns = useMemo(() => createColumns(t), [t]);
const actions = useMemo(() => [...], [dependencies]);
const handleSubmit = useCallback(async (data) => { ... }, [dependencies]);
```

❌ **DON'T:**
```typescript
const columns = createColumns(t);  // ← Recreated every render
```

### 2. **Use TanStack Query Options Wisely**

```typescript
// Static data (user lists, categories)
staleTime: 5 * 60 * 1000,  // 5 minutes

// Dynamic data (dashboard stats)
staleTime: 30 * 1000,      // 30 seconds

// Real-time data (notifications)
staleTime: 0,              // Always fresh
refetchInterval: 10000,     // Poll every 10s
```

### 3. **Handle Errors Gracefully**

```typescript
const mutation = useApiMutation({
  mutationFn: async (data) => { ... },
  onSuccess: () => {
    toast.success("Success!");
    queryClient.invalidateQueries({ queryKey: ["products"] });
  },
  onError: (error) => {
    console.error("Error:", error);
    toast.error(error.message || "Something went wrong");
  },
});
```

### 4. **Use Optimistic Updates for Better UX**

```typescript
const updateMutation = useMutation({
  mutationFn: async (data) => { ... },
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ["products"] });

    // Snapshot previous value
    const previous = queryClient.getQueryData(["products"]);

    // Optimistically update
    queryClient.setQueryData(["products"], (old) => ({
      ...old,
      items: old.items.map(item => 
        item.id === newData.id ? { ...item, ...newData } : item
      ),
    }));

    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(["products"], context.previous);
  },
  onSettled: () => {
    // Always refetch
    queryClient.invalidateQueries({ queryKey: ["products"] });
  },
});
```

### 5. **Validate with Zod Everywhere**

```typescript
// ✅ Schema definition
export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().positive("Price must be positive"),
});

// ✅ Type inference
export type Product = z.infer<typeof productSchema>;

// ✅ Runtime validation
const result = productSchema.safeParse(data);
if (!result.success) {
  console.error(result.error.format());
}
```

### 6. **Cancel Requests on Unmount**

```typescript
const queryFn = async ({ signal }) => {
  const response = await apiFetch(endpoints.products.list, { signal });
  return response;
};

useApiQuery({
  queryKey: ["products"],
  queryFn,
});
```

### 7. **Use Skeleton Loaders**

The DataTable component automatically shows a skeleton loader during `isLoading`:

```typescript
<DataTable
  columns={columns}
  queryResult={productsQuery}  // ← Includes isLoading, isFetching
/>
```

For custom components:

```typescript
import { Skeleton } from "@/shared/components/ui/skeleton";

{isLoading ? (
  <Skeleton className="h-10 w-full" />
) : (
  <div>{data}</div>
)}
```

---

## Common Patterns Reference

### Data Fetching

```typescript
// List with pagination
const useProducts = createDataTableHook<Product>("products", endpoints.products.list);

// Single item
const productQuery = useApiQuery({
  queryKey: ["product", id],
  queryFn: async () => apiFetch(endpoints.products.get, { query: { id } }),
  enabled: !!id,
});

// Dependent query
const categoriesQuery = useApiQuery({
  queryKey: ["categories"],
  queryFn: async () => apiFetch(endpoints.categories.list),
});

const productsQuery = useApiQuery({
  queryKey: ["products", categoryId],
  queryFn: async () => apiFetch(endpoints.products.list, { 
    query: { categoryId } 
  }),
  enabled: categoriesQuery.isSuccess,  // ← Wait for categories first
});
```

### Mutations

```typescript
// Create
const createMutation = useMutation({
  mutationFn: async (data: ProductCreate) => {
    return await apiFetch(endpoints.products.create, { body: data });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
  },
});

// Update
const updateMutation = useMutation({
  mutationFn: async (data: ProductUpdate) => {
    return await apiFetch(endpoints.products.update, { body: data });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
  },
});

// Delete
const deleteMutation = useMutation({
  mutationFn: async (id: number) => {
    return await apiFetch(endpoints.products.delete, { query: { id } });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
  },
});
```

### Conditional Rendering

```typescript
const productsQuery = useProducts();

if (productsQuery.isLoading) {
  return <DataTableSkeleton columnCount={5} rowCount={10} />;
}

if (productsQuery.isError) {
  return <ErrorState error={productsQuery.error} />;
}

return <DataTable columns={columns} queryResult={productsQuery} />;
```

### Toast Notifications

```typescript
import { toast } from "sonner";

// Success
toast.success("Product created successfully");

// Error
toast.error("Failed to create product");

// With action
toast.success("Product deleted", {
  action: {
    label: "Undo",
    onClick: () => restoreProduct(),
  },
});
```

---

## Summary Checklist

When adding a new feature, ensure you:

- [ ] Created folder in `src/features/[feature]/`
- [ ] Defined Zod schemas in `schemas/`
- [ ] Generated types with `z.infer<>`
- [ ] Added endpoints to `src/core/api/endpoints.ts`
- [ ] Created API hooks using factory or `useApiMutation`
- [ ] Built table component with `DataTable`
- [ ] Added translation keys in `locales/en/` and `locales/ar/`
- [ ] Created route in `routes/[feature].tsx`
- [ ] Added navigation link (if needed)
- [ ] Tested with both backends (Laravel & ASP.NET)
- [ ] Verified RTL support works

---

**For backend-specific instructions, see:** [BACKEND_SWITCHING_GUIDE.md](./BACKEND_SWITCHING_GUIDE.md)
