# AI Agent Implementation Guide

**Last Updated:** December 7, 2025  
**Target Audience:** AI Assistants, Developers, Code Generators  
**Purpose:** Exact, step-by-step instructions for implementing features in this multi-backend React boilerplate

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

## System Setup and Prerequisites

### Required Tools

- **Node.js**: Version 18 or higher
- **pnpm**: Package manager (install via `corepack enable` or `npm i -g pnpm`)
- **Backend Server**: Either Laravel or ASP.NET API running and accessible

### Initial Setup Steps

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Configure environment:**

   - Copy `.env.example` to `.env`
   - Set `VITE_API_BASE_URL` (must end with `/`)
   - Set `VITE_BACKEND_KIND` (`aspnet` or `laravel`)
   - Optional: Set `OPENAI_API_KEY` for Intlayer translation filling

3. **Start development server:**

   ```bash
   pnpm dev
   ```

   - Server runs at `http://localhost:5018`
   - **Important**: Restart server after changing `.env`

4. **Clear browser storage when switching backends:**
   - Open DevTools → Application → Storage
   - Clear `localStorage` (auth tokens differ between backends)
   - Or run: `localStorage.clear()`

### Configuration Files Overview

#### `vite.config.ts`

- **Purpose**: Vite build configuration
- **Key Features**:
  - React plugin with fast refresh
  - Tailwind CSS integration
  - Security headers middleware (HSTS, CSP, X-Frame-Options)
  - PWA support with Workbox
  - Bundle visualizer (production builds)
  - Path alias: `@/` → `./src/`

#### `tsconfig.json` + `tsconfig.app.json` + `tsconfig.node.json`

- **Purpose**: TypeScript compiler configuration
- **Key Settings**:
  - Path alias: `@/*` → `./src/*`
  - Strict mode enabled
  - React 19 JSX transform
  - ES2020 target

#### `tailwind.config.ts`

- **Purpose**: Tailwind CSS configuration
- **Key Features**:
  - Dark mode support (class-based)
  - Custom color system with CSS variables
  - Tajawal font as default sans-serif (for Arabic support)
  - shadcn/ui compatible design tokens
  - Custom animations (accordion, etc.)

#### `eslint.config.js`

- **Purpose**: Code quality and accessibility linting
- **Key Features**:
  - TypeScript ESLint rules
  - React Hooks rules enforcement
  - React Refresh for HMR
  - **jsx-a11y** plugin for WCAG 2.1 AA compliance
  - Checks: alt text, ARIA props, keyboard navigation, focus management

#### `intlayer.config.ts`

- **Purpose**: Intlayer i18n configuration
- **Key Features**:
  - Locales: English, Arabic
  - Default: English
  - OpenAI integration for auto-translation (`pnpm intlayer:fill`)
  - JSON sync plugin: reads/writes `src/locales/{locale}/{namespace}.json`

#### `components.json`

- **Purpose**: shadcn/ui configuration
- **Key Settings**:
  - Style: new-york
  - TypeScript + RSC disabled
  - Tailwind CSS variables enabled
  - Base color: slate
  - Custom aliases for components/utils/hooks
  - Registry support for custom component libraries

#### `postcss.config.js`

- **Purpose**: PostCSS configuration
- **Plugins**: `@tailwindcss/postcss` (Tailwind v4)

---

## Tech Stack

**DO NOT CHANGE OR ADD TO THIS STACK**

### Core Framework

- **React 19.2.0** - UI library (latest with optimized rendering)
- **TypeScript 5.9** - Type safety with strict mode
- **Vite 7.2** - Build tool & dev server with HMR

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

- **react-i18next 16.3** - Translation library (React bindings for i18next)
- **i18next-browser-languagedetector** - Auto-detect user language
- **Intlayer 7.3** - AI-powered translation management
- **@intlayer/sync-json-plugin** - Syncs translations to JSON files

**Setup Location**: `src/core/i18n/i18n.ts`

**Configuration**:

```typescript
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources: { en: {...}, ar: {...} },
    defaultNS: "common",
    fallbackLng: "ar", // Default to Arabic
    lng: "ar",
    supportedLngs: ["en", "ar"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "cookie", "navigator"],
      caches: ["localStorage"],
    },
  });
```

**Translation Files**: `src/locales/{en|ar}/{namespace}.json`

- `common.json`: Shared translations (actions, validation, errors)
- `users.json`: Users feature translations
- `statistics.json`: Statistics feature translations
- Add new namespaces as needed per feature

**Intlayer Commands**:

- `pnpm intlayer:fill`: AI-fill missing translations (requires `OPENAI_API_KEY`)
- `pnpm intlayer:build`: Build Intlayer dictionaries
- `pnpm intlayer:push`: Push translations to remote (if configured)

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
const response = await fetch("/api/users"); // ← NEVER DO THIS
```

**WHY:** The central client (`src/core/api/client.ts`) provides:

#### Authentication & Security

- **Automatic token injection**: Reads from Zustand auth store
- **Token refresh on 401**: Attempts refresh before failing
- **CSRF protection**: Laravel CSRF token handling
- **Rate limiting**: Per-endpoint throttling (configurable)
- **XSS prevention**: Input sanitization via `sanitizeObject`

#### Backend Normalization

- **Laravel**: DataTables format (`data`, `recordsTotal`)
- **ASP.NET**: Envelope format (`result`, `code`, `message`, `error`)
- **Unified Output**: Both normalized to `PagedResult<T>`
- **Pagination params**: Auto-converted (Laravel: `page`/`size`, ASP.NET: `PageNumber`/`PageSize`)

#### Error Handling

- **HTTP errors**: Unified error format with status codes
- **Network errors**: Retry with exponential backoff
- **Validation errors**: Extracted from backend response
- **Type-safe errors**: `UnifiedApiError` interface

#### Advanced Features

- **Request/Response interceptors**: Modify requests/responses globally
- **Retry logic**: Configurable retry strategy with backoff
- **Request cancellation**: AbortSignal support
- **Performance tracking**: Optional performance interceptor
- **Logging**: Development-mode request/response logging

#### Architecture Files

- `client.ts`: Core fetch wrapper
- `normalizers.ts`: Backend-specific data transformations
- `endpoints.ts`: Type-safe endpoint definitions
- `hooks.ts`: TanStack Query wrappers (`useApiQuery`, `useApiMutation`)
- `interceptors.ts`: Request/response/error interceptors
- `retry.ts`: Exponential backoff retry logic
- `config.ts`: Global API configuration and presets
- `queryClient.ts`: TanStack Query client factory

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

export const productCreateSchema = productSchema.omit({
  id: true,
  createdAt: true,
});
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

**Location:** `src/core/api/endpoints.ts`

**Instructions:**

1. Import your feature types and API response types
2. Add endpoint definitions to the `endpoints` object
3. Use correct type parameters for request/response
4. Follow path and authentication rules

**Complete Example:**

```typescript
// 1. Import your types at the top
import {
  type Product,
  type ProductCreate,
  type ProductUpdate,
} from "@/features/products/types";
import {
  type AspNetEnvelope,
  type AspNetPagedResult,
  type LaravelDataTableResponse,
} from "@/core/types/api";

// 2. Add to endpoints object (before `} as const;`)
export const endpoints = {
  auth: authEndpoints,
  users: {
    /* existing */
  },

  // 3. Add your feature endpoints
  products: {
    // List endpoint (paginated)
    list: {
      path: "Products/List", // ← NO leading slash
      method: "GET",
      requiresAuth: true,
      description: "Get paginated list of products", // Optional
      tags: ["products"], // Optional
    } as EndpointDef<
      Record<string, unknown> | undefined, // Request (query params)
      // Response (both backend formats)
      | AspNetEnvelope<AspNetPagedResult<Product>>
      | LaravelDataTableResponse<Product>
    >,

    // Get single item
    get: {
      path: "Products/Get",
      method: "GET",
      requiresAuth: true,
    } as EndpointDef<
      { id: number }, // Request
      AspNetEnvelope<Product> | Product // Response
    >,

    // Create
    create: {
      path: "Products/Create",
      method: "POST",
      requiresAuth: true,
    } as EndpointDef<
      ProductCreate, // Request body
      AspNetEnvelope<Product> | Product // Response
    >,

    // Update
    update: {
      path: "Products/Update",
      method: "PUT",
      requiresAuth: true,
    } as EndpointDef<
      ProductUpdate, // Request body
      AspNetEnvelope<Product> | Product // Response
    >,

    // Delete
    delete: {
      path: "Products/Delete",
      method: "DELETE",
      requiresAuth: true,
    } as EndpointDef<
      { id: number }, // Request (query param)
      AspNetEnvelope<null> | null // Response
    >,
  },
} as const;
```

**Critical Rules:**

✅ **Path Format:**

- Use `"Products/List"` (no leading `/`)
- `VITE_API_BASE_URL` must end with `/`
- Result: `https://api.example.com/api/` + `Products/List`

❌ **Common Mistakes:**

```typescript
// Wrong: leading slash
path: "/Products/List" // Creates https://api.example.com/api//Products/List

// Wrong: base URL without trailing slash
VITE_API_BASE_URL=https://api.example.com/api // Creates https://api.example.com/apiProducts/List
```

**Response Type Patterns:**

```typescript
// For LIST endpoints (paginated)
AspNetEnvelope<AspNetPagedResult<T>> | LaravelDataTableResponse<T>;

// For GET/CREATE/UPDATE endpoints (single item)
AspNetEnvelope<T> | T;

// For DELETE endpoints
AspNetEnvelope<null> | null;

// For public endpoints (no auth)
requiresAuth: false; // or omit (defaults to false)
```

**EndpointDef Type Parameters:**

```typescript
EndpointDef<TRequest, TResponse>;
```

- **TRequest**: What you send (query params, body, URL params)
- **TResponse**: What backend returns (before normalization)

**Optional Fields:**

```typescript
{
  path: "Products/List",
  method: "GET",
  requiresAuth: true,
  description: "Human-readable description", // For documentation
  tags: ["products", "catalog"], // For grouping
}
```

### Step 5: Create API Hooks (`api/useProducts.ts`)

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

export const createProductsColumns = (t: TFunction): ColumnDef<Product>[] => [
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
import {
  DataTable,
  type DataTableAction,
} from "@/shared/components/data-table/DataTable";
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

### Page Header Pattern

**ALWAYS include the feature icon from navigation config in page titles:**

```typescript
import { Users } from "lucide-react"; // ← Import icon from navigation
import { useTranslation } from "react-i18next";

const { t } = useTranslation("users");

return (
  <div className="flex flex-col gap-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
          <Users className="h-6 w-6 text-secondary" />{" "}
          {/* ← Icon before title */}
          {t("list.title")}
        </h1>
        <p className="text-muted-foreground">{t("list.description")}</p>
      </div>
      <Button onClick={() => createDialog.open()}>
        <Plus className="h-4 w-4" />
        {tCommon("actions.add")}
      </Button>
    </div>
    {/* Table component */}
  </div>
);
```

**Icon Guidelines:**

- Use icon from `src/shared/config/navigation.ts` for the feature
- Size: `h-6 w-6` for page titles
- Color: `text-secondary` for consistency
- Position: Before title text with `gap-2`

### Pattern A: Simple List (No Filters)

```typescript
import { createDataTableHook } from "@/shared/hooks/createDataTableHook";
import { endpoints } from "@/core/api/endpoints";
import { type Product } from "./types";

export const useProducts = createDataTableHook<Product>(
  "products", // ← Query key
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
export const useProducts = (filters?: {
  categoryId?: number;
  status?: string;
}) => {
  return createDataTableHook<Product>("products", endpoints.products.list, {
    filters, // ← Sent to server as query params
  })(filters);
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
      return items.filter((item) =>
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
import { useTranslation } from "react-i18next";

const { t } = useTranslation();

<GenericFormDialog
  mode="create" // or "edit"
  schema={productCreateSchema(t)} // Pass t function for translated validation
  initialValues={{}}
  title="Create Product"
  description="Add a new product to the catalog"
  onSubmit={async (values) => {
    await createProduct.mutateAsync(values);
  }}
  open={isOpen}
  onOpenChange={setIsOpen}
  fieldConfig={{
    name: { type: "text", label: "Product Name", placeholder: "Enter name" },
    price: { type: "number", label: "Price", placeholder: "0.00" },
  }}
/>;

// Uses TanStack Form with:
// - Form-level Zod validation
// - Shadcn Field components (Field, FieldLabel, FieldError)
// - Automatic field type inference from schema
// - Translated validation messages
```

#### Option B: `GenericActionDialog` (Simpler)

```typescript
import { GenericActionDialog } from "@/shared/components/dialogs/GenericActionDialog";
import { productCreateSchema } from "./schemas/product.schema";
import { productFieldsDefinition } from "./config/dialogConfig";

<GenericActionDialog
  isCreate={true} // false for edit
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
/>;
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

const { t } = useTranslation("products"); // ← Namespace

// Use keys
t("title"); // → "Products"
t("messages.deleteSuccess"); // → "Product deleted successfully"

// Fallback
t("unknownKey", "Default text");
```

### Direction Support (RTL/LTR)

```typescript
import { useDirection } from "@/shared/hooks/useDirection";

const { dir } = useDirection(); // ← "rtl" or "ltr"

<div dir={dir} className={cn(dir === "rtl" && "font-arabic")}>
  {content}
</div>;
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
    useAuthGuard(); // ← Redirects to /login if not authenticated
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
const columns = createColumns(t); // ← Recreated every render
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
  queryResult={productsQuery} // ← Includes isLoading, isFetching
/>
```

For custom components:

```typescript
import { Skeleton } from "@/shared/components/ui/skeleton";

{
  isLoading ? <Skeleton className="h-10 w-full" /> : <div>{data}</div>;
}
```

---

## Common Patterns Reference

### Data Fetching

```typescript
// List with pagination
const useProducts = createDataTableHook<Product>(
  "products",
  endpoints.products.list
);

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
  queryFn: async () =>
    apiFetch(endpoints.products.list, {
      query: { categoryId },
    }),
  enabled: categoriesQuery.isSuccess, // ← Wait for categories first
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

## Debugging & Troubleshooting

### Common Issues & Solutions

#### 1. **404 Error: API Endpoint Not Found**

**Symptom:** `GET /api/Products/List 404 Not Found`

**Checklist:**

- [ ] Endpoint path doesn't have leading `/`: Use `"Products/List"` not `"/Products/List"`
- [ ] `VITE_API_BASE_URL` ends with `/`: `https://api.example.com/api/` ✅
- [ ] Combined URL is correct: `https://api.example.com/api/Products/List`
- [ ] Backend API is actually running
- [ ] CORS headers are set correctly on backend

**Debug:**

```typescript
// In browser console
console.log(import.meta.env.VITE_API_BASE_URL); // Should show full URL with trailing /
console.log(import.meta.env.VITE_BACKEND_KIND); // Should show "aspnet" or "laravel"

// Check actual request URL in Network tab of DevTools
```

#### 2. **401 Unauthorized: Token Issues**

**Symptom:** Login successful but API calls fail with 401

**Checklist:**

- [ ] Token stored in localStorage: `localStorage.getItem("auth-store")`
- [ ] Token is not expired
- [ ] Authorization header sent: Check Network tab in DevTools
- [ ] Backend accepts Authorization header format: `Authorization: Bearer <token>`
- [ ] Token format matches backend expectations

**Debug:**

```typescript
// In browser console
import { useAuthStore } from "@/store/auth.store";
const store = useAuthStore.getState();
console.log("User:", store.user);
console.log("Tokens:", store.tokens);
console.log(
  "Expired?",
  new Date(store.tokens?.accessTokenExpiresAt) < new Date()
);
```

#### 3. **CORS Error: "Access-Control-Allow-Origin"**

**Symptom:** Browser console shows CORS error

**Solution:** Backend needs to allow your frontend origin

**Laravel (.env):**

```env
FRONTEND_URL=http://localhost:5018
SESSION_DOMAIN=localhost
```

**ASP.NET (Program.cs):**

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("http://localhost:5018")
              .AllowAnyMethod()
              .AllowAnyHeader());
});
```

#### 4. **Data Not Loading: Query Doesn't Fetch**

**Symptom:** Component mounts but no API call happens

**Checklist:**

- [ ] Component is mounted and visible
- [ ] Query is enabled (check `enabled` option)
- [ ] API endpoint exists and is registered
- [ ] `queryKey` is consistent between queries (use `useApiQuery` wrapper)
- [ ] No console errors blocking execution

**Debug:**

```typescript
// Add to component
const query = useApiQuery({
  queryKey: ["products"],
  queryFn: async () => apiFetch(endpoints.products.list),
});

console.log("Query state:", {
  isLoading: query.isLoading,
  isError: query.isError,
  error: query.error,
  data: query.data,
});

// Check TanStack Query DevTools in browser (if installed)
```

#### 5. **Backend Doesn't Recognize Backend Kind**

**Symptom:** Using ASP.NET format with Laravel backend (or vice versa)

**Checklist:**

- [ ] `VITE_BACKEND_KIND` is correctly set in `.env`
- [ ] Dev server restarted after changing `.env`
- [ ] Endpoint response format matches backend (see Backend Switching Guide)
- [ ] Normalization layer (`src/core/api/normalizers.ts`) handles the format

**Debug:**

```typescript
// In browser console at page load
console.log("Backend kind:", import.meta.env.VITE_BACKEND_KIND);

// Check network response format in DevTools
// ASP.NET: { code: 200, message: "...", result: {...} }
// Laravel: { data: [...], recordsTotal: 100, ... }
```

#### 6. **Validation Errors Not Showing**

**Symptom:** Form submitted but no error messages appear

**Checklist:**

- [ ] `FieldError` component rendered in form
- [ ] Zod schema has validation rules
- [ ] Error message keys are in translation files
- [ ] `validatorAdapter` is set in useForm
- [ ] Field value actually triggers validation

**Debug:**

```typescript
// In form component
const form = useForm({
  defaultValues: { name: "" },
  validatorAdapter: zodValidator(),
});

// Manually trigger validation
await form.validateSync();
console.log("Form errors:", form.state.errors);
```

#### 7. **Translations Not Appearing (Showing Keys Instead)**

**Symptom:** Page shows `"products:title"` instead of "Products"

**Checklist:**

- [ ] Translation namespace exists: `src/locales/en/products.json`
- [ ] Translation key is in file: `"title": "Products"`
- [ ] Correct namespace specified: `useTranslation("products")`
- [ ] i18n initialized properly in `src/core/i18n/i18n.ts`
- [ ] Intlayer build completed: `pnpm intlayer:build`

**Debug:**

```typescript
// In browser console
import i18n from "i18next";
console.log("Available resources:", i18n.getResourceBundle("en", "products"));
console.log("Current language:", i18n.language);
console.log("Namespaces:", i18n.options.ns);
```

#### 8. **RTL Not Working (Arabic Layout Issues)**

**Symptom:** Arabic text but layout is still LTR, or vice versa

**Checklist:**

- [ ] `useDirection()` hook used to get `dir` prop
- [ ] `dir={dir}` attribute set on root container
- [ ] Tailwind CSS config supports RTL (check `tailwind.config.ts`)
- [ ] Language changed successfully
- [ ] CSS uses logical properties (e.g., `start`/`end` instead of `left`/`right`)

**Debug:**

```typescript
// In component
const { dir } = useDirection();
console.log("Current direction:", dir); // Should show "rtl" or "ltr"

// Check DOM
console.log("Root dir attribute:", document.documentElement.dir);

// Switch language and check
import i18n from "i18next";
i18n.changeLanguage("ar");
```

#### 9. **Mutations Not Invalidating Queries**

**Symptom:** After creating/updating item, list doesn't refresh

**Checklist:**

- [ ] `onSuccess` callback in mutation includes `invalidateQueries`
- [ ] Query key matches between list hook and mutation invalidation
- [ ] `queryClient` is obtained from `useQueryClient()`
- [ ] Component remounted after mutation (not just local state update)

**Debug:**

```typescript
// In mutation
const createMutation = useMutation({
  mutationFn: async (data) => { ... },
  onSuccess: () => {
    console.log("About to invalidate queries");
    queryClient.invalidateQueries({ queryKey: ["products"] });
    console.log("Queries invalidated");
  },
});

// Check if list query refetches in Network tab
```

#### 10. **Performance Issues: Slow Renders**

**Symptom:** Page laggy or slow to interact with

**Checklist:**

- [ ] Components wrapped with `memo()`
- [ ] Callbacks wrapped with `useCallback()`
- [ ] Expensive computations wrapped with `useMemo()`
- [ ] DataTable `enableRowSelection` or `enableColumnVisibility` disabled if not needed
- [ ] Virtual scrolling enabled for large lists (`DataTable` supports this)
- [ ] Too many subscriptions to query/store state

**Solutions:**

```typescript
// ✅ Use selective subscriptions
const user = useAuthUser(); // Only rerender when user changes
const permissions = useAuthPermissions(); // Only rerender when permissions change

// ✅ Memoize expensive renders
const columns = useMemo(() => createColumns(t), [t]);

// ✅ Wrap callbacks
const handleDelete = useCallback(
  (id: number) => {
    deleteMutation.mutate(id);
  },
  [deleteMutation]
);

// ✅ Use React DevTools Profiler to find bottlenecks
// In DevTools → Profiler tab → Start recording → Interact → Stop
```

---

## Debugging Tools

### 1. React DevTools

```
Chrome Web Store: Search "React Developer Tools"
- Components tree inspection
- Props/State tracking
- Profiler for performance analysis
```

### 2. TanStack Query DevTools

```typescript
// Already imported in AppProviders.tsx
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Shows in bottom-right corner (dev only)
// Click to see:
// - Active queries and their states
// - Query keys
// - Data/errors
// - Refetch history
```

### 3. TanStack Router DevTools

```typescript
// Already imported in AppProviders.tsx
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

// Shows route tree and navigation history
```

### 4. Browser DevTools Network Tab

```
Steps:
1. Open DevTools (F12)
2. Go to Network tab
3. Reload page
4. Click on API request to see:
   - Request headers (Authorization, etc.)
   - Request body
   - Response format
   - Status codes
   - Timing
```

### 5. Browser Console

```typescript
// Quick debugging
console.log("Debug:", variableName);
console.table(arrayOfObjects);
console.time("operation");
// ... code to measure ...
console.timeEnd("operation");

// Breakpoints
debugger; // Pauses execution here when DevTools open
```

---

## Performance Monitoring

### Lighthouse Audit

```bash
# Built-in to Chrome DevTools
1. Open DevTools (F12)
2. Click Lighthouse tab
3. Select "Desktop" or "Mobile"
4. Click "Analyze page load"
5. Review metrics:
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)
   - Cumulative Layout Shift (CLS)
   - Time to Interactive (TTI)
```

### Web Vitals

```typescript
// Already tracked in src/main.tsx
import { onCLS, onFCP, onLCP, onTTFB } from "web-vitals";

onCLS(console.log); // Cumulative Layout Shift
onFCP(console.log); // First Contentful Paint
onLCP(console.log); // Largest Contentful Paint
onTTFB(console.log); // Time to First Byte
```

### Query Performance

```typescript
// TanStack Query DevTools shows:
// - Query duration
// - Cache hit/miss
// - Refetch frequency
// - Stale time effectiveness
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
