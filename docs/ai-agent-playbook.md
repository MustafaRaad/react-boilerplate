# AI Agent Playbook (tailored to this repo)

Use this checklist to add endpoints, schemas/types, pages, and routes with the patterns used here (React 19 + Vite, TanStack Router/Query/Form, Zod, Tailwind/shadcn, ASP.NET + Laravel backends).

## 0) Backend & auth source of truth

- Canonical doc: `docs/change-server-instructions.md`. Read it before touching auth/backend.
- Default backend: Laravel POS.
  - Login `POST /auth/login` body `{ email, password, type: "web" }` → `{ access_token, token_type, expires_in }`.
  - Tokens in store: `accessToken`, `accessTokenType`, `accessTokenExpiresIn`, `accessTokenExpiresAt`.
  - `/auth/me` → `{ fees, pos: { pos_name,pos_lat,pos_lng,id }, user: { id,name,email,phone_no }, perm: string[] }`.
  - Store normalization: user `{ id, name|null, email|null, phoneNo|null, image:null, role:null }`, pos `{ id,name,lat,lng }`, permissions `perm`, fees `fees`.
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

```ts
// src/features/widgets/api/useWidgets.ts
import { apiFetch } from "@/core/api/client";
import { endpoints } from "@/core/api/endpoints";
import { useApiQuery } from "@/core/api/hooks";

export const useWidgets = (query?: { search?: string }) =>
  useApiQuery({
    queryKey: ["widgets", query],
    queryFn: () => apiFetch(endpoints.widgets.list, { query }),
  });
```

## 4) Page component (dashboard-protected example)

Place under `src/features/<feature>/components/`.

### Simple list example:

```tsx
// src/features/widgets/components/WidgetsPage.tsx
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

**Step 1**: Define columns in a separate file with filter configuration:

```tsx
// src/features/widgets/components/WidgetsTable.columns.ts
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

**Step 2**: Create table component using DataTable:

```tsx
// src/features/widgets/components/WidgetsTable.tsx
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { backendKind } from "@/core/config/env";
import { DataTable } from "@/shared/components/data/DataTable";
import { useWidgets } from "@/features/widgets/api/useWidgets";
import { usePaginationState } from "@/shared/hooks/usePaginationState";
import { createWidgetsColumns } from "./WidgetsTable.columns";

export const WidgetsTable = () => {
  const { t } = useTranslation("widgets");
  const { page, setPage, pageSize, setPageSize } = usePaginationState();

  const widgetsQuery = useWidgets({ page, pageSize });
  const columns = useMemo(() => createWidgetsColumns(t), [t]);

  // Use "client" mode for Laravel (client-side filtering/pagination)
  // Use "server" mode for ASP.NET (server-side filtering/pagination)
  const mode = backendKind === "laravel" ? "client" : "server";

  return (
    <DataTable
      columns={columns}
      data={widgetsQuery.data?.items ?? []}
      total={widgetsQuery.data?.rowCount}
      page={page}
      pageSize={pageSize}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      mode={mode}
      enableColumnFilters // Enable column-level filtering
      showExport // Enable CSV export with auto-generated filename
    />
  );
};
```

**DataTable features**:

- Automatic column filtering (text input, select dropdown, date range)
- Smart clear filters button (only shows when filters are active)
- CSV export with auto-generated filename from URL path and timestamp
- Server/client pagination modes
- Full RTL (right-to-left) support with logical CSS properties
- Modern card-based styling with comfortable spacing (bg-card, shadow-md, rounded-lg)
- Icon-only toolbar buttons with tooltips for clean UI

**Filter variants**:

- `"input"` (default) - Text search filter
- `"select"` - Dropdown filter with options (requires `meta.filterOptions`)
- `"date"` - Date range picker (requires `filterFn: dateFilterFn`)

**Available filter functions** (`src/shared/components/data/filters.ts`):

- `stringFilterFn` - Case-insensitive text search
- `exactFilterFn` - Exact value matching
- `dateFilterFn` - Date range filtering with date-fns

**Column configuration**:

- `enableColumnFilter: true/false` - Enable/disable filter for column (defaults to true when `enableColumnFilters` is true on DataTable)
- `meta.filterVariant` - Type of filter widget (`"input"`, `"select"`, `"date"`)
- `meta.filterOptions` - Options for select dropdown: `Array<{ id: string | number; name: string }>`
- `filterFn` - Custom filter function for complex filtering (e.g., `dateFilterFn`, `rolesFilterFn`)
- `accessorKey` - Direct property access (enables automatic filtering)
- `accessorFn` - Custom accessor function (use for computed/nested values, required for filtering columns with `id` only)

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

**DataTable props**:

- `columns` - Column definitions with filter configuration
- `data` - Array of data items
- `total` - Total row count (for server-side pagination)
- `page` - Current page number (1-indexed)
- `pageSize` - Items per page
- `onPageChange` - Page change handler
- `onPageSizeChange` - Page size change handler
- `mode` - `"server"` or `"client"` pagination mode
- `enableColumnFilters` - Enable column filtering UI (defaults to `true`)
- `showExport` - Show CSV export button (defaults to `false`)
- `exportFileName` - Optional custom export filename (auto-generated from URL if not provided)
- `emptyMessage` - Custom empty state message
- `onRowClick` - Optional row click handler
- `className` - Additional CSS classes

- `enableColumnFilter: true/false` - Enable/disable filter for column
- `meta.filterVariant` - Type of filter widget
- `meta.filterOptions` - Options for select dropdown
- `filterFn` - Custom filter function for complex filtering

## 5) Wire the route (TanStack Router)

Edit `src/app/router/routeTree.tsx`; add under `/dashboard` to inherit `DashboardLayout` + auth guard.

```ts
import { WidgetsPage } from "@/features/widgets/components/WidgetsPage";

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

## 8) i18n translations when adding data/columns

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
- Define table columns in a dedicated file next to the table or page (e.g., `src/features/<feature>/components/<Feature>Table.columns.ts`) if shared; otherwise keep them local but non-exported if only used once.
- Columns should use translation keys for headers and derived display (e.g., `accessorKey: "name", header: t("users.table.name")`).
- When mapping sample data, normalize within hooks or selectors, not inside the component render. Keep columns purely presentational.
- For lint compliance (`react-refresh/only-export-components`), keep column factories in `.ts` files exporting pure functions (e.g., `createUsersColumns(t)`) and call them inside components via `useMemo`.

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
