# AI Agent Playbook (tailored to this repo)

Use this checklist to add endpoints, schemas/types, pages, and routes with the patterns used here (React 19 + Vite, TanStack Router/Query/Form, Zod, Tailwind/shadcn, ASP.NET + Laravel backends).

## 1) Add schemas and types
- **Entity type**: define/extend in `src/features/<feature>/types.ts`.
- **Backend Zod schema**: add to `src/core/schemas/endpoints.schema.ts`. Keep envelopes/paged/login/data-table shapes centralized.
- **Form Zod schema**: add to `src/core/schemas/<feature>.schema.ts` (follow `auth.schema.ts`); use translation keys for messages.

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
- Parse ASP.NET envelopes/paged/login via `aspNetEnvelopeSchema`, `aspNetPagedResultSchema`, `aspNetLoginEnvelopeSchema` in `src/core/schemas/endpoints.schema.ts`.
- Parse Laravel data tables via `laravelDataTableSchema`; normalization to `PagedResult` already lives in `apiFetch`.
- Add any backend-specific shapes to `src/core/schemas/endpoints.schema.ts` and reuse them in the client.

## 7) Things to avoid
- No ad-hoc Zod schemas inside components or API hooks.
- No new fetch/axios wrappers; always use `apiFetch` + `useApiQuery`/`useApiMutation`.
- Keep error message strings as translation keys (e.g., `validation.email.required`).
