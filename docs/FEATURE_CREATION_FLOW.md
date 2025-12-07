# Feature Creation Flow

**Purpose:** Practical, end-to-end steps for adding a new feature (e.g., `products`) while staying consistent with the boilerplate.

## Prerequisites

- Backend reachable at `VITE_API_BASE_URL` with `VITE_BACKEND_KIND` set (`aspnet` or `laravel`) in `.env`.
- Dependencies installed: `pnpm install` (Node 18+).
- Know the API contract you are targeting (request/response shapes and pagination style).

## 1) Plan the slice

- Name the feature folder `src/features/<feature>/`.
- Identify the CRUD operations and list views you need.
- Decide which namespace(s) you will use for translations (usually `<feature>` plus `common`).

## 2) Define schema and types

- File: `src/features/<feature>/schemas/<feature>.schema.ts`.
- Use Zod for shape + validation; export `Create`/`Update` variants.
- Export inferred types in `src/features/<feature>/types/index.ts`.

## 3) Register endpoints

### Location
**File:** `src/core/api/endpoints.ts`

### How to Add

1. **Import your feature types** at the top if needed:
   ```typescript
   import { type Product } from "@/features/products/types";
   ```

2. **Add your endpoints** to the `endpoints` object before `} as const;`:
   ```typescript
   export const endpoints = {
     auth: authEndpoints,
     users: { /* existing */ },
     // Add your feature here:
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
       } as EndpointDef<{ id: number }, Product>,
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

### Important Rules

- **Path format**: NO leading `/` (e.g., `"Products/List"`, not `"/Products/List"`)
- **Base URL**: Ensure `VITE_API_BASE_URL` in `.env` ends with `/`
- **URL construction**: `https://api.example.com/api/` + `Products/List` = `https://api.example.com/api/Products/List`
- **Method**: Use `"GET"`, `"POST"`, `"PUT"`, `"PATCH"`, or `"DELETE"`
- **requiresAuth**: Set `true` for protected endpoints (adds Authorization header)

### Type Parameters

`EndpointDef<TRequest, TResponse>` defines:
- **TRequest**: Input type (query params, body, etc.)
- **TResponse**: Output type (what backend returns)

### Response Types by Backend

**For list endpoints:**
```typescript
AspNetEnvelope<AspNetPagedResult<T>> | LaravelDataTableResponse<T>
```

**For single item endpoints:**
```typescript
AspNetEnvelope<T> | T  // ASP.NET wraps in envelope, Laravel returns directly
```

**For delete endpoints:**
```typescript
AspNetEnvelope<null> | null
```

### Example: Complete Feature Endpoints

```typescript
// At the top with other imports
import { type Product, type ProductCreate, type ProductUpdate } from "@/features/products/types";
import {
  type AspNetEnvelope,
  type AspNetPagedResult,
  type LaravelDataTableResponse,
} from "@/core/types/api";

// In the endpoints object
export const endpoints = {
  // ... existing endpoints
  
  products: {
    // List with pagination
    list: {
      path: "Products/List",
      method: "GET",
      requiresAuth: true,
      description: "Get paginated list of products",
      tags: ["products"],
    } as EndpointDef<
      Record<string, unknown> | undefined,
      AspNetEnvelope<AspNetPagedResult<Product>> | LaravelDataTableResponse<Product>
    >,
    
    // Get single item
    get: {
      path: "Products/Get",
      method: "GET",
      requiresAuth: true,
      description: "Get product by ID",
    } as EndpointDef<{ id: number }, AspNetEnvelope<Product> | Product>,
    
    // Create
    create: {
      path: "Products/Create",
      method: "POST",
      requiresAuth: true,
      description: "Create new product",
    } as EndpointDef<ProductCreate, AspNetEnvelope<Product> | Product>,
    
    // Update
    update: {
      path: "Products/Update",
      method: "PUT",
      requiresAuth: true,
      description: "Update existing product",
    } as EndpointDef<ProductUpdate, AspNetEnvelope<Product> | Product>,
    
    // Delete
    delete: {
      path: "Products/Delete",
      method: "DELETE",
      requiresAuth: true,
      description: "Delete product by ID",
    } as EndpointDef<{ id: number }, AspNetEnvelope<null> | null>,
  },
} as const;
```

## 4) Data hooks

- File: `src/features/<feature>/api/use<Feature>.ts` (use the factory pattern).
- Lists: `createDataTableHook<T>("key", endpoints.<feature>.list)`; add filters/clientFilter if needed.
- Mutations: `useMutation` + `apiFetch` with `invalidateQueries({ queryKey: ["<feature>"] })` on success.

## 5) UI components

- Folder: `src/features/<feature>/components/` (and `/pages/` if needed).
- Tables: build `<Feature>Table.tsx` + `<Feature>Table.columns.tsx` using TanStack Table + shared `DataTable`.
- Dialogs/forms: prefer `GenericFormDialog` or `AutoFormDialog`; wire schemas and translations to `common` + feature namespaces.

## 6) Routing and navigation

- Register route under the dashboard tree (e.g., `routeTree.ts` or file routes) and ensure it is protected if needed.
- Add nav item in `src/shared/config/navigation.ts` pointing to the new route.

## 7) Localization

- Add keys to `src/locales/en/<feature>.json` and `src/locales/ar/<feature>.json`; reuse `common` for shared labels/actions/validation.
- Keep validation strings in `common.validation` so forms and dialogs stay consistent.

## 8) Backend nuance

- Laravel lists often return DataTables shape; ASP.NET uses paged envelopes. Let the client/normalizers handle this—avoid feature-level conditionals.
- Keep payload casing camelCase; rely on `api/normalizers.ts` if server differs.

## 9) Testing and verification

- Run `pnpm dev` and exercise list, create, update, delete.
- Check translations in both locales; flip RTL via language switcher to verify layout.
- Run `pnpm lint` and ensure types pass (`pnpm build`).

## 10) Delivery checklist

- Folder structure matches the pattern under `src/features/`.
- Endpoints added and used via `apiFetch` only.
- Data hooks invalidate the correct query keys.
- Routes and navigation wired.
- Translations added (`en`/`ar`) and validation strings reuse `common`.
- Lint/build clean.

> For deeper patterns and examples, see `docs/AI_AGENT_IMPLEMENTATION_GUIDE.md` and `docs/BACKEND_SWITCHING_GUIDE.md`.
