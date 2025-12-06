# React Boilerplate

Modern admin starter built with React 19, Vite, and TypeScript. Ships with TanStack Router + Query + Form, shadcn UI (dashboard-01), i18n (English/Arabic with RTL), Zustand stores, and an auth/dashboard/users/roles flow that can talk to either an ASP.NET or Laravel backend.

## 📚 Documentation

**For AI Agents & Developers:**

- **[AI Agent Implementation Guide](./docs/AI_AGENT_IMPLEMENTATION_GUIDE.md)** - Complete guide for adding new features
- **[Backend Switching Guide](./docs/BACKEND_SWITCHING_GUIDE.md)** - Laravel ↔ ASP.NET switching instructions

## Requirements

- Node 18+ and pnpm (`corepack enable` or `npm i -g pnpm`)
- API reachable at `VITE_API_BASE_URL`

## Scripts

- `pnpm install` — install deps
- `pnpm dev` — start dev server (http://localhost:5018)
- `pnpm build` — type-check + Vite build to `dist/`
- `pnpm preview` — preview production build
- `pnpm lint` — run ESLint

## Environment

Create `.env` (or copy `.env.example`):

```
VITE_API_BASE_URL=https://your-api/
VITE_BACKEND_KIND=aspnet   # or laravel
```

## Project structure

```
src/
  main.tsx                     Entry; renders <App />
  app/                         App shell
    App.tsx                    Root component
    providers/AppProviders.tsx Router, QueryClient, i18n, toasts, dir observer
    router/
      routeTree.ts             TanStack Router tree and guards
      routeComponents.tsx      Route components (protected wrapper, redirects)
  assets/                      Static assets and styling
    fonts/                     Tajawal font files
    styles/                    fonts.css + globals.css (imports Tailwind layers)
  core/                        Cross-cutting concerns
    api/                       API client + helpers
      client.ts                Fetch wrapper with backend normalization & token refresh
      endpoints.ts             Typed endpoint definitions
      hooks.ts                 useApiQuery/useApiMutation with toast handling
      notifications.ts         Toast helpers
      queryClient.ts           React Query client factory
    config/env.ts              Reads Vite env and exposes backendKind/apiBaseUrl
    i18n/                      i18next setup + resource registration
    types/                     Shared types re-exporting feature auth types
  features/                    Vertical slices
    auth/                      Pages, components, schemas, types, endpoints, hooks
    dashboard/                 Overview cards
    users/                     Users table + data hooks
    roles/                     Roles table + data hooks
  lib/                         Generic utilities (e.g., class helpers)
  locales/                     Translation resources (en, ar) + JSON (Intlayer sync)
  shared/                      Reusable building blocks
    components/
      data/                    DataTable (server/client pagination)
      form/                    FormField helper for TanStack Form
      layout/                  DashboardLayout, AppSidebar, SiteHeader, error/not-found
      ui/                      shadcn UI primitives (button, card, input, sidebar, etc.; includes calendar for date picker)
    config/
      navigation.ts            Centralized nav config (mainNavItems)
    hooks/                     Generic hooks (locale direction, pagination)
```

## Routing

- `/` redirects to `/dashboard` if authenticated, otherwise `/login`.
- `/login` shows the login form.
- `/dashboard` (protected) uses `DashboardLayout` (shadcn dashboard-01) with:
  - `/dashboard/` overview cards
  - `/dashboard/users` users table
  - `/dashboard/roles` roles table
- `*` renders a not-found page.
  Protection is handled by `useAuthGuard`, which redirects unauthenticated users to `/login`.

## Dashboard layout & navigation

- Layout: `DashboardLayout` wraps all dashboard routes with `SidebarProvider`, collapsible sidebar, responsive header.
- Navigation: All nav items live in `src/shared/config/navigation.ts` as `mainNavItems`.
- Sidebar: `AppSidebar` reads `mainNavItems` and highlights active routes.
- Adding pages: create the page + route + nav item; sidebar updates automatically.

## Authentication flow

- Login (`useLogin`) posts credentials to backend-specific login endpoint.
- On success, tokens + user are stored in `auth.store` (persisted to localStorage).
- Protected routes rely on `useAuthGuard`; `AppProviders` adds Query + Router devtools in dev.
- `apiFetch` attaches `Authorization` when required and attempts a refresh on 401 using the configured backend; failure clears auth and surfaces a toast.

## API layer contract

- ASP.NET:
  - `POST /auth/login` -> `{ result: { accessToken, refreshToken, ... } }`
  - `POST /auth/refresh` -> `{ result: { accessToken, refreshToken, ... } }`
  - `GET /me` (auth) -> `{ result: user }`
  - `GET /users` (auth, paged envelope)
  - `GET /roles` (auth, paged envelope)
- Laravel (base URL e.g. https://api.qasitha.com/api):
  - `POST /auth/login` -> `{ access_token, refresh_token?, token_type, expires_in }`
  - `POST /auth/refresh` -> `{ access_token, refresh_token?, token_type, expires_in }`
  - `GET /me` (auth) -> user
  - `GET /users` (auth, DataTables payload)
  - `GET /roles` (auth, DataTables payload)
    `apiFetch` normalizes both backends into a unified `PagedResult<T>` where applicable.

## Data tables

- `DataTable` supports `mode="server"` (uses total/page/pageSize props) or `mode="client"` (local pagination).
- Users/Roles switch to client mode automatically when `backendKind` is `laravel` so search happens locally.

## Localization & Intlayer

- Locale sources: `src/locales/en/*.json`, `src/locales/ar/*.json` (synced via Intlayer).
- Intlayer config: `intlayer.config.ts` with sync-json plugin targeting `src/locales/{locale}/{namespace}.json`.
- Commands:
  - `pnpm intlayer:fill` (uses `OPENAI_API_KEY` in `.env` to auto-fill missing translations)
  - `pnpm intlayer:build`, `pnpm intlayer:push` as needed
- Runtime i18n remains i18next (see `src/core/i18n/i18n.ts`).

## Adding a new feature (pattern)

1. Declare endpoints in `src/core/api/endpoints.ts` (or feature-specific if applicable).
2. Add data hooks:
   - For queries: use `createDataTableHook<T>()` factory for paginated data
   - For mutations: use `createMutationHook<TVariables>()` factory (see `useUsers.ts` example)
   - Factory pattern eliminates boilerplate and ensures consistency
3. Build UI under `src/features/foo/components` or `src/features/foo/pages`; reuse shared UI/DataTable/FormField.
4. For dialogs: pass `namespace` and `fieldsDefinition` to `GenericActionDialog` (config generated internally)
5. Register a route in `routeTree.ts` under `dashboardRoute` for protected pages.
6. Add navigation item to `src/shared/config/navigation.ts` in `mainNavItems`.
7. Add translations to `src/locales/en/*.ts` / `src/locales/ar/*.ts` (and JSON if syncing via Intlayer).

## Optimized patterns

- **Generic mutation factory**: Single `createMutationHook` eliminates create/update/delete duplication
- **Simplified dialogs**: Pass `namespace` + `fieldsDefinition`; field config generated automatically
- **Auto-refresh**: TanStack Query's `invalidateQueries` handles table updates after mutations
- **Performance**: Uses `useCallback` and optimized form lifecycle (single useEffect for reset)

## Docs

- AI agent playbook: `docs/ai-agent-playbook.md`
