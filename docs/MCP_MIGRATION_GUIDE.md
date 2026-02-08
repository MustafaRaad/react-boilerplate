# MCP Pattern Migration Guide

This guide helps you migrate existing features to use the MCP (Model-Component-Protocol) pattern for better performance and maintainability.

## Quick Reference

### Before (Traditional Pattern)
```typescript
// Manual state management
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchData().then(setData).finally(() => setLoading(false));
}, []);

// Manual mutations
const handleUpdate = async (id, data) => {
  await updateAPI(id, data);
  setData(prev => prev.map(item => item.id === id ? data : item));
};
```

### After (MCP Pattern)
```typescript
// Model - Data fetching
const dataModel = useDataModel();

// Protocol - Mutations
const dataProtocol = useDataProtocol();
await dataProtocol.update.mutateAsync({ id, ...data });
```

## Migration Steps

### Step 1: Create Model Hook

**File:** `src/features/[feature]/api/use[Feature].ts`

```typescript
import { createDataTableHook } from "@/shared/hooks/createDataTableHook";
import { endpoints } from "@/core/api/endpoints";
import type { Feature } from "@/features/[feature]/types";

export const useFeature = () => {
  const query = createDataTableHook<Feature>(
    "feature",
    endpoints.feature.list
  )();

  // Add any data transformations here
  const transformedData = useMemo(() => {
    if (!query.data?.items) return query.data;
    // Your transformation logic
    return query.data;
  }, [query.data]);

  return {
    ...query,
    data: transformedData,
  };
};
```

### Step 2: Create Protocol Hook

```typescript
import { createCRUDProtocol } from "@/shared/mcp/createProtocol";
import { endpoints } from "@/core/api/endpoints";

const featureProtocolFactory = createCRUDProtocol<
  Feature,
  FeatureCreate,
  FeatureUpdate,
  number
>({
  queryKey: ["feature"],
  endpoints: {
    create: endpoints.feature.create,
    update: endpoints.feature.update,
    delete: endpoints.feature.delete,
  },
  transforms: {
    create: transformFeatureData,
    update: transformFeatureData,
    delete: (id) => ({ id }),
  },
  invalidateQueries: [["feature"]],
});

export const useFeatureProtocol = () => {
  return featureProtocolFactory();
};

// Legacy exports for backward compatibility
export const useCreateFeature = (options?) => {
  const protocol = useFeatureProtocol();
  return protocol.create(options);
};
```

### Step 3: Update Components

**Before:**
```typescript
function FeatureTable() {
  const [data, setData] = useState([]);
  // ... manual state management
}
```

**After:**
```typescript
import { ErrorBoundary } from "@/shared/mcp/ErrorBoundary";
import { useFeature } from "../api/useFeature";

function FeatureTable() {
  const featureModel = useFeature();
  
  return (
    <ErrorBoundary>
      <DataTable
        queryResult={featureModel}
        columns={columns}
      />
    </ErrorBoundary>
  );
}
```

### Step 4: Add Error Boundaries

Wrap key components with error boundaries:

```typescript
import { ErrorBoundary } from "@/shared/mcp/ErrorBoundary";

function FeaturePage() {
  return (
    <ErrorBoundary
      fallback={({ error, retry }) => (
        <ErrorDisplay error={error} onRetry={retry} />
      )}
    >
      <FeatureTable />
    </ErrorBoundary>
  );
}
```

## Benefits Checklist

After migration, you should have:

- ✅ Automatic caching and refetching
- ✅ Optimistic UI updates
- ✅ Centralized error handling
- ✅ Reduced boilerplate code
- ✅ Better performance with memoization
- ✅ Type safety throughout

## Performance Tips

1. **Use memoization** for data transformations
2. **Enable real-time updates** for dashboards: `refetchInterval: 30000`
3. **Use optimistic updates** for better UX
4. **Wrap components** in ErrorBoundary for graceful error handling

## Example: Complete Feature Migration

See `src/features/users/api/useUsers.ts` for a complete example of MCP pattern implementation.
