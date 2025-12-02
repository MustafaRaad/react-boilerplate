# API client quickstart

This project already ships an API layer that wraps `fetch`, normalizes ASP.NET vs Laravel responses, attaches auth headers, and retries once on `401` by refreshing tokens. Use it via the helpers in `src/core/api/`.

## Environment
- Set `VITE_API_BASE_URL=https://your-api/`
- Optionally set `VITE_BACKEND_KIND=aspnet` or `laravel` (default: `aspnet`)
- Restart the dev server after changing env vars

## Define an endpoint
Add an entry to `src/core/api/endpoints.ts`:
```ts
widgets: {
  list: { path: '/widgets', method: 'GET', requiresAuth: true },
  create: { path: '/widgets', method: 'POST', requiresAuth: true },
},
```

## Read data (query)
```ts
// src/features/widgets/api/useWidgets.ts
import { apiFetch } from '@/core/api/client';
import { endpoints } from '@/core/api/endpoints';
import { useApiQuery } from '@/core/api/hooks';

export const useWidgets = (filters?: { search?: string }) =>
  useApiQuery({
    queryKey: ['widgets', filters],
    queryFn: () => apiFetch(endpoints.widgets.list, { query: filters }),
  });
```

## Write data (mutation)
```ts
// src/features/widgets/api/useCreateWidget.ts
import { apiFetch } from '@/core/api/client';
import { endpoints } from '@/core/api/endpoints';
import { useApiMutation } from '@/core/api/hooks';

export const useCreateWidget = () =>
  useApiMutation({
    mutationFn: (payload: { name: string }) =>
      apiFetch(endpoints.widgets.create, { body: payload }),
    successMessageKey: 'common.toasts.success',
  });
```

Use in a component:
```ts
const createWidget = useCreateWidget();
createWidget.mutate({ name: 'Example' }); // toasts on error/success handled for you
```

## Auth, tokens, and errors
- `apiFetch` automatically includes `Authorization: Bearer <accessToken>` for endpoints with `requiresAuth: true`.
- On `401`, it calls the backend-specific refresh endpoint once; failure clears auth and throws a `UnifiedApiError`.
- Responses are normalized so ASP.NET/Laravel paging and login shapes are consistent across the app.

## AI Agent instructions
- When adding API calls, **only** touch `src/core/api/endpoints.ts`, `src/core/api/client.ts`, and hooks under `src/features/*/api`.
- Reuse `apiFetch` and `useApiQuery`/`useApiMutation`; do not introduce new fetch wrappers.
- Keep new endpoints typed (add request/response types in feature `types.ts` files if missing).
- Respect `backendKind` differences; if a new endpoint is backend-specific, branch like `useLogin` does.
- After adding env variables or endpoints, mention to restart `pnpm dev`.
