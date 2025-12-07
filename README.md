<!--
  /**
 * @copyright Copyright (c) 2025 Developed By: Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */
  All rights reserved.
-->

# React Boilerplate

Modern, production-ready admin dashboard built with React 19, Vite, and TypeScript. Ships with TanStack Router + Query + Form, shadcn UI (dashboard-01), i18n (English/Arabic with RTL), Zustand stores, and complete CRUD workflows that support both **ASP.NET** and **Laravel** backends with automatic normalization.

## 📚 Documentation

**For AI Agents & Developers:**

- **[AI Agent Implementation Guide](./docs/AI_AGENT_IMPLEMENTATION_GUIDE.md)** — Comprehensive guide covering architecture, setup, patterns, and step-by-step feature implementation
- **[Backend Switching Guide](./docs/BACKEND_SWITCHING_GUIDE.md)** — Laravel ↔ ASP.NET switching with endpoint contracts and testing procedures
- **[Feature Creation Flow](./docs/FEATURE_CREATION_FLOW.md)** — Practical, end-to-end checklist for adding new features

## Requirements

- Node 18+ and pnpm (`corepack enable` or `npm i -g pnpm`)
- API reachable at `VITE_API_BASE_URL`

## ⚡ Quick Start

### 1. Install & Configure

```bash
# Install dependencies (Node 18+ required)
pnpm install

# Copy environment template
cp .env.example .env
```

### 2. Set Environment Variables

Edit `.env`:

```env
# API endpoint (MUST end with /)
VITE_API_BASE_URL=http://localhost:5000/api/

# Backend type: 'aspnet' or 'laravel'
VITE_BACKEND_KIND=aspnet

# Optional: OpenAI API key for auto-translation filling
# OPENAI_API_KEY=sk-your-api-key-here
```

**Important:**

- `VITE_API_BASE_URL` must end with `/` (e.g., `https://api.example.com/api/`)
- `VITE_BACKEND_KIND` can be `aspnet` or `laravel` (case-insensitive)
- Default fallback: `aspnet`

### 3. Start Development

```bash
# Start dev server on http://localhost:5018
pnpm dev

# In another terminal, start your backend:
# Laravel: php artisan serve --port=8000
# ASP.NET: dotnet run --configuration Debug
```

**Note:** Restart the dev server after changing `.env` (Vite caches env at build time)

### 4. Verify Setup

- Open http://localhost:5018 in your browser
- You should see the login page
- Backend should be reachable and returning data

## 📋 Available Scripts

| Command               | Purpose                                                                 |
| --------------------- | ----------------------------------------------------------------------- |
| `pnpm dev`            | Start development server at http://localhost:5018 with hot reload       |
| `pnpm build`          | Type-check with TypeScript, then build production bundle to `dist/`     |
| `pnpm preview`        | Serve the production build locally for testing                          |
| `pnpm lint`           | Run ESLint with TypeScript and accessibility checks                     |
| `pnpm intlayer:build` | Build Intlayer i18n dictionaries                                        |
| `pnpm intlayer:fill`  | Auto-fill missing translations using OpenAI (requires `OPENAI_API_KEY`) |
| `pnpm intlayer:push`  | Push translations to remote Intlayer service (if configured)            |

## 🔧 Environment Configuration

### Required Variables

```env
VITE_API_BASE_URL=<your-api-url>
VITE_BACKEND_KIND=<aspnet|laravel>
```

### URL Format Rules

- **Base URL must end with `/`**: `https://api.example.com/api/` ✅ vs `https://api.example.com/api` ❌
- **Endpoints have no leading `/`**: `Users/List` ✅ vs `/Users/List` ❌
- **Final URL**: `VITE_API_BASE_URL` + endpoint path = `https://api.example.com/api/Users/List`

### Backend-Specific URLs

**ASP.NET**

```env
VITE_API_BASE_URL=https://localhost:7000/api/
VITE_BACKEND_KIND=aspnet
```

**Laravel**

```env
VITE_API_BASE_URL=http://localhost:8000/api/
VITE_BACKEND_KIND=laravel
```

### Optional: AI-Powered Translations

```env
# Enable automatic translation filling with OpenAI
OPENAI_API_KEY=sk-your-api-key-here
```

Then run: `pnpm intlayer:fill`

### Switching Backends

When switching from one backend to another:

1. Update `.env` with new `VITE_API_BASE_URL` and `VITE_BACKEND_KIND`
2. Stop dev server (Ctrl+C)
3. Restart dev server: `pnpm dev`
4. Clear browser `localStorage` if login fails (tokens may be incompatible)

**Why restart?** Vite loads env variables at build time, not runtime.

## 🏗️ Project Structure

```
src/
  main.tsx                          Entry point; renders <App />

  app/                              Application shell
    App.tsx                         Root component with theme/layout setup
    providers/AppProviders.tsx      Combines Router, QueryClient, i18n, toasts
    router/
      routeTree.ts                  TanStack Router tree with auth guards
      routeComponents.tsx           Protected wrapper, redirects

  assets/
    fonts/                          Tajawal font files (Arabic support)
    styles/globals.css              Tailwind + custom globals

  core/                             🔒 Infrastructure (don't modify without reason)
    api/
      client.ts                     Central API client; handles all requests
      endpoints.ts                  Typed endpoint definitions
      hooks.ts                      useApiQuery/useApiMutation wrappers
      normalizers.ts                Backend-specific response normalization
      interceptors.ts               Request/response interceptors
      retry.ts                      Exponential backoff logic
      queryClient.ts                TanStack Query configuration
    config/env.ts                   Reads VITE_* environment variables
    i18n/
      i18n.ts                       i18next initialization
      direction.ts                  RTL/LTR helpers
    schemas/
      endpoints.schema.ts           Shared Zod schemas
    security/
      csrf.ts, rateLimit.ts, ...    Security utilities
    types/api.ts                    API-related types

  features/                         Feature modules (vertical slices)
    auth/
      api/auth.endpoints.ts         Auth-specific endpoints
      components/LoginForm.tsx      Login UI
      hooks/useLogin.ts             Auth mutations
      pages/LoginPage.tsx           Login page component
      schemas/auth.schema.ts        Zod schemas for auth
      types/auth.types.ts           TypeScript types

    users/
      api/useUsers.ts               Data fetching hooks
      components/
        UsersTable.tsx              Table component
        UsersTable.columns.tsx      Column definitions
      schemas/user.schema.ts        Zod schemas
      types/index.ts                TypeScript types

    dashboard/                      Dashboard overview
    statistics/                     Statistics feature
    [feature]/                      Add new features following this pattern

  lib/
    formatters.ts                   Date, number, text formatters
    utils.ts                        Generic utility functions

  locales/                          i18n translation files
    en/common.json                  English: shared strings
    en/users.json                   English: feature-specific strings
    ar/common.json                  Arabic: shared strings
    ar/users.json                   Arabic: feature-specific strings

  shared/                           Reusable code (components, hooks, utilities)
    components/
      ui/                           shadcn/ui components (button, card, input, etc.)
      layout/                       DashboardLayout, Sidebar, Header, NotFound
      data-table/                   DataTable with pagination, sorting, filtering
      form/                         Form field components
      dialogs/                      GenericFormDialog for CRUD
    config/
      navigation.ts                 Navigation menu configuration
    hooks/
      useDataTableQuery.ts          Server-side table data fetching
      useDirection.ts               RTL/LTR direction hook
      useDebounce.ts                Debounce utility
      useMobile.ts                  Mobile breakpoint detection
    utils/
      a11y.ts                       Accessibility utilities
```

## 🔐 Architecture Principles

### 1. Backend Agnostic

- Both ASP.NET and Laravel backends are fully supported
- Endpoint definitions centralized in `src/core/api/endpoints.ts`
- Response normalization handled in `src/core/api/normalizers.ts`
- Feature code never knows which backend is running

### 2. Type Safety Everywhere

- Zod schemas for runtime validation
- TypeScript strict mode enabled
- Endpoint requests/responses fully typed
- TanStack Form for type-safe forms

### 3. API Layer Contract

- **Single entry point**: `src/core/api/client.ts`
- **All requests** must go through `apiFetch` helper
- **Token management** (add/refresh) handled automatically
- **Error handling** with translated messages

### 4. Data Fetching Patterns

- **Lists**: `createDataTableHook` factory for paginated queries
- **Mutations**: `useApiMutation` with auto-toast notifications
- **Caching**: TanStack Query manages all caching and invalidation

### 5. UI Consistency

- **shadcn/ui** components for consistency
- **Field components** for form building (not raw inputs)
- **DataTable** for all tabular data
- **GenericFormDialog** for CRUD operations

## 📍 Routing

The app uses **TanStack Router** with file-based routing and type-safe navigation.

```
/ (root)
├── / (index) → redirects to /dashboard or /login based on auth
├── /login (public)
└── /dashboard (protected by useAuthGuard)
    ├── / (overview with cards)
    ├── /users (users table)
    ├── /roles (roles table)
    └── ... (add feature routes here)
```

**Protection Mechanism:**

- `useAuthGuard()` hook redirects unauthenticated users to `/login`
- Auth state comes from `auth.store` (Zustand with localStorage persistence)
- Protected wrapper in `routeComponents.tsx` enforces guards

## 🔑 Authentication

### Login Flow

1. User enters credentials on `/login`
2. `useLogin()` hook sends credentials to backend-specific endpoint
3. Backend returns tokens (access + optional refresh token)
4. Tokens are stored in `auth.store` and persisted to localStorage
5. User redirected to `/dashboard`

### Token Refresh

- `apiFetch` automatically handles token refresh on `401` errors
- Uses configured backend's refresh endpoint
- On failure, clears auth and shows error toast

### Protected Routes

All dashboard routes are protected with `useAuthGuard()`:

```tsx
export const dashboardRoute = createFileRoute("/dashboard")({
  beforeLoad: ({ context }) => {
    context.auth.validateAuth(); // ← Validates token exists
  },
  // ...
});
```

## 🌐 Internationalization (i18n)

- **Library**: i18next with React bindings
- **Locales**: English (`en`) and Arabic (`ar`)
- **Direction**: Automatic RTL/LTR based on locale
- **Translation Files**: `src/locales/{locale}/{namespace}.json`

### Namespaces

| Namespace    | Purpose                                    |
| ------------ | ------------------------------------------ |
| `common`     | Shared labels, actions, validation, errors |
| `users`      | Users feature specific strings             |
| `statistics` | Statistics feature strings                 |
| `[feature]`  | Add new namespace for each feature         |

### Using Translations

```tsx
import { useTranslation } from "react-i18next";

export function MyComponent() {
  const { t } = useTranslation(["common", "users"]); // ← Specify namespaces

  return <h1>{t("users:list.title")}</h1>; // ← Namespace prefix
}
```

### Adding AI Translations

Auto-fill missing translations using OpenAI:

```bash
# Set OPENAI_API_KEY in .env, then:
pnpm intlayer:fill
```

## 💾 Data Fetching & State Management

### TanStack Query (Server State)

- Centralized in `src/core/api/hooks.ts`
- All queries use `useApiQuery()` wrapper
- All mutations use `useApiMutation()` wrapper with toast notifications
- Automatic refetching and stale-while-revalidate behavior

### Zustand (Client State)

- Auth store: `src/store/auth.store.ts` (tokens, user, permissions)
- UI store: `src/store/ui.store.ts` (theme, sidebar, etc.)
- Persisted to localStorage with Zustand middleware

### Data Table Hook Factory

For paginated lists, use the factory pattern:

```tsx
// src/features/users/api/useUsers.ts
import { createDataTableHook } from "@/shared/hooks/createDataTableHook";
import { endpoints } from "@/core/api/endpoints";

export const useUsersQuery = createDataTableHook("users", endpoints.users.list);
```

## 📝 Forms

### Architecture

- **State**: TanStack Form (headless, framework-agnostic)
- **Validation**: Zod schemas with translated messages
- **UI**: shadcn Field components (FieldLabel, FieldError, etc.)

### Pattern

```tsx
import { useForm } from "@tanstack/react-form";
import { userSchema } from "@/features/users/schemas/user.schema";

export function UserForm() {
  const form = useForm({
    defaultValues: { name: "", email: "" },
    onSubmit: async (data) => { /* submit */ },
    validatorAdapter: zodValidator(),
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      form.handleSubmit();
    }}>
      <form.Field name="name" children={(field) => (
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
        {field.state.meta.errors && <FieldError>{field.state.meta.errors[0]}</FieldError>}
      )} />
    </form>
  );
}
```

### Prefilled Dialogs

Use `GenericFormDialog` for common CRUD patterns:

```tsx
<GenericFormDialog
  namespace="users"
  fieldsDefinition={userFieldsConfig}
  onSubmit={handleSubmit}
  initialValues={editingUser}
/>
```

## 🚀 Best Practices

### 1. Use the API Layer Exclusively

```tsx
// ✅ Correct
import { apiFetch } from "@/core/api/client";
const data = await apiFetch(endpoints.users.list, {});

// ❌ Wrong - never fetch directly
const data = await fetch(`${apiUrl}/users`);
```

### 2. Normalize Backend Responses Centrally

```tsx
// ✅ In src/core/api/normalizers.ts
export function normalizeUserResponse(user, backendKind) {
  if (backendKind === "laravel") {
    return { id: user.id, name: user.name };
  }
  // handle aspnet
}

// Components use the already-normalized data from hooks
```

### 3. Type Your Endpoints

```tsx
// ✅ Always define request/response types
endpoints.users.list: {
  path: "Users/List",
  method: "GET",
  requiresAuth: true,
} as EndpointDef<
  UserListRequest,  // Request type
  UserListResponse  // Response type (normalized)
>
```

### 4. Invalidate Query Keys on Mutations

```tsx
// ✅ Automatically re-fetch after create/update/delete
const createUserMutation = useApiMutation(endpoints.users.create, {
  onSuccess: (queryClient) => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  },
});
```

### 5. Feature-Level Translations

```tsx
// ✅ Use namespaced translations
const { t } = useTranslation(["users", "common"]);
<p>{t("users:form.nameLabel")}</p>  // Feature namespace
<p>{t("common:actions.save")}</p>   // Common namespace
```

## 📚 Adding a New Feature (10-Step Checklist)

See [FEATURE_CREATION_FLOW.md](./docs/FEATURE_CREATION_FLOW.md) for detailed step-by-step instructions.

Quick summary:

1. **Plan**: Decide CRUD operations, list views, translations
2. **Schemas**: Define Zod schemas in `src/features/<feature>/schemas/`
3. **Types**: Export inferred types in `src/features/<feature>/types/index.ts`
4. **Endpoints**: Register in `src/core/api/endpoints.ts`
5. **Data Hooks**: Create in `src/features/<feature>/api/use<Feature>.ts`
6. **UI Components**: Build in `src/features/<feature>/components/`
7. **Routes**: Add to `routeTree.ts` and protect if needed
8. **Navigation**: Add item to `src/shared/config/navigation.ts`
9. **Translations**: Add keys to `src/locales/{en,ar}/<feature>.json`
10. **Test**: Run `pnpm lint` and `pnpm build` to verify
