# React Boilerplate

Modern admin starter built with React 19, Vite, and TypeScript. Ships with TanStack Router + Query + Form, Tailwind/shadcn UI primitives, i18n (English/Arabic with RTL), Zustand stores, and an auth/dashboard/users/roles flow that can talk to either an ASP.NET or Laravel backend.

## Requirements
- Node 18+ and pnpm (`corepack enable` or `npm i -g pnpm`)
- API reachable at `VITE_API_BASE_URL` with the endpoints below

## Setup & scripts
1) Install deps: `pnpm install`
2) Configure env (see next section)
3) Develop: `pnpm dev` (opens http://localhost:5173)
4) Build: `pnpm build` (type-check + Vite build to `dist/`)
5) Preview production build: `pnpm preview`
6) Lint: `pnpm lint`

## Environment
Create `.env` (or copy from `.env.example`) with:
```
VITE_API_BASE_URL=https://your-api/
VITE_BACKEND_KIND=aspnet   # or laravel
```
`VITE_BACKEND_KIND` controls how responses are normalized (paging, token shapes) and which endpoints are used for login/refresh.

## Project structure (what lives where)
```
src/
  main.tsx                 Entry; renders <App />
  app/                     App shell
    App.tsx                Root component
    providers/AppProviders.tsx  Router, QueryClient, i18n, toasts, dir observer
    router/routeTree.tsx   TanStack Router tree and guards
  assets/                  Static assets and styling
    fonts/                 Tajawal font files
    styles/                fonts.css + globals.css (imports Tailwind layers)
  components/ui/           UI primitives (button, card, input, label, table)
  core/                    Cross-cutting concerns
    api/                   API client + helpers
      client.ts            Fetch wrapper with backend normalization & token refresh
      endpoints.ts         Typed endpoint definitions
      hooks.ts             useApiQuery/useApiMutation with toast handling
      notifications.ts     Toast helpers
      queryClient.ts       React Query client factory
    config/env.ts          Reads Vite env and exposes backendKind/apiBaseUrl
    i18n/                  i18next setup + resource registration
    types/                 Shared types for API/auth
  features/                Vertical slices
    auth/                  Login form, hooks, API calls, types
    dashboard/             Overview cards
    users/                 Users table + data hooks
    roles/                 Roles table + data hooks
  lib/                     Generic utilities (e.g., class helpers)
  locales/                 Translation resources (en, ar)
  shared/                  Reusable building blocks
    components/data/       DataTable (server/client pagination)
    components/form/       FormField helper for TanStack Form
    components/layout/     Header, Sidebar, layouts, error/not-found pages
    hooks/                 Generic hooks (locale direction, pagination)
  store/                   Zustand stores
    auth.store.ts          Auth state with persistence
    ui.store.ts            UI prefs (sidebar open)
```

## Routing
- `/` root redirects to `/dashboard` if authenticated, otherwise `/login`.
- `/login` shows the login form.
- `/dashboard` (protected) renders `DashboardLayout` with nested routes:
  - `/dashboard/` overview cards
  - `/dashboard/users` users table
  - `/dashboard/roles` roles table
- `*` renders a not-found page.
Protection is handled by `useAuthGuard`, which redirects unauthenticated users to `/login`.

## Authentication flow
- Login (`useLogin`) posts credentials to backend-specific login endpoint.
- On success, tokens + user are stored in `auth.store` (persisted to localStorage).
- Protected routes rely on `useAuthGuard`; `AppProviders` adds Query + Router devtools in dev.
- `apiFetch` automatically attaches `Authorization` when required and attempts a refresh on 401 using the configured backend flow; failure clears auth and surfaces a toast.

## API layer contract
Expected endpoints relative to `VITE_API_BASE_URL`:
- ASP.NET mode:
  - `POST /auth/login` -> `{ result: { accessToken, refreshToken, ... } }`
  - `POST /auth/refresh` -> `{ result: { accessToken, refreshToken, ... } }`
  - `GET /me` (auth) -> `{ result: user }`
  - `GET /users` (auth, paged envelope)
  - `GET /roles` (auth, paged envelope)
- Laravel mode:
  - `POST /login` -> `{ access_token, refresh_token? }`
  - `POST /auth/refresh` -> `{ access_token, refresh_token? }`
  - `GET /me` (auth) -> user
  - `GET /users` (auth, DataTables-style payload)
  - `GET /roles` (auth, DataTables-style payload)
`apiFetch` normalizes both backends into a unified `PagedResult<T>` where applicable.

## Data tables
- `DataTable` supports `mode="server"` (uses total/page/pageSize props) or `mode="client"` (local pagination).
- Users/Roles switch to client mode automatically when `backendKind` is `laravel` so search happens locally.

## Forms
- Built with `@tanstack/react-form` and `zod` for validation.
- `FormField` helper wires TanStack fields to inputs and shows errors/labels.

## Internationalization
- i18next with resources in `locales/en/common.ts` and `locales/ar/common.ts`.
- `useLocaleDirection` flips `dir` on the document for RTL when Arabic is active.

## Adding a new feature (example)
1) Declare the endpoint in `src/core/api/endpoints.ts`.
2) Add a data hook (e.g., `useFoos`) that calls `apiFetch` via `useApiQuery`/`useApiMutation`.
3) Build UI under `src/features/foo/components`; reuse `DataTable`/`FormField`/UI primitives.
4) Register a route in `routeTree.tsx` (wrap with `DashboardLayout` and `useAuthGuard` if protected).
5) Add strings to `locales/en/common.ts` and `locales/ar/common.ts`.

## Troubleshooting
- Blank page or redirect loop: check `VITE_API_BASE_URL` and that `/me` returns 200 with user when authorized.
- Auth stuck: clear `localStorage` keys `auth-storage` and `ui-preferences`.
- 401s despite valid tokens: ensure backend kind matches (`VITE_BACKEND_KIND`), and refresh endpoint exists.
- CORS in dev: allow `http://localhost:5173` on the API.

## Docs
- API client: `docs/api-client.md`
- AI agent playbook: `docs/ai-agent-playbook.md`
