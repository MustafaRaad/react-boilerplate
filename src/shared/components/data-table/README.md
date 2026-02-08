# Data Table - Single Source of Truth

This directory contains the **ONLY** data table implementation for the entire application. All data tables must use components from this directory to ensure consistency, performance, and maintainability.

## Architecture

The data table system follows the **MCP (Model-Component-Protocol)** pattern:

- **Model**: TanStack Query hooks for data fetching (`useUsers`, etc.)
- **Component**: `DataTable` component - the single source of truth
- **Protocol**: Mutation hooks for CRUD operations (`useUserProtocol`, etc.)

## Core Component

### `DataTable`

The main data table component - **this is the ONLY way to render data tables**.

**Location:** `src/shared/components/data-table/DataTable.tsx`

**Features:**
- ✅ Automatic pagination (URL-based)
- ✅ Column filtering
- ✅ Sorting
- ✅ Virtual scrolling for large datasets
- ✅ Export to CSV
- ✅ Loading states
- ✅ Error handling
- ✅ Actions column
- ✅ Real-time updates support

**Usage:**
```typescript
import { DataTable } from "@/shared/components/data-table";
import { useUsers } from "@/features/users/api/useUsers";
import { useUsersColumns } from "./columns";

function UsersTable() {
  const usersModel = useUsers(); // MCP Model
  const columns = useUsersColumns();
  
  return (
    <DataTable
      queryResult={usersModel}
      columns={columns}
      enableColumnFilters
      showExport
      actions={actions}
    />
  );
}
```

## Supporting Components

### `DataTableActions`
Handles action buttons (edit, delete, view, etc.)

### `DataTablePagination`
Pagination controls with URL synchronization

### `DataTableSkeleton`
Loading skeleton for better UX

### `exportToCsv`
CSV export functionality

## Direct Usage (Recommended)

Use `DataTable` directly with MCP patterns - this is the simplest and most flexible approach:

```typescript
import { DataTable } from "@/shared/components/data-table";
import { ErrorBoundary } from "@/shared/mcp/ErrorBoundary";
import { useUsers } from "@/features/users/api/useUsers";

function UsersTable() {
  const usersModel = useUsers(); // MCP Model
  
  return (
    <ErrorBoundary>
      <DataTable
        queryResult={usersModel}
        columns={columns}
        actions={actions}
        enableColumnFilters
        showExport
      />
    </ErrorBoundary>
  );
}
```

## MCP Pattern Integration

### Model Layer
```typescript
// src/features/users/api/useUsers.ts
export const useUsers = () => {
  const query = createDataTableHook<User>("users", endpoints.users.list)();
  // ... data transformations
  return query;
};
```

### Protocol Layer
```typescript
// src/features/users/api/useUsers.ts
export const useUserProtocol = () => {
  return createCRUDProtocol({...})();
};
```

### Component Layer
```typescript
// src/features/users/components/UsersTable.tsx
export const UsersTable = () => {
  const usersModel = useUsers(); // Model
  const userProtocol = useUserProtocol(); // Protocol
  
  return (
    <ErrorBoundary>
      <DataTable
        queryResult={usersModel}
        columns={columns}
        actions={actions}
      />
    </ErrorBoundary>
  );
};
```

## Best Practices

1. **Always use `DataTable`** - Never create custom table implementations
2. **Use MCP patterns** - Model for data, Protocol for mutations
3. **Wrap in ErrorBoundary** - Handle errors gracefully
4. **Memoize columns and actions** - Performance optimization
5. **Use queryResult prop** - Better integration with TanStack Query

## Performance Optimizations

- ✅ Memoized components
- ✅ Virtual scrolling for large datasets
- ✅ Debounced filters
- ✅ URL-based pagination (shareable links)
- ✅ Automatic query caching
- ✅ Optimized re-renders

## Type Safety

Full TypeScript support throughout:
- Column definitions are type-safe
- Actions are type-safe
- Query results are type-safe
- All props are validated

## Migration Guide

**Before (Custom Implementation):**
```typescript
function CustomTable() {
  const [data, setData] = useState([]);
  // ... lots of boilerplate
}
```

**After (Single Source of Truth):**
```typescript
function UsersTable() {
  const usersModel = useUsers();
  return <DataTable queryResult={usersModel} columns={columns} />;
}
```

## File Structure

```
src/shared/components/data-table/
├── DataTable.tsx              # Main component (SINGLE SOURCE OF TRUTH)
├── DataTableActions.tsx       # Action buttons
├── DataTablePagination.tsx    # Pagination controls
├── DataTableSkeleton.tsx       # Loading skeleton
├── export-csv.ts              # CSV export
├── autoColumns.ts             # Auto column generation
├── filters.ts                 # Filter utilities
└── index.ts                   # Central exports
```

## Examples

See `src/features/users/components/UsersTable.tsx` for a complete example of the single source of truth pattern.
