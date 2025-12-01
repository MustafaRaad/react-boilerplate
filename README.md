# React Boilerplate

Modern admin starter built with React 19, Vite, and TypeScript. It ships with TanStack Router + Query + Form, Tailwind-based UI components, i18n (English/Arabic with RTL support), Zustand stores, and a simple auth/dashboard/users/roles flow wired to a switchable ASP.NET or Laravel backend.

## Quick start
- Prereqs: Node 18+ and pnpm (`corepack enable` or `npm i -g pnpm`).
- Install: `pnpm install`
- Configure environment (see below).
- Develop: `pnpm dev` then open http://localhost:5173
- Production build: `pnpm build` -> output in `dist/` (serve with `pnpm preview`).
- Lint: `pnpm lint`

## Features
- React 19 + TypeScript + Vite
- TanStack Router (type-safe routing)
- TanStack Query (data fetching/caching)
- TanStack Table (headless data grids)
- TanStack Form + Zod (forms + validation)
- Zustand (lightweight state with persistence)
- Tailwind CSS + shadcn/ui (UI primitives)
- i18n with RTL (English + Arabic)
- Backend-agnostic (ASP.NET or Laravel)

## Project Structure
```
src/
  app/                     # App entry and providers
    providers/             # QueryClient, Router, i18n, toasts, direction observer
    router/                # TanStack route tree
  assets/                  # Static assets
  components/ui/           # Reusable UI primitives (button, card, input, table)
  core/                    # Cross-cutting concerns
    api/                   # API client, endpoints, React Query helpers
    config/                # Environment configuration
    i18n/                  # Internationalization setup
    types/                 # Core TypeScript types (api/auth)
  features/                # Feature modules
    auth/                  # Authentication
    dashboard/             # Dashboard overview
    users/                 # User management
    roles/                 # Role management
  lib/                     # Generic utilities
  locales/                 # Translation resources (en, ar)
  shared/                  # Layout, data/form helpers, shared hooks/components
  store/                   # Zustand stores (auth/ui)
  styles/                  # Tailwind globals
  main.tsx                 # Entry point
  index.css                # Base styles
```

## Environment
- Copy `.env` (or create your own) with:
  - `VITE_API_BASE_URL`: REST API root.
  - `VITE_BACKEND_KIND`: `aspnet` (default) or `laravel`. This controls response normalization, paging, and auth token handling in the API client.

## Project layout
- `src/main.tsx`: entry point; renders `App`.
- `src/app/App.tsx`: top-level shell.
- `src/app/providers/AppProviders.tsx`: wraps Router, React Query, i18n, toast, and locale direction observer.
- `src/app/router/routeTree.tsx`: TanStack Router tree for `/`, `/login`, `/dashboard`, `/dashboard/users`, `/dashboard/roles`, and `*` fallback.
- `src/core/api`: endpoint definitions, fetcher with backend normalization + token refresh, React Query helpers, and toast notifications.
- `src/core/config/env.ts`: loads Vite env vars and exposes `backendKind` + `apiBaseUrl`.
- `src/store`: Zustand stores (`auth.store` persists tokens/user; `ui.store` persists sidebar state).
- `src/features/*`: feature slices (auth, dashboard, users, roles) with APIs, hooks, and UI.
- `src/shared/components`: layout (sidebar/header/error pages), data table, form field helpers.
- `src/styles/globals.css`, `src/index.css`: Tailwind setup and global styles.

## Core workflows
- Authentication
  - Login form uses `@tanstack/react-form` + zod validation; mutation handled by `useLogin`.
  - Successful login stores tokens/user in `auth.store` (localStorage) and redirects to `/dashboard`.
  - `useAuthGuard` protects dashboard routes and redirects unauthenticated users to `/login`.
  - Token refresh is automatic on 401 via `apiFetch`; failure clears auth and raises a toast.
- Routing
  - Routes live in `src/app/router/routeTree.tsx` using TanStack Router. Add new pages by creating a route with `createRoute` and adding it to the tree; wrap protected sections with `useAuthGuard` and render inside `DashboardLayout`.
- API layer
  - Endpoints are declared in `src/core/api/endpoints.ts` for typing and reuse.
  - `apiFetch` normalizes ASP.NET envelopes/paging and Laravel responses into a unified shape, adds auth headers, and performs token refresh when needed.
  - `useApiQuery`/`useApiMutation` wrap React Query with consistent toast handling.
- Data + tables
  - `DataTable` in `src/shared/components/data/DataTable.tsx` supports server or client pagination. Users/Roles switch to client mode when `backendKind` is `laravel` (to allow local search/paging).
  - Users and roles hooks (`useUsers`, `useRoles`) accept paging/search params and return a unified `PagedResult`.
- Forms and validation
  - Forms use `@tanstack/react-form` with zod validators. `FormField` helper renders labels/error text and wires inputs to TanStack form fields.
- State and UI
  - Sidebar/header live under `src/shared/components/layout`. Sidebar state persists via `ui.store` for consistent open/close behavior.
- Internationalization
  - `src/core/i18n/i18n.ts` registers English/Arabic resources; `useLocaleDirection` flips `dir` based on current locale. Text is namespaced under `locales/{en,ar}/common.ts`.

## Adding a new feature (example)
1) Define the endpoint in `src/core/api/endpoints.ts`.
2) Create a hook in the relevant feature (e.g., `src/features/foo/api/useFoo.ts`) that calls `apiFetch` via `useApiQuery` or `useApiMutation`.
3) Add UI under `src/features/foo/components`, using `DataTable`/`FormField` as needed.
4) Register a route in `routeTree.tsx` (wrap in `DashboardLayout` and `useAuthGuard` if protected).
5) Add translations to `locales/en/common.ts` and `locales/ar/common.ts` for any new copy.

## Troubleshooting
- Blank page after login redirect: ensure `VITE_API_BASE_URL` is reachable and returns the `me` endpoint, and that `VITE_BACKEND_KIND` matches the backend.
- Stale auth: clear `localStorage` keys `auth-storage` and `ui-preferences` to reset tokens/ui state.
- CORS/local dev: start the API locally or enable CORS for `http://localhost:5173`.
