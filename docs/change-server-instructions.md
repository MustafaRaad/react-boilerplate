# Change Server Instructions

Guidance for future agents when switching or extending backend integrations (auth, identity, header UI).

## Current Backend Assumptions (Laravel POS)

- Login `POST /auth/login` body: `{ email, password, type: "web" }`.
- Login response: `{ message, access_token, token_type, expires_in }`.
- Tokens stored in auth store as:
  - `accessToken` (string)
  - `accessTokenType` (string, typically "bearer")
  - `accessTokenExpiresIn` (seconds)
  - `accessTokenExpiresAt` (timestamp ms)
- `/auth/me` response shape:
  ```json
  {
    "fees": number,
    "pos": { "pos_name": string, "pos_lat": number, "pos_lng": number, "id": number },
    "user": { "id": number, "name": string|null, "email": string|null, "phone_no": string|null },
    "perm": string[]
  }
  ```
- Normalization into auth store:
  - `user`: `{ id, name|null, email|null, phoneNo|null, image:null, role:null }`
  - `pos`: `{ id, name, lat, lng }`
  - `permissions`: `perm` array
  - `fees`: `fees`
- Header identity uses only `auth-storage.user`; displayName prefers `name -> email -> t("header.user")`; role is optional/null; avatar uses `user.image` if present otherwise initials/icon; no `/me` fetch in header.

## Files to Update When Changing Backend

- Types: `src/features/auth/types/auth.types.ts` (AuthUser/AuthPos/MeResponse/AuthTokens).
- Auth endpoints: `src/features/auth/api/auth.endpoints.ts`.
- Auth store: `src/store/auth.store.ts` (shape persisted + expiry logic).
- Login flow: `src/features/auth/hooks/useLogin.ts` (request/response mapping).
- API client: `src/core/api/client.ts` (token handling, normalization, headers).
- Header identity: `src/shared/components/layout/dashboard-header/*` (useSettingsMenu, SettingsMenu, UserAvatar/UserProfileSection/types) to ensure display matches new shapes.

## Steps for Switching to a New Backend

1. **Define shapes**: Document login response, /me (or equivalent) response, token semantics (type, expiry, refresh), and any role/permission fields.
2. **Update types**: Adjust `AuthTokens`, `AuthUser`, `AuthPos`, `MeResponse` (or new response types) in `auth.types.ts`.
3. **Endpoints**: Point `auth.endpoints.ts` to the new paths and methods; remove unused endpoints.
4. **Client normalization**: In `api/client.ts`, normalize login response into `AuthTokens`; set Authorization header to match backend expectations (token type casing, header name); remove refresh logic unless backend provides it.
5. **Login hook**: Map the new login response to tokens, then fetch/normalize user profile into the store; keep “store tokens first, then /me” pattern if needed for auth headers.
6. **Store**: Persist the normalized fields (user/pos/permissions/fees or their new equivalents) and adjust expiry checks to new token fields.
7. **Header identity**: Ensure `useSettingsMenu` still reads only from auth store; update displayName/role/image logic if shapes change (auth store remains the single source of truth).
8. **Audit consumers**: Search for `useAuthStore` and update any code assuming old fields (e.g., roles array vs string role).
9. **Tests/lint**: Run `pnpm lint` and relevant tests; address only new errors introduced by your changes.

## If Switching to ASP.NET

- **Expected shapes (example; confirm real API)**:
  - Login envelope often: `{ code, message, result: { accessToken, refreshToken?, accessExpiresAtUtc?, refreshExpiresAtUtc? } }`.
  - `/me` often: `{ code, message, result: { id, name, email, roles: Role[] } }`.
- **Types**:
  - Extend `AuthTokens` with `refreshToken?: string`, `accessTokenExpiresAt?: number`, `refreshTokenExpiresAt?: number` if provided.
  - Update `AuthUser` to match ASP.NET user shape (roles array vs string role; phone/image if present).
  - Replace `MeResponse` with the ASP.NET envelope or flattened shape.
- **Endpoints**: In `auth.endpoints.ts`, reintroduce ASP.NET endpoints if needed (e.g., `loginAspNet`, `refreshAspNet`, `me`), and wire `endpoints.auth` to them.
- **API client**:
  - Restore ASP.NET normalization (envelope parsing, paged response parsing).
  - Handle bearer headers (typically `Bearer ${accessToken}`) without lowercasing token type.
  - If refresh tokens exist, reintroduce refresh flow (on 401: try refresh, retry once, then clear auth).
- **Login hook** (`useLogin`):
  - Call the ASP.NET login endpoint; map tokens into the store (compute `accessTokenExpiresAt` from any UTC timestamp if provided).
  - Fetch `/me` and normalize into `AuthUser`; store tokens + user (+ pos/permissions if the API provides them).
- **Store**:
  - Keep `user`/`pos`/`permissions`/`fees` slots but align them to ASP.NET data; adjust expiry checks to new token fields.
  - If roles are arrays, keep `hasPermission` or add `hasRole` depending on ASP.NET needs.
- **Header**:
  - No header fetch; still read `authStorage.user`. If roles are available, optionally surface `role` (single string) by mapping the first role or a joined list—document the choice in `useSettingsMenu`.
- **Validation**:
  - Smoke-test login + `/me` flow, verify Authorization header matches backend expectation, and ensure header UI shows the expected name/avatar fallback.

### ASP.NET Server-Side Pagination

When ASP.NET provides **server-side pagination** (backend filters/sorts/pages data), update the following:

**1. Environment Configuration**:

```bash
# .env
VITE_BACKEND_KIND=aspnet
```

**2. API Hooks Pattern**:

```ts
// src/features/<feature>/api/use<Feature>s.ts
export const useWidgets = (query: {
  page: number;
  pageSize: number;
  search?: string;
}) => {
  return useApiQuery<PagedResult<Widget>>({
    queryKey: ["widgets", "asp-net", query],
    queryFn: async () => {
      const response = await apiFetch<PagedResult<Widget>>(
        endpoints.widgets.list,
        {
          query, // Send pagination params to server
          overrideBackendKind: "asp-net",
        }
      );
      return response;
    },
    initialData: emptyPagedResult(),
  });
};
```

**3. DataTable Component Configuration**:

```tsx
// src/features/<feature>/components/<Feature>Table.tsx
import { backendKind } from "@/core/config/env";

export const WidgetsTable = () => {
  const { page, setPage, pageSize, setPageSize } = usePaginationState();
  const widgetsQuery = useWidgets({ page, pageSize });

  // Server mode for ASP.NET (backend handles filtering/pagination)
  const mode = backendKind === "asp-net" ? "server" : "client";

  return (
    <DataTable
      mode={mode} // "server" for ASP.NET
      columns={columns}
      data={widgetsQuery.data?.items ?? []}
      total={widgetsQuery.data?.rowCount} // Total count from server
      page={page}
      pageSize={pageSize}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      enableColumnFilters // Filters work client-side on current page data
    />
  );
};
```

**4. Backend Query Parameters**:
ASP.NET endpoints typically expect:

- `page` or `pageNumber` (1-based index)
- `pageSize` or `limit`
- `search` or `query` (optional global search)
- Column-specific filters (e.g., `status`, `dateFrom`, `dateTo`)

Adjust `endpoints.<feature>.list` to match your API's query parameter names.

**5. Filter Behavior with Server Pagination**:

- **Column filters** (`enableColumnFilters`) work **client-side** on the current page of data
- For **server-side filtering**, pass filter values in the query parameters to the API hook
- Consider extending the hook to accept filter parameters:
  ```ts
  export const useWidgets = (query: {
    page: number;
    pageSize: number;
    search?: string;
    status?: string; // Server-side filter
    dateFrom?: string; // Server-side filter
    dateTo?: string; // Server-side filter
  }) => {
    /* ... */
  };
  ```

**6. Response Normalization**:
The `apiFetch` client automatically normalizes ASP.NET paged responses to `PagedResult<T>`:

```ts
// ASP.NET envelope: { code, message, result: { items, currentPage, pageSize, rowCount, pageCount } }
// Normalized to: { items, currentPage, pageSize, rowCount, pageCount }
```

Ensure your schemas in `src/core/schemas/endpoints.schema.ts` match the ASP.NET response structure.

**7. Pagination State Management**:

- Use `usePaginationState` hook for consistent page/pageSize state
- Hook automatically persists to URL query params (optional)
- On page/pageSize change, React Query refetches with new parameters

**Key Differences**:

- **Laravel (client mode)**: All data fetched at once, filtering/pagination handled by TanStack Table
- **ASP.NET (server mode)**: Only current page fetched, backend handles pagination, client-side column filters work on visible data only

## Non-Goals / Do Nots

- Do not reintroduce next-auth/getServerSession/ensureMe/getStoredMe or client-side `/me` fetches inside header.
- Do not derive role from permissions unless explicitly required; keep role nullable until backend provides it.
- Do not change auth store persistence keys unless you also handle migrations (localStorage) or communicate breaking changes.

## AI Agent Checklist (do this before changing backends)

- Read this doc fully and confirm the target backend shapes (login + `/me`) are known and written down.
- Update types first (`auth.types.ts`) and keep auth store the single source of truth for identity.
- Adjust endpoints and API client normalization to match the backend’s auth headers and token semantics.
- Update the login hook to store tokens before fetching `/me`, then normalize `/me` into the store.
- Keep header identity read-only from auth store; no extra fetches or legacy helpers.
- Run `pnpm lint` and fix only issues introduced by your changes; note any pre-existing lint failures separately.
