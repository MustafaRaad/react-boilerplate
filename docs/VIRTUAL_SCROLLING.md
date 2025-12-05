# Virtual Scrolling Guide

## Overview

Virtual scrolling is implemented in the `DataTable` component using `@tanstack/react-virtual`. It renders only visible rows, dramatically improving performance for large datasets.

## When to Use

✅ **Use Virtual Scrolling When:**

- Tables have 100+ rows
- Users need to scroll through large datasets
- Client-side pagination with many rows
- Performance issues with rendering many DOM elements

❌ **Don't Use When:**

- Server-side pagination (already handles chunks)
- Small datasets (< 50 rows)
- Tables with variable row heights

## Usage

### Basic Implementation

```tsx
import { DataTable } from "@/shared/components/data-table/DataTable";

function MyComponent() {
  const { data } = useLargeDataset(); // 1000+ items

  return (
    <DataTable
      columns={columns}
      data={data}
      enableVirtualization={true} // Enable virtual scrolling
      estimateRowHeight={53} // Optional: default is 53px
    />
  );
}
```

### With Query Result

```tsx
<DataTable
  columns={columns}
  queryResult={largeQuery}
  enableVirtualization={true}
/>
```

## Configuration

### Props

| Prop                   | Type      | Default | Description                    |
| ---------------------- | --------- | ------- | ------------------------------ |
| `enableVirtualization` | `boolean` | `false` | Enable virtual scrolling       |
| `estimateRowHeight`    | `number`  | `53`    | Estimated row height in pixels |

### Performance Settings

The virtualizer is configured with:

- **Overscan**: 5 rows (renders 5 extra rows above/below viewport)
- **Max Height**: 600px scrollable container
- **Mode**: Client-side only (disabled for server pagination)

## Performance Impact

### Before (1000 rows):

- DOM Nodes: ~10,000+ elements
- Initial Render: ~500-1000ms
- Memory: High (all rows in DOM)
- Scrolling: Janky at 1000+ rows

### After (Virtual Scrolling):

- DOM Nodes: ~20-30 elements (only visible)
- Initial Render: ~50-100ms
- Memory: Low (minimal DOM)
- Scrolling: Smooth 60fps

## Examples

### Large User Table

```tsx
// features/users/components/UsersTable.tsx
export const UsersTable = memo(function UsersTable() {
  const usersQuery = useUsers(); // 500+ users

  return (
    <DataTable
      columns={columns}
      queryResult={usersQuery}
      enableVirtualization={true}
      enableColumnFilters
      showExport
      actions={actions}
    />
  );
});
```

### Custom Row Height

```tsx
<DataTable
  columns={columns}
  data={products}
  enableVirtualization={true}
  estimateRowHeight={80} // Taller rows
/>
```

## Important Notes

1. **Server Pagination**: Virtual scrolling is automatically disabled when using server-side pagination (mode === "server")

2. **Row Heights**: For best performance, rows should have consistent heights. If heights vary significantly, increase `overscan`.

3. **Filters**: Column filters work seamlessly with virtual scrolling.

4. **Export**: CSV export includes all filtered data, not just visible rows.

5. **Performance Monitoring**: Use React DevTools Profiler to measure improvement.

## Troubleshooting

### Scrolling feels laggy

- Decrease `overscan` (try 3)
- Increase `estimateRowHeight` accuracy
- Check for expensive cell renderers

### Rows appear/disappear unexpectedly

- Increase `overscan` to 10+
- Ensure consistent row heights

### Virtual scrolling not working

- Check mode is "client" (not server pagination)
- Verify `enableVirtualization={true}` is set
- Ensure parent container has fixed height

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile: ✅ Full support (touch scrolling)

## Related

- [TanStack Virtual Docs](https://tanstack.com/virtual/latest)
- [DataTable Component](../src/shared/components/data-table/DataTable.tsx)
- [Performance Guide](./PERFORMANCE_IMPROVEMENTS.md)
