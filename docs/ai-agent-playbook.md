# AI Agent Playbook (tailored to this repo)

Use this checklist to add endpoints, schemas/types, pages, and routes with the patterns used here (React 19 + Vite, TanStack Router/Query/Form, Zod, Tailwind/shadcn, ASP.NET + Laravel backends).

## Key Automation Features

This project features **fully automated DataTable pagination and data handling**:

✅ **Zero Boilerplate**: No manual pagination state management needed  
✅ **URL-Based State**: Pagination in URL params for shareable links and browser navigation  
✅ **Backend-Agnostic**: Automatically handles Laravel vs ASP.NET query param differences  
✅ **Auto Data Extraction**: Pass query result directly—data and total extracted automatically  
✅ **Auto Mode Detection**: Client/server mode determined automatically based on backend type

**Quick example:**

```tsx
// Just 3 lines for a complete data table with pagination!
const widgetsQuery = useWidgets(); // Hook handles pagination via URL
const columns = useMemo(() => createWidgetsColumns(t), [t]);
return <DataTable columns={columns} queryResult={widgetsQuery} />;
```

No `page`, `pageSize`, `onPageChange`, `mode`, `data`, or `total` props needed!

## 0) Backend & auth source of truth

- Canonical doc: `docs/change-server-instructions.md`. Read it before touching auth/backend.
- Default backend: Laravel POS (see `VITE_BACKEND_KIND`).
  - Login + refresh body `{ email, password, type: "web" }` -> response `{ message, access_token, token_type, expires_in }` (43200s today).
  - Tokens in store: `{ backend, accessToken, tokenType, expiresIn, accessTokenExpiresAt, refreshToken?, refreshTokenExpiresAt? }`.
  - `/auth/me` shape `{ fees, pos: { pos_name,pos_lat,pos_lng,id }, user: { id,name,email,phone_no }, perm: string[] }`.
- ASP.NET (kept ready even when Laravel is default):
  - Two login payloads (documented in code as `aspNet phone login` and `aspNet username login`):
    - Phone: `{ phoneNumber, password, clientId, fingerprintHash }`
    - Username: `{ username, password, clientId, fingerprintHash }`
  - Login envelope `{ code, message, error, result: { accessToken, refreshToken?, accessExpiresAtUtc, refreshExpiresAtUtc, sessionId } }` -> normalize to the same token shape with `backend: "aspnet"` and `expiresIn` derived from `accessExpiresAtUtc`.
  - `/auth/me` may be raw or wrapped in `{ code, message, result }` with shape `{ id, isDeleted, username, phoneNumber, firstName, secondName, lastName, surname, fullName, photo, status, role: { id, isDeleted, name } }`.
- Store normalization (always branch by backend):
  - Laravel: user `{ id, name|null, email|null, phoneNo|null, image:null, role:null, backend:"laravel" }`, pos `{ id,name,lat,lng }`, permissions `perm`, fees `fees`.
  - ASP.NET: user `{ id, name(fullName|username|first+last), email: username|null, phoneNo, image: photo|null, role: role?.name ?? null, roles: [role]?, backend:"aspnet" }`; pos null; permissions empty.
- Header identity: read ONLY from auth store (no `/me` fetch in header). Display name fallback `name -> email -> t("header.user")`; role optional/null; avatar uses image or initials/icon.

## 1) Add schemas and types

- **Entity type**: define/extend in `src/features/<feature>/types.ts`.
- **Backend Zod schema**: add to `src/core/schemas/endpoints.schema.ts` (non-auth) or feature-scoped schema files (e.g., `src/features/auth/schemas/auth.schema.ts` for auth). Keep envelopes/paged/data-table shapes centralized in core; feature-specific auth schemas now live under `src/features/auth/schemas/`.
- **Form Zod schema**: add to `src/features/<feature>/schemas/<feature>.schema.ts` (follow `src/features/auth/schemas/auth.schema.ts`); use translation keys for messages.

Example (`widgets`):

```ts
// src/core/schemas/endpoints.schema.ts
export const widgetSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "validation.name.required" }),
});

export const aspNetPagedWidgetsSchema = aspNetPagedResultSchema.extend({
  items: z.array(widgetSchema),
});

export type Widget = z.infer<typeof widgetSchema>;
export type AspNetPagedWidgets = z.infer<typeof aspNetPagedWidgetsSchema>;
```

## 2) Declare the endpoint

Add to `src/core/api/endpoints.ts` with method/path/requiresAuth:

```ts
widgets: {
  list: { path: "/widgets", method: "GET", requiresAuth: true },
},
```

## 3) Data hooks (TanStack Query)

Use the shared client/hooks—do not create new fetch wrappers.

### Standard Query Hook (for non-paginated data):

```ts
// src/features/widgets/api/useWidget.ts
import { apiFetch } from "@/core/api/client";
import { endpoints } from "@/core/api/endpoints";
import { useApiQuery } from "@/core/api/hooks";

export const useWidget = (id: string) =>
  useApiQuery({
    queryKey: ["widget", id],
    queryFn: () => apiFetch(endpoints.widgets.get, { query: { id } }),
  });
```

### Generic Mutation Hooks (for Create/Update/Delete):

**RECOMMENDED PATTERN**: Use `createMutationHook` factory for DRY mutations (see `src/features/users/api/useUsers.ts`).

This factory automatically:
- Handles mutation logic with `apiFetch`
- Invalidates query cache on success
- Provides success/error callbacks
- Supports optional data transformation
- Eliminates 40+ lines of duplicate code per feature

```ts
// src/features/widgets/api/useWidgets.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/core/api/client";
import { endpoints } from "@/core/api/endpoints";
import { type Widget, type WidgetFormData } from "../types";
import type { EndpointDef } from "@/core/api/endpoints";

/**
 * Generic mutation hook factory - DRY pattern for all CRUD operations
 */
function createMutationHook<TVariables>(
  queryKey: string,
  endpoint: EndpointDef<unknown, unknown>,
  transform?: (data: TVariables) => unknown
) {
  return (options?: {
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
  }) => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (data: TVariables) => {
        return await apiFetch(endpoint, {
          body: transform ? transform(data) : data,
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
        options?.onSuccess?.();
      },
      onError: (error) => {
        console.error(`Mutation failed for ${queryKey}:`, error);
        options?.onError?.(error);
      },
    });
  };
}

// Optional: Transform function for field mapping
const transformWidgetData = (data: WidgetFormData) => ({
  ...data,
  // Map form fields to API format
  created_date: data.createdDate,
});

// Export mutation hooks (one line each!)
export const useCreateWidget = createMutationHook<WidgetFormData>(
  "widgets",
  endpoints.widgets.create,
  transformWidgetData
);

export const useUpdateWidget = createMutationHook<WidgetFormData>(
  "widgets",
  endpoints.widgets.update,
  transformWidgetData
);

export const useDeleteWidget = createMutationHook<number>(
  "widgets",
  endpoints.widgets.delete,
  (id) => ({ id })
);
```

**Key Benefits:**
- Single factory function = zero duplication
- Automatic cache invalidation
- Consistent error handling
- Optional data transformation
- Type-safe with generics

### Centralized Pagination Hook (for DataTable):

**RECOMMENDED PATTERN**: Use `createDataTableHook` factory for one-line data hooks with automatic backend handling.

This factory automatically:

- Reads `page` and `pageSize` from URL search params (managed by DataTable)
- Formats query params based on backend type:
  - **Laravel**: `{ page, size }` (lowercase) - applies client-side filtering
  - **ASP.NET**: `{ PageNumber, PageSize }` (capital case) - sends filters to server
- Handles shareable links and browser back/forward navigation
- Supports optional filters for both backends

#### Simple Usage (no filters):

```ts
// src/features/widgets/api/useWidgets.ts
import { endpoints } from "@/core/api/endpoints";
import { createDataTableHook } from "@/shared/hooks/createDataTableHook";
import { type Widget } from "../types";

export const useWidgets = createDataTableHook<Widget>(
  "widgets",
  endpoints.widgets.list
);
```

#### With Server-Side Filters (ASP.NET):

```ts
// src/features/products/api/useProducts.ts
import { endpoints } from "@/core/api/endpoints";
import { createDataTableHook } from "@/shared/hooks/createDataTableHook";
import { type Product, type ProductFilters } from "../types";

// Filters will be sent as query params to ASP.NET for server-side filtering
export const useProducts = createDataTableHook<Product, ProductFilters>(
  "products",
  endpoints.products.list,
  {
    filters: { status: "active" }, // Default filters
  }
);

// Usage in component: useProducts({ category: "electronics" })
```

#### With Client-Side Filtering (Laravel):

```ts
// src/features/orders/api/useOrders.ts
import { endpoints } from "@/core/api/endpoints";
import { createDataTableHook } from "@/shared/hooks/createDataTableHook";
import { type Order, type OrderFilters } from "../types";

// For Laravel: custom filter function processes items client-side
export const useOrders = createDataTableHook<Order, OrderFilters>(
  "orders",
  endpoints.orders.list,
  {
    clientFilter: (items, filters) => {
      if (!filters?.search) return items;
      return items.filter((item) =>
        item.customerName.toLowerCase().includes(filters.search.toLowerCase())
      );
    },
  }
);

// Usage in component: useOrders({ search: "john" })
```

**Query Type Example** (optional, only if you need filters):

```ts
// src/features/widgets/types.ts
export type WidgetFilters = {
  search?: string;
  status?: string;
  // NO page, pageSize, PageNumber, or PageSize - these are handled automatically
};
```

**Important Notes:**

- For ASP.NET: Filters are automatically sent as query params to the server
- For Laravel: Use `clientFilter` option to process filters on the client side
- Always use the factory for new features - it eliminates boilerplate and ensures consistency

## 4) Dialog components (optimized pattern)

**GenericActionDialog** now handles field config generation internally. Just pass `namespace` and `fieldsDefinition`:

```tsx
// src/features/widgets/pages/WidgetsListPage.tsx
import { GenericActionDialog } from "@/shared/components/dialogs/GenericActionDialog";
import { useDialogState } from "@/shared/hooks/useDialogState";
import { createWidgetFormSchema } from "../schemas/widget.schema";
import { widgetFieldsDefinition } from "../config/dialogConfig";
import { useCreateWidget } from "../api/useWidgets";

export const WidgetsListPage = () => {
  const { t } = useTranslation("widgets");
  const createDialog = useDialogState();
  
  const createWidgetMutation = useCreateWidget({
    onSuccess: () => {
      toast.success(t("dialogs.create.success"));
      createDialog.close();
    },
    onError: () => toast.error("Failed to create widget"),
  });

  return (
    <>
      <Button onClick={() => createDialog.open()}>
        {t("actions.add")}
      </Button>
      
      {/* Simplified dialog usage - no useDialogConfig call needed! */}
      <GenericActionDialog
        schema={createWidgetFormSchema(t)}
        open={createDialog.isOpen}
        onOpenChange={createDialog.setOpen}
        onSubmit={async (values) => {
          await createWidgetMutation.mutateAsync(values);
        }}
        titleKey="widgets:dialogs.create.title"
        description={t("dialogs.create.description")}
        namespace="widgets"  {/* Config generated internally */}
        fieldsDefinition={widgetFieldsDefinition}  {/* From dialogConfig.ts */}
      />
    </>
  );
};
```

**Key improvements:**
- ❌ No `useDialogConfig` call in component
- ❌ No manual `fieldConfig` generation
- ✅ Pass `namespace` + `fieldsDefinition` directly
- ✅ Dialog handles config generation internally
- ✅ Eliminates 2+ hook calls per page

**Field definition example:**

```ts
// src/features/widgets/config/dialogConfig.ts
import type { WidgetFormData } from "../types";

export const widgetFieldsDefinition: Record<keyof WidgetFormData, unknown> = {
  name: { type: "text", order: 1 },
  description: { type: "textarea", order: 2 },
  status: {
    type: "select",
    order: 3,
    options: ["active", "inactive"],
  },
};
```

## 5) Page component (dashboard-protected example)

Place under `src/features/<feature>/components/`.

### Simple list example:

```tsx
// src/features/widgets/pages/WidgetsPage.tsx
import { useWidgets } from "@/features/widgets/api/useWidgets";

export const WidgetsPage = () => {
  const widgetsQuery = useWidgets();
  if (widgetsQuery.isLoading) return <div>Loading...</div>;
  if (widgetsQuery.error) return <div>Error</div>;

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Widgets</h1>
      <ul className="space-y-1">
        {widgetsQuery.data?.items?.map((w) => (
          <li key={w.id}>{w.name}</li>
        ))}
      </ul>
    </div>
  );
};
```

### DataTable list page (recommended pattern):

**Step 1**: Create data hook (one line with factory):

```tsx
// src/features/widgets/api/useWidgets.ts
import { endpoints } from "@/core/api/endpoints";
import { createDataTableHook } from "@/shared/hooks/createDataTableHook";
import { type Widget } from "../types";

export const useWidgets = createDataTableHook<Widget>(
  "widgets",
  endpoints.widgets.list
);
```

**Step 2**: Define columns in a separate file with filter configuration:

```tsx
// src/features/widgets/components/WidgetsTable.columns.tsx
// Note: Use .ts extension if no JSX is used, .tsx if columns contain JSX
import type { ColumnDef, CellContext } from "@tanstack/react-table";
import type { Widget } from "@/features/widgets/types";
import { dateFilterFn, stringFilterFn } from "@/shared/components/data/filters";

type TFn = (key: string) => string;

export const createWidgetsColumns = (t: TFn): ColumnDef<Widget, unknown>[] => [
  {
    accessorKey: "name",
    enableColumnFilter: true, // Enable text input filter
    header: t("widgets.list.columns.name"),
  },
  {
    accessorKey: "status",
    enableColumnFilter: true,
    header: t("widgets.list.columns.status"),
    meta: {
      filterVariant: "select", // Dropdown filter
      filterOptions: [
        { id: "active", name: t("widgets.status.active") },
        { id: "inactive", name: t("widgets.status.inactive") },
      ],
    },
  },
  {
    accessorKey: "created_at",
    enableColumnFilter: true,
    header: t("widgets.list.columns.createdAt"),
    cell: ({ row }: CellContext<Widget, unknown>) => {
      const date = row.getValue("created_at");
      return date ? new Date(date as string).toLocaleDateString() : "-";
    },
    filterFn: dateFilterFn, // Date range filter
    meta: {
      filterVariant: "date",
    },
  },
];
```

**Step 2**: Create table component using DataTable (zero boilerplate):

```tsx
// src/features/widgets/components/WidgetsTable.tsx
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/shared/components/data-table/DataTable";
import { useWidgets } from "@/features/widgets/api/useWidgets";
import { createWidgetsColumns } from "./WidgetsTable.columns";

export const WidgetsTable = () => {
  const { t } = useTranslation("widgets");
  const widgetsQuery = useWidgets(); // Pagination handled automatically via URL params
  const columns = useMemo(() => createWidgetsColumns(t), [t]);

  return (
    <DataTable
      columns={columns}
      queryResult={widgetsQuery} // Pass query directly - everything extracted automatically
      enableColumnFilters // Enable column-level filtering
      showExport // Enable CSV export with auto-generated filename
    />
  );
};
```

**With Dynamic Filters** (optional):

```tsx
// Example: Products table with category filter
export const ProductsTable = () => {
  const [category, setCategory] = useState<string>();
  const productsQuery = useProducts({ category }); // Filters passed dynamically

  return (
    <div className="space-y-4">
      <select onChange={(e) => setCategory(e.target.value)}>
        <option value="">All Categories</option>
        <option value="electronics">Electronics</option>
        <option value="clothing">Clothing</option>
      </select>
      <DataTable columns={columns} queryResult={productsQuery} />
    </div>
  );
};
```

**DataTable features** (fully automated):

- ✅ **Centralized Pagination**: Automatically manages `page`/`pageSize` in URL params—no manual state
- ✅ **Auto Mode Detection**: Automatically determines `"client"` (Laravel) or `"server"` (ASP.NET) mode based on `backendKind`
- ✅ **Auto Data Extraction**: Pass `queryResult` prop—`items` and `rowCount` extracted automatically
- ✅ **Backend-Aware Filtering**: Automatically sends filters to server (ASP.NET) or processes client-side (Laravel)
- ✅ **No Props Needed**: No `data`, `total`, `page`, `pageSize`, `onPageChange`, `onPageSizeChange`, or `mode` props required
- Automatic column filtering (text input, select dropdown, date range)
- Smart clear filters button (only shows when filters are active)
- CSV export with auto-generated filename from URL path and timestamp
- Full RTL (right-to-left) support with logical CSS properties
- Modern card-based styling with comfortable spacing
- Icon-only toolbar buttons with tooltips for clean UI
- Reusable actions system for row-level operations

**What you DON'T need anymore**:

- ❌ `usePaginationState()` hook
- ❌ `backendKind` import in table components
- ❌ `mode` prop calculation
- ❌ `data={query.data?.items ?? []}` extraction
- ❌ `total={query.data?.rowCount}` extraction
- ❌ Manual `page`, `pageSize`, `onPageChange`, `onPageSizeChange` props

**Step 3 (Optional)**: Add row actions:

```tsx
// Add to WidgetsTable.tsx imports
import { Eye, Pencil, Trash2 } from "lucide-react";
import {
  DataTable,
  type DataTableAction,
} from "@/shared/components/data-table/DataTable";
import type { Widget } from "@/features/widgets/types";

// Inside WidgetsTable component
export const WidgetsTable = () => {
  const { t } = useTranslation("widgets");
  const { t: tCommon } = useTranslation("common");
  const widgetsQuery = useWidgets();
  const columns = useMemo(() => createWidgetsColumns(t), [t]);

  // Define actions using common namespace for labels
  const actions: DataTableAction<Widget>[] = useMemo(
    () => [
      {
        icon: Eye,
        label: tCommon("actions.view"),
        onClick: (widget) => console.log("View widget:", widget),
      },
      {
        icon: Pencil,
        label: tCommon("actions.edit"),
        onClick: (widget) => console.log("Edit widget:", widget),
      },
      {
        icon: Trash2,
        label: tCommon("actions.delete"),
        onClick: (widget) => console.log("Delete widget:", widget),
        variant: "destructive", // Red styling for delete actions
      },
    ],
    [tCommon]
  );

  return (
    <DataTable
      columns={columns}
      queryResult={widgetsQuery}
      enableColumnFilters
      showExport
      actions={actions} // Pass actions array
    />
  );
};
```

**Actions system**:

- Import `DataTableAction` type and Lucide icons
- Each action needs: `icon`, `label` (translated string), `onClick` (handler function)
- Optional `variant: "destructive"` for delete-style actions (red text)
- Actions render as icon buttons with tooltips in a dedicated column
- Common icons: `Eye` (view), `Pencil` (edit), `Trash2` (delete), `Copy`, `Download`
- **Important**: Action labels should use the `common` namespace (e.g., `tCommon("actions.view")`) for consistency across the app

**Filter variants**:

- `"input"` (default) - Text search filter
- `"select"` - Dropdown filter with options (requires `meta.filterOptions`)
- `"date"` - Date range picker (requires `filterFn: dateFilterFn`)

**Available filter functions** (`src/shared/components/data/filters.ts`):

- `stringFilterFn` - Case-insensitive text search
- `exactFilterFn` - Exact value matching
- `dateFilterFn` - Date range filtering with date-fns

**Custom filter functions for select dropdowns**:

When using select filters with custom logic (e.g., filtering roles that can be string or array), create a custom `FilterFn`:

```tsx
import type { FilterFn } from "@tanstack/react-table";

const rolesFilterFn: FilterFn<User> = (row, _columnId, filterValue) => {
  const user = row.original;
  const selectedRole = filterValue as string;

  // Handle single role string
  if (user.role) {
    return user.role.toLowerCase() === selectedRole.toLowerCase();
  }

  // Handle roles array
  if (user.roles && user.roles.length > 0) {
    return user.roles.some(role =>
      role.name.toLowerCase() === selectedRole.toLowerCase()
    );
  }

  return false;
};

// In column definition:
{
  id: "roles",
  accessorFn: (row) => {
    // Provide accessor for filtering to work
    if (row.roles && row.roles.length > 0) {
      return row.roles.map(role => role.name).join(", ");
    }
    return row.role || "";
  },
  enableColumnFilter: true,
  header: t("list.columns.roles"),
  cell: ({ row }) => {
    const user = row.original;
    if (user.roles && user.roles.length > 0) {
      return user.roles.map(role => role.name).join(", ");
    }
    return user.role || "-";
  },
  filterFn: rolesFilterFn,
  meta: {
    filterVariant: "select",
    filterOptions: [
      { id: "Admin", name: "Admin" },
      { id: "User", name: "User" },
    ],
  },
}
```

**Important**: For columns with `id` instead of `accessorKey`, you **must** provide an `accessorFn` for filtering to work properly. TanStack Table's `getCanFilter()` requires an accessor to enable filtering.

**DataTable props** (simplified):

Required props:

- `columns` - Column definitions with filter configuration
- `queryResult` - Query result from `useDataTableQuery` hook (contains data, total, loading state)

Optional props:

- `enableColumnFilters` - Enable column filtering UI (defaults to `false`)
- `showExport` - Show CSV export button (defaults to `false`)
- `exportFileName` - Optional custom export filename (auto-generated from URL if not provided)
- `emptyMessage` - Custom empty state message
- `onRowClick` - Optional row click handler
- `className` - Additional CSS classes
- `actions` - Optional array of action definitions for row-level operations

**REMOVED props** (now handled automatically):

- ❌ `data` - Extracted from `queryResult.data.items`
- ❌ `total` - Extracted from `queryResult.data.rowCount`
- ❌ `page` - Managed in URL params
- ❌ `pageSize` - Managed in URL params
- ❌ `onPageChange` - Handled internally
- ❌ `onPageSizeChange` - Handled internally
- ❌ `mode` - Auto-detected based on `backendKind`

**Column configuration**:

- `enableColumnFilter: true/false` - Enable/disable filter for column (defaults to true when `enableColumnFilters` is true on DataTable)
- `meta.filterVariant` - Type of filter widget (`"input"`, `"select"`, `"date"`)
- `meta.filterOptions` - Options for select dropdown: `Array<{ id: string | number; name: string }>`
- `filterFn` - Custom filter function for complex filtering (e.g., `dateFilterFn`, `rolesFilterFn`)
- `accessorKey` - Direct property access (enables automatic filtering)
- `accessorFn` - Custom accessor function (use for computed/nested values, required for filtering columns with `id` only)
- `size` - Optional column width (e.g., `120` for actions column)
- `header` - Column header (use translation keys, e.g., `t("list.columns.name")`)
- `cell` - Custom cell renderer function

## 5) Wire the route (TanStack Router)

Edit `src/app/router/routeTree.ts`; add under `/dashboard` to inherit `DashboardLayout` + auth guard.

```ts
import { WidgetsPage } from "@/features/widgets/pages/WidgetsPage";

const widgetsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "widgets",
  component: WidgetsPage,
});

const routeTree = rootRoute.addChildren([
  rootIndexRoute,
  loginRoute,
  dashboardRoute.addChildren([
    dashboardIndexRoute,
    usersRoute,
    rolesRoute,
    widgetsRoute, // new
  ]),
  notFoundRoute,
]);
```

## 6) Backend validation notes (ASP.NET + Laravel)

- Parse ASP.NET envelopes/paged via `aspNetEnvelopeSchema`, `aspNetPagedResultSchema` in `src/core/schemas/endpoints.schema.ts`; auth-specific ASP.NET/Laravel login/refresh schemas are in `src/features/auth/schemas/auth.schema.ts`.
- Parse Laravel data tables via `laravelDataTableSchema`; normalization to `PagedResult` already lives in `apiFetch`.
- Add any non-auth backend-specific shapes to `src/core/schemas/endpoints.schema.ts`; keep auth-specific schemas/types/endpoints under `src/features/auth/` (see Section 10).

## 7) Things to avoid

- No ad-hoc Zod schemas inside components or API hooks.
- No new fetch/axios wrappers; always use `apiFetch` + `useApiQuery`/`useApiMutation`.
- Keep error message strings as translation keys (e.g., `validation.email.required`).
- Don't use directional properties (left/right, ml/mr, pl/pr) - always use logical properties (start/end, ms/me, ps/pe) for RTL support.
- For columns with `id` instead of `accessorKey`, always provide `accessorFn` for filtering to work.
- Don't use numeric IDs in select filter options when filtering by name - use the name as both `id` and `name` for consistency.
- Don't define actions column manually in column definitions - use the `actions` prop on DataTable for consistency and reusability.
- **Don't add pagination fields to query types** - `page`, `pageSize`, `PageNumber`, `PageSize` are handled automatically by `useDataTableQuery`.
- **Don't import `usePaginationState`** - This hook has been removed; pagination is now fully automated.
- **Don't pass `mode` prop to DataTable** - Mode is auto-detected based on `backendKind`.
- **Don't manually extract data/total from query** - Use `queryResult` prop on DataTable for automatic extraction.

## 8) Quick Start: Adding a New Paginated List Feature

**⚠️ CRITICAL FIRST STEP: Always ask for an example API response if not provided!**

Before creating any files, ask:

```
Can you provide an example JSON response from your API endpoint?
For example, what does a single item look like with all its fields and their data types?

Example:
{
  "id": 1,
  "name": "Sample Item",
  "email": "user@example.com",
  "created_at": "2025-12-05T10:00:00Z",
  ...
}
```

This ensures accurate schema generation and prevents rework.

---

**Complete Example**: Adding a "Users" feature (following the existing users implementation).

### Step 1: Create Zod Schema (Based on API Response)

```ts
// src/features/users/schemas/user.schema.ts
import { z } from "zod";

/**
 * User schema from backend API
 * Match the exact structure from the API response
 */
export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  email_verified_at: z.string().nullable(),
  phone_no: z.string(),
  approved: z.number().int().min(0).max(1), // 0 or 1 (boolean as integer)
  created_at: z.string(), // ISO date string
  updated_at: z.string(), // ISO date string
  role: z.string(),
});

/**
 * User form schema for create/edit
 * Error messages MUST be translation keys (never hardcoded strings)
 */
export const createUserFormSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(2, t("validation.nameMinLength")),
    email: z.string().email(t("validation.invalidEmail")),
    phone_no: z
      .string()
      .min(10, t("validation.phoneMinLength"))
      .max(15, t("validation.phoneMaxLength")),
    role: z.string().min(1, t("validation.roleRequired")),
    approved: z.boolean().default(true),
  });

/**
 * User update schema (all fields optional except id)
 */
export const createUserUpdateSchema = (t: (key: string) => string) =>
  z.object({
    id: z.number(),
    name: z.string().min(2, t("validation.nameMinLength")).optional(),
    email: z.string().email(t("validation.invalidEmail")).optional(),
    phone_no: z
      .string()
      .min(10, t("validation.phoneMinLength"))
      .max(15, t("validation.phoneMaxLength"))
      .optional(),
    role: z.string().optional(),
    approved: z.number().int().min(0).max(1).optional(),
  });

export type User = z.infer<typeof userSchema>;
export type UserFormData = z.infer<ReturnType<typeof createUserFormSchema>>;
export type UserUpdateData = z.infer<ReturnType<typeof createUserUpdateSchema>>;
```

### Step 2: Create Types File (Re-export from Schema)

```ts
// src/features/users/types.ts
// Export types from schema for consistency
export type { User, UserFormData, UserUpdateData } from "./schemas/user.schema";
```

### Step 3: Add API Endpoint

```ts
// src/core/api/endpoints.ts
import { type User } from "@/features/users/types";

export const endpoints = {
  // ... existing endpoints
  users: {
    list: {
      path: "/Users/ListUsers", // ASP.NET format, or "/users" for Laravel
      method: "GET",
      requiresAuth: true,
    } as EndpointDef<
      Record<string, unknown> | undefined,
      AspNetEnvelope<AspNetPagedResult<User>> | LaravelDataTableResponse<User>
    >,
  },
};
```

### Step 4: Create Data Hook (One Line with Factory!)

```ts
// src/features/users/api/useUsers.ts
import { endpoints } from "@/core/api/endpoints";
import { createDataTableHook } from "@/shared/hooks/createDataTableHook";
import { type User } from "../types";

// Simple version - no filters needed
export const useUsers = createDataTableHook<User>(
  "users",
  endpoints.users.list
);
```

### Step 5: Define Table Columns

```tsx
// src/features/users/components/UsersTable.columns.tsx
import type { ColumnDef } from "@tanstack/react-table";
import type { User } from "../types";

type TFn = (key: string) => string;

export const createUsersColumns = (t: TFn): ColumnDef<User>[] => [
  {
    accessorKey: "name",
    header: t("list.columns.name"),
    enableColumnFilter: true,
  },
  {
    accessorKey: "email",
    header: t("list.columns.email"),
    enableColumnFilter: true,
  },
  {
    accessorKey: "phone_no",
    header: t("list.columns.phone"),
    enableColumnFilter: true,
  },
  {
    accessorKey: "role",
    header: t("list.columns.roles"),
    enableColumnFilter: true,
  },
  {
    accessorKey: "created_at",
    header: t("list.columns.createdAt"),
    cell: ({ row }) => {
      const date = row.getValue("created_at");
      return date ? new Date(date as string).toLocaleDateString() : "-";
    },
  },
];
```

### Step 6: Create Table Component

```tsx
// src/features/users/components/UsersTable.tsx
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Eye, Pencil, Trash2 } from "lucide-react";
import {
  DataTable,
  type DataTableAction,
} from "@/shared/components/data-table/DataTable";
import { useUsers } from "../api/useUsers";
import { createUsersColumns } from "./UsersTable.columns";
import type { User } from "../types";

export const UsersTable = () => {
  const { t } = useTranslation("users");
  const { t: tCommon } = useTranslation("common");
  const usersQuery = useUsers();
  const columns = useMemo(() => createUsersColumns(t), [t]);

  const actions: DataTableAction<User>[] = useMemo(
    () => [
      {
        icon: Eye,
        label: tCommon("actions.view"),
        onClick: (user) => console.log("View user:", user),
      },
      {
        icon: Pencil,
        label: tCommon("actions.edit"),
        onClick: (user) => console.log("Edit user:", user),
      },
      {
        icon: Trash2,
        label: tCommon("actions.delete"),
        onClick: (user) => console.log("Delete user:", user),
        variant: "destructive",
      },
    ],
    [tCommon]
  );

  return (
    <DataTable
      columns={columns}
      queryResult={usersQuery}
      enableColumnFilters
      showExport
      actions={actions}
    />
  );
};
```

### Step 7: Create Page Component

```tsx
// src/features/users/pages/UsersListPage.tsx
import { UsersTable } from "../components/UsersTable";
import { Button } from "@/shared/components/ui/button";
import { UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";

export const UsersListPage = () => {
  const { t } = useTranslation("users");
  const { t: tCommon } = useTranslation("common");

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {t("list.title")}
          </h1>
          <p className="text-muted-foreground">{t("list.description")}</p>
        </div>
        <Button size="default" className="gap-2">
          <UserPlus className="h-4 w-4" />
          {tCommon("actions.add")}
        </Button>
      </div>

      {/* Data Table */}
      <UsersTable />
    </div>
  );
};
```

### Step 8: Wire Up Route

```ts
// src/app/router/routeTree.ts
import { UsersListPage } from "@/features/users/pages/UsersListPage";

const usersRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "users",
  component: UsersListPage,
});

// Add to route tree
dashboardRoute.addChildren([
  dashboardIndexRoute,
  usersRoute, // Add here
  statisticsRoute,
]);
```

### Step 9: Add Navigation Item

```ts
// src/shared/config/navigation.ts
import { Users } from "lucide-react";

export const mainNavItems = [
  // ... existing items
  {
    label: "users",
    href: "/dashboard/users",
    icon: Users,
  },
];
```

### Step 10: Add Translations (English)

```json
// src/locales/en/users.json
{
  "list": {
    "title": "Users",
    "description": "Manage system users and their access.",
    "columns": {
      "name": "Name",
      "email": "Email",
      "phone": "Phone",
      "status": "Status",
      "roles": "Roles",
      "createdAt": "Created at",
      "actions": "Actions"
    },
    "filters": {
      "searchPlaceholder": "Search by name or email",
      "status": {
        "label": "Status",
        "all": "All",
        "active": "Active",
        "inactive": "Inactive"
      }
    }
  },
  "validation": {
    "nameMinLength": "Name must be at least 2 characters",
    "invalidEmail": "Invalid email address",
    "phoneMinLength": "Phone number must be at least 10 digits",
    "phoneMaxLength": "Phone number must be at most 15 digits",
    "roleRequired": "Role is required"
  }
}
```

### Step 11: Add Translations (Arabic)

```json
// src/locales/ar/users.json
{
  "list": {
    "title": "المستخدمين",
    "description": "إدارة مستخدمي النظام وصلاحياتهم.",
    "columns": {
      "name": "الاسم",
      "email": "البريد الإلكتروني",
      "phone": "رقم الهاتف",
      "status": "الحالة",
      "roles": "الأدوار",
      "createdAt": "تاريخ الإنشاء",
      "actions": "الإجراءات"
    },
    "filters": {
      "searchPlaceholder": "ابحث بالاسم أو البريد الإلكتروني",
      "status": {
        "label": "الحالة",
        "all": "الكل",
        "active": "نشط",
        "inactive": "غير نشط"
      }
    }
  },
  "validation": {
    "nameMinLength": "يجب أن يكون الاسم حرفين على الأقل",
    "invalidEmail": "عنوان البريد الإلكتروني غير صالح",
    "phoneMinLength": "يجب أن يكون رقم الهاتف 10 أرقام على الأقل",
    "phoneMaxLength": "يجب أن لا يزيد رقم الهاتف عن 15 رقماً",
    "roleRequired": "الدور مطلوب"
  }
}
```

---

**✅ You now have a fully functional paginated list with:**

- ✅ URL-based pagination (shareable links, browser back/forward)
- ✅ Automatic backend detection (Laravel/ASP.NET)
- ✅ Type-safe Zod schemas with translated validation
- ✅ Column filtering
- ✅ CSV export
- ✅ Row actions (view, edit, delete)
- ✅ RTL support
- ✅ Fully translated interface (English + Arabic)
- ✅ Zero boilerplate with automated data handling
- ✅ Professional layout with header and description

**🎯 Key Patterns to Follow:**

1. **Always ask for API response example first**
2. **Schema first** - Create Zod schema matching exact API structure
3. **Use factory** - `createDataTableHook` for automatic pagination
4. **Translation keys only** - Never hardcode text, always use `t("key")`
5. **Re-export types** - types.ts re-exports from schema
6. **Consistent structure** - Follow users feature as reference

**📁 File Structure Created:**

```
src/features/users/
├── api/
│   └── useUsers.ts (1 line with factory!)
├── components/
│   ├── UsersTable.tsx
│   └── UsersTable.columns.tsx
├── pages/
│   └── UsersListPage.tsx
├── schemas/
│   └── user.schema.ts (Zod schemas + types)
└── types.ts (re-exports from schema)
```

```ts
// src/features/products/types.ts
export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  status: "active" | "inactive";
  createdAt: string;
};

export type ProductFilters = {
  search?: string;
  category?: string;
  status?: string;
};
```

### Step 2: Add API Endpoint

```ts
// src/core/api/endpoints.ts
export const endpoints = {
  // ... existing endpoints
  products: {
    list: {
      path: "/Products/List",
      method: "GET",
      requiresAuth: true,
    } as EndpointDef<
      Record<string, unknown> | undefined,
      | AspNetEnvelope<AspNetPagedResult<Product>>
      | LaravelDataTableResponse<Product>
    >,
  },
};
```

### Step 3: Create Data Hook (One Line!)

```ts
// src/features/products/api/useProducts.ts
import { endpoints } from "@/core/api/endpoints";
import { createDataTableHook } from "@/shared/hooks/createDataTableHook";
import { type Product, type ProductFilters } from "../types";

// For ASP.NET (server-side filtering):
export const useProducts = createDataTableHook<Product, ProductFilters>(
  "products",
  endpoints.products.list
);

// For Laravel (client-side filtering):
export const useProducts = createDataTableHook<Product, ProductFilters>(
  "products",
  endpoints.products.list,
  {
    clientFilter: (items, filters) => {
      let filtered = items;

      if (filters?.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter((item) =>
          item.name.toLowerCase().includes(search)
        );
      }

      if (filters?.category) {
        filtered = filtered.filter(
          (item) => item.category === filters.category
        );
      }

      if (filters?.status) {
        filtered = filtered.filter((item) => item.status === filters.status);
      }

      return filtered;
    },
  }
);
```

### Step 4: Define Table Columns

```tsx
// src/features/products/components/ProductsTable.columns.tsx
import type { ColumnDef } from "@tanstack/react-table";
import type { Product } from "../types";

type TFn = (key: string) => string;

export const createProductsColumns = (t: TFn): ColumnDef<Product>[] => [
  {
    accessorKey: "name",
    header: t("products.columns.name"),
    enableColumnFilter: true,
  },
  {
    accessorKey: "category",
    header: t("products.columns.category"),
    enableColumnFilter: true,
    meta: {
      filterVariant: "select",
      filterOptions: [
        { id: "electronics", name: t("products.categories.electronics") },
        { id: "clothing", name: t("products.categories.clothing") },
      ],
    },
  },
  {
    accessorKey: "price",
    header: t("products.columns.price"),
    cell: ({ row }) => `$${row.getValue("price")}`,
  },
  {
    accessorKey: "status",
    header: t("products.columns.status"),
    enableColumnFilter: true,
    meta: {
      filterVariant: "select",
      filterOptions: [
        { id: "active", name: t("common.status.active") },
        { id: "inactive", name: t("common.status.inactive") },
      ],
    },
  },
];
```

### Step 5: Create Table Component (Zero Boilerplate!)

```tsx
// src/features/products/components/ProductsTable.tsx
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/shared/components/data-table/DataTable";
import { useProducts } from "../api/useProducts";
import { createProductsColumns } from "./ProductsTable.columns";

export const ProductsTable = () => {
  const { t } = useTranslation("products");
  const [filters, setFilters] = useState<{ category?: string }>();

  // Pass filters dynamically - automatic backend handling!
  const productsQuery = useProducts(filters);
  const columns = useMemo(() => createProductsColumns(t), [t]);

  return (
    <div className="space-y-4">
      {/* Optional: Custom filter UI */}
      <select
        onChange={(e) => setFilters({ category: e.target.value || undefined })}
      >
        <option value="">All Categories</option>
        <option value="electronics">Electronics</option>
        <option value="clothing">Clothing</option>
      </select>

      {/* DataTable handles everything else automatically */}
      <DataTable
        columns={columns}
        queryResult={productsQuery} // Auto-extracts data, total, handles pagination
        enableColumnFilters // Column-level filtering
        showExport // CSV export
      />
    </div>
  );
};
```

### Step 6: Create Page Component

```tsx
// src/features/products/pages/ProductsListPage.tsx
import { ProductsTable } from "../components/ProductsTable";

export const ProductsListPage = () => {
  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">Products</h1>
      <ProductsTable />
    </div>
  );
};
```

### Step 7: Wire Up Route

```ts
// src/app/router/routeTree.ts
import { ProductsListPage } from "@/features/products/pages/ProductsListPage";

const productsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "products",
  component: ProductsListPage,
});

// Add to route tree
dashboardRoute.addChildren([
  dashboardIndexRoute,
  usersRoute,
  productsRoute, // New!
]);
```

### Step 8: Add Navigation Item

```ts
// src/shared/config/navigation.ts
import { Package } from "lucide-react";

export const mainNavItems = [
  // ... existing items
  {
    label: "products",
    href: "/dashboard/products",
    icon: Package,
  },
];
```

### Step 9: Add Translations

```json
// src/locales/en/products.json
{
  "columns": {
    "name": "Product Name",
    "category": "Category",
    "price": "Price",
    "status": "Status"
  },
  "categories": {
    "electronics": "Electronics",
    "clothing": "Clothing"
  }
}
```

**That's it!** You now have a fully functional paginated table with:

- ✅ URL-based pagination (shareable links, browser back/forward)
- ✅ Automatic backend detection (Laravel/ASP.NET)
- ✅ Server-side or client-side filtering based on backend
- ✅ Column filtering
- ✅ CSV export
- ✅ RTL support
- ✅ Zero boilerplate

## 8.1) Using Generic Dialogs for Create/Edit Forms

**Generic dialogs automatically generate form fields from your Zod schemas** - no need to manually create form inputs!

### Quick Example: Add User Dialog

```tsx
// src/features/users/components/UsersTable.tsx
import { useState } from "react";
import { GenericCreateDialog } from "@/shared/components/dialogs/GenericCreateDialog";
import { createUserFormSchema } from "../schemas/user.schema";
import { useTranslation } from "react-i18next";

export const UsersTable = () => {
  const { t } = useTranslation("users");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleCreateUser = async (values: UserFormData) => {
    // Call your API
    await createUserMutation.mutateAsync(values);
  };

  return (
    <>
      <Button onClick={() => setCreateDialogOpen(true)}>
        <UserPlus className="h-4 w-4 mr-2" />
        {t("actions.add")}
      </Button>

      <GenericCreateDialog
        schema={createUserFormSchema(t)}
        titleKey="users.dialogs.create.title"
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateUser}
        fieldConfig={{
          name: {
            label: t("form.name.label"),
            placeholder: t("form.name.placeholder"),
            order: 1,
          },
          email: {
            label: t("form.email.label"),
            placeholder: t("form.email.placeholder"),
            type: "email",
            order: 2,
          },
          phone_no: {
            label: t("form.phone.label"),
            placeholder: t("form.phone.placeholder"),
            order: 3,
          },
          role: {
            label: t("form.role.label"),
            type: "select",
            options: [
              { value: "admin", label: t("roles.admin") },
              { value: "manager", label: t("roles.manager") },
              { value: "user", label: t("roles.user") },
            ],
            order: 4,
          },
          approved: {
            label: t("form.approved.label"),
            type: "checkbox",
            order: 5,
          },
        }}
      />
    </>
  );
};
```

### Field Type Auto-Detection

The dialog automatically infers field types from your Zod schema:

```ts
z.string() → text input
z.string().email() → email input  
z.number() → number input
z.boolean() → checkbox
z.date() → date input
z.enum(["a", "b"]) → select dropdown (auto-generates options!)
```

You can override with `fieldConfig`:

```ts
fieldConfig={{
  description: {
    type: "textarea", // Override z.string() to textarea
  },
  password: {
    type: "password", // Override z.string() to password input
  }
}}
```

### Field Configuration Options

```ts
type FieldConfig = {
  label?: string;          // Field label (use translation key)
  placeholder?: string;    // Placeholder text
  type?: "text" | "email" | "password" | "number" | "textarea" | "select" | "checkbox" | "date";
  hidden?: boolean;        // Hide field completely
  options?: Array<{        // For select fields
    value: string | number;
    label: string;
  }>;
  order?: number;          // Control field order (lower = first)
};
```

### Edit Dialog Example

```tsx
import { GenericEditDialog } from "@/shared/components/dialogs/GenericEditDialog";
import { createUserUpdateSchema } from "../schemas/user.schema";

const handleEditUser = async (values: UserUpdateData) => {
  await updateUserMutation.mutateAsync(values);
};

<GenericEditDialog
  schema={createUserUpdateSchema(t)}
  initialValues={selectedUser} // Pre-populate form
  titleKey="users.dialogs.edit.title"
  open={editDialogOpen}
  onOpenChange={setEditDialogOpen}
  onSubmit={handleEditUser}
  fieldConfig={{
    // Same as create dialog
  }}
/>
```

### Advanced: Custom Trigger

```tsx
<GenericCreateDialog
  schema={schema}
  titleKey="..."
  onSubmit={handleSubmit}
  trigger={
    <Button variant="outline">
      <Plus className="h-4 w-4 mr-2" />
      Custom Trigger
    </Button>
  }
  fieldConfig={...}
/>
```

### Key Features

✅ **Auto Field Generation** - Fields created automatically from Zod schema  
✅ **Type Inference** - Automatically detects input types (email, number, etc.)  
✅ **Enum Support** - Auto-generates select options from `z.enum()`  
✅ **Real-time Validation** - Validates on change and on submit  
✅ **Translation Support** - All labels and errors use translation keys  
✅ **Field Ordering** - Control field order with `order` property  
✅ **Flexible Customization** - Override any field type or config  
✅ **RTL Support** - Proper right-to-left layout for Arabic  
✅ **Animations** - Smooth fade/zoom animations from shadcn  
✅ **Accessibility** - Full keyboard navigation and ARIA labels

### Translation Structure

```json
// src/locales/en/users.json
{
  "dialogs": {
    "create": {
      "title": "Create New User",
      "description": "Add a new user to the system."
    },
    "edit": {
      "title": "Edit User",
      "description": "Update user information."
    }
  },
  "form": {
    "name": {
      "label": "Name",
      "placeholder": "Enter user's name"
    },
    "email": {
      "label": "Email",
      "placeholder": "user@example.com"
    },
    "phone": {
      "label": "Phone Number",
      "placeholder": "+1234567890"
    },
    "role": {
      "label": "Role"
    },
    "approved": {
      "label": "Account approved"
    }
  },
  "roles": {
    "admin": "Administrator",
    "manager": "Manager",
    "user": "User"
  }
}
```

### Best Practices

1. **Use Schema Factory Functions** - Always pass `t` function to schema factory:
   ```ts
   createUserFormSchema(t) // ✅ Good
   userFormSchema          // ❌ Bad - no translations
   ```

2. **Leverage Auto-Detection** - Let the dialog infer field types from schema, only override when needed

3. **Order Fields** - Use `order` property for better UX:
   ```ts
   { name: { order: 1 }, email: { order: 2 }, ... }
   ```

4. **Hide Unnecessary Fields** - Use `hidden: true` for fields like `id`:
   ```ts
   { id: { hidden: true } }
   ```

5. **Enum Auto-Options** - For `z.enum()`, no need to manually specify options - they're auto-generated!

6. **Consistent Translations** - Keep translation keys consistent across features:
   - `[feature].dialogs.create.title`
   - `[feature].dialogs.edit.title`
   - `[feature].form.[field].label`

## 9) i18n translations when adding data/columns

- Translations now use **JSON format** with Intlayer integration. Add to `src/locales/en/<namespace>.json` and `src/locales/ar/<namespace>.json`.
- **Option 1: Direct JSON editing** - Edit JSON files directly for quick updates.
- **Option 2: Intlayer content declarations** - Create `*.content.ts` files for type-safe translations, then run `pnpm intlayer:build` to sync to JSON.
- Keep keys stable and reuse existing namespaces where possible (e.g., `users`, `roles`, `common`).
- Use translation keys in UI/components, not hard-coded text: `t("users.list.columns.name")`, `t("common.actions.edit")`, etc.
- If given example data/fields, create a `columns` translation group:
  - `src/locales/en/users.json`: `"list": { "columns": { "name": "Name", "email": "Email", "role": "Role" } }`
  - `src/locales/ar/users.json`: mirror keys with Arabic labels.
- For new statuses/enums, add keys under a clear namespace: `"status": { "active": "Active", "inactive": "Inactive" }`.
- After adding new namespaces, register them in `src/core/i18n/i18n.ts` resources object.

## 9) Columns/types when provided sample data

- Define row types in `src/features/<feature>/types.ts` (e.g., `export type Widget = { id: string; name: string; status: "active" | "inactive"; };`).
- Keep Zod schemas in `src/core/schemas/endpoints.schema.ts` (backend shape, non-auth) and `src/features/<feature>/schemas/<feature>.schema.ts` (form/client validation).
- Define table columns in a dedicated file next to the table or page (e.g., `src/features/<feature>/components/<Feature>Table.columns.tsx`) if shared; otherwise keep them local but non-exported if only used once.
- Columns should use translation keys for headers and derived display (e.g., `accessorKey: "name", header: t("users.table.name")`).
- When mapping sample data, normalize within hooks or selectors, not inside the component render. Keep columns purely presentational.
- For lint compliance (`react-refresh/only-export-components`), keep column factories in `.ts`/`.tsx` files exporting pure functions (e.g., `createUsersColumns(t)`) and call them inside components via `useMemo`.

## 10) Auth-specific locations

- Auth schemas: `src/features/auth/schemas/auth.schema.ts` (forms, ASP.NET/Laravel login/refresh envelopes).
- Auth types: `src/features/auth/types/auth.types.ts` (re-exported from `src/features/auth/types.ts`).
- Auth endpoints: `src/features/auth/api/auth.endpoints.ts` (consumed by `src/core/api/endpoints.ts`).
- Canonical behavior: follow `docs/change-server-instructions.md` for token fields, `/me` normalization, and header identity rules; auth store is the only source for user/pos/permissions/fees. No next-auth/ensureMe/getStoredMe, and no `/me` fetch inside header components.
- Auth components/hooks should import schemas/types/endpoints from these feature-scoped files; non-auth schemas stay in `src/core/schemas/endpoints.schema.ts`.

## 11) Dashboard layout & navigation (shadcn dashboard-01)

- shadcn config: `components.json` aliases `components` to `@/shared/components`, `ui` to `@/shared/components/ui`, tailwind css at `src/assets/styles/globals.css`. Run blocks with `npx shadcn@latest add ...` and ensure imports use `@/shared/components/ui/...`.
- Layout: use the dashboard-01 block as the base. Keep the layout wrapper in `src/shared/components/layout/DashboardLayout.tsx`, with extracted `AppSidebar`/`SiteHeader` if needed. Sidebar components live under `@/shared/components/ui/sidebar`.
- Navigation config: centralize links/icons in `src/shared/config/navigation.ts` (e.g., `mainNavItems` with `label`, `href`, `icon`). Sidebar reads from this config so new pages auto-appear.
- Routing: TanStack Router routes under `/dashboard` should import page components (`src/features/<feature>/pages/*Page.tsx`) and render within `DashboardLayout` (via route tree). Paths in `mainNavItems` must match route paths.
- shadcn UI location: all primitives in `src/shared/components/ui`. There should be no `src/components/ui` or imports from `@/components/ui`.
- **Adding new pages**:
  1. Create page component in `src/features/<feature>/pages/`
  2. Add route in `src/app/router/routeTree.ts` under `dashboardRoute`
  3. Add navigation item to `mainNavItems` in `src/shared/config/navigation.ts`
  4. Sidebar will automatically display the new page

## 12) Intlayer integration (i18n management)

- Project uses **Intlayer** with **i18next runtime** for enhanced translation management.
- Translation files are in **JSON format**: `src/locales/{locale}/{namespace}.json`
- Three workflows available:
  - **Direct JSON editing**: Edit `.json` files directly for quick updates
  - **Intlayer content declarations**: Create type-safe `*.content.ts` files, run `pnpm intlayer:build` to sync
  - **AI auto-fill**: Add translations to one locale, run `pnpm intlayer:fill` to auto-translate others (requires `OPENAI_API_KEY` in `.env`)
- **Adding new namespace**:
  1. Create content file: `src/features/<feature>/content/<feature>.content.ts`
  2. Build: `pnpm intlayer:build` (generates JSON files)
  3. Register in `src/core/i18n/i18n.ts` resources object
  4. Use with `useTranslation('<namespace>')`
- **Intlayer scripts**:
  - `pnpm intlayer:build` - Build and sync dictionaries to JSON
  - `pnpm intlayer:fill` - AI auto-fill missing translations (OpenAI)
  - `pnpm intlayer:push` - Push to Intlayer CMS for team collaboration
- See `docs/intlayer-integration.md` for complete guide
