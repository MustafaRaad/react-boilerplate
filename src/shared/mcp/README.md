# MCP (Model-Component-Protocol) Pattern

This directory contains reusable utilities implementing the **Model-Component-Protocol** pattern for better performance, maintainability, and code reusability.

## Architecture

The MCP pattern consists of three layers:

### 1. **Model Layer** (`createModel.ts`)
Handles data fetching with TanStack Query:
- Automatic caching and refetching
- Background updates
- Error handling
- Loading states

### 2. **Component Layer** (Your UI Components)
Consumes models and protocols:
- Declarative data flow
- Automatic re-rendering
- Built-in loading/error states

### 3. **Protocol Layer** (`createProtocol.ts`)
Handles mutations and communication:
- Optimistic updates
- Cache invalidation
- Error handling
- Rollback on failure

## Usage Examples

### Creating a Model

```typescript
import { createModel } from "@/shared/mcp/createModel";
import { endpoints } from "@/core/api/endpoints";

export const useUsersModel = createModel<User>({
  queryKey: ["users"],
  queryFn: async () => apiFetch(endpoints.users.list),
  staleTime: 5 * 60 * 1000, // 5 minutes
  refetchInterval: 30000, // 30 seconds
});
```

### Creating a Protocol

```typescript
import { createProtocol } from "@/shared/mcp/createProtocol";
import { endpoints } from "@/core/api/endpoints";

export const useUserProtocol = createProtocol<UserFormData>({
  queryKey: ["users"],
  endpoint: endpoints.users.create,
  transform: (data) => ({ ...data, approved: data.approved ? 1 : 0 }),
  invalidateQueries: [["users"]],
});
```

### Creating a CRUD Protocol

```typescript
import { createCRUDProtocol } from "@/shared/mcp/createProtocol";

export const useUserProtocol = createCRUDProtocol<
  User,
  UserFormData,
  UserUpdateData,
  number
>({
  queryKey: ["users"],
  endpoints: {
    create: endpoints.users.create,
    update: endpoints.users.update,
    delete: endpoints.users.delete,
  },
  transforms: {
    create: transformUserData,
    update: transformUserData,
    delete: (id) => ({ id }),
  },
  invalidateQueries: [["users"]],
})();

// Usage
const protocol = useUserProtocol();
await protocol.create.mutateAsync(userData);
await protocol.update.mutateAsync(updateData);
await protocol.delete.mutateAsync(userId);
```

### Using Error Boundary

```typescript
import { ErrorBoundary } from "@/shared/mcp/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary
      fallback={({ error, retry }) => (
        <div>
          <p>Error: {error.message}</p>
          <button onClick={retry}>Try Again</button>
        </div>
      )}
      onError={(error, errorInfo) => {
        // Log to error reporting service
        logger.error('Component error', { error, errorInfo });
      }}
    >
      <YourComponent />
    </ErrorBoundary>
  );
}
```

## Benefits

1. **Performance**: Automatic caching, memoization, and optimized re-renders
2. **Maintainability**: Clear separation of concerns
3. **Reusability**: Generic factories eliminate code duplication
4. **Type Safety**: Full TypeScript support throughout
5. **Developer Experience**: Less boilerplate, more functionality

## Best Practices

1. **Always use Models for data fetching** - Don't fetch data directly in components
2. **Use Protocols for mutations** - All mutations should go through protocols
3. **Wrap components in Error Boundaries** - Handle errors gracefully
4. **Enable real-time for live data** - Use `refetchInterval` for dashboards
5. **Use optimistic updates** - Better UX for mutations

## Performance Optimizations

- Memoized data transformations
- Automatic query deduplication
- Smart cache invalidation
- Optimistic UI updates
- Background refetching
