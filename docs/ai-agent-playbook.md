# AI Agent Playbook (tailored to this repo)

Use this checklist to add endpoints, schemas/types, pages, and routes with the patterns used here (React 19 + Vite, TanStack Router/Query/Form, Zod, Tailwind/shadcn, ASP.NET + Laravel backends).

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

## 8) i18n translations when adding data/columns
- Add English strings to `src/locales/en/<namespace>.ts` and Arabic to `src/locales/ar/<namespace>.ts`. Keep keys stable and reuse existing namespaces where possible (e.g., `users`, `roles`, `common`).
- Use translation keys in UI/components, not hard-coded text: `t("users.table.name")`, `t("common.actions.edit")`, etc.
- If given example data/fields, create a `columns` translation group:  
  - `src/locales/en/users.ts`: `table: { name: "Name", email: "Email", role: "Role" }`  
  - `src/locales/ar/users.ts`: mirror keys with Arabic labels.
- For new statuses/enums, add keys under a clear namespace: `status: { active: "Active", inactive: "Inactive" }`.

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
- Auth components/hooks should import schemas/types/endpoints from these feature-scoped files; non-auth schemas stay in `src/core/schemas/endpoints.schema.ts`.

## 11) Dashboard layout & navigation (shadcn dashboard-01)
- shadcn config: `components.json` aliases `components` to `@/shared/components`, `ui` to `@/shared/components/ui`, tailwind css at `src/assets/styles/globals.css`. Run blocks with `npx shadcn@latest add ...` and ensure imports use `@/shared/components/ui/...`.
- Layout: use the dashboard-01 block as the base. Keep the layout wrapper in `src/shared/components/layout/DashboardLayout.tsx`, with extracted `AppSidebar`/`Topbar` if needed. Sidebar components live under `@/shared/components/ui/sidebar`.
- Navigation config: centralize links/icons in `src/shared/config/navigation.ts` (e.g., `mainNavItems` with `label`, `href`, `icon`). Sidebar reads from this config so new pages auto-appear.
- Routing: TanStack Router routes under `/dashboard` should import page components (`src/features/<feature>/pages/*Page.tsx`) and render within `DashboardLayout` (via route tree). Paths in `mainNavItems` must match route paths.
- shadcn UI location: all primitives in `src/shared/components/ui`. There should be no `src/components/ui` or imports from `@/components/ui`.
