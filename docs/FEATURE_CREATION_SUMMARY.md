# Feature Creation - Quick Reference

**Last Updated:** January 2025

## 🚀 Quick Start Checklist

### 1. Folder Structure
```
src/features/[feature]/
├── api/use[Feature].ts        # MCP Model & Protocol
├── components/
│   ├── [Feature]Table.tsx
│   └── [Feature]Table.columns.tsx
├── utils/                     # ✨ NEW
│   └── [feature]Transformers.ts
├── schemas/
│   └── [feature].schema.ts
└── types/index.ts
```

### 2. Key Patterns

#### MCP Model (Data Fetching)
```typescript
export const useProducts = () => {
  const query = createDataTableHook<Product>("products", endpoints.products.list)();
  // Add transformations here
  return query;
};
```

#### MCP Protocol (Mutations)
```typescript
const productProtocolFactory = createCRUDProtocol<
  ProductFormData,
  ProductUpdateData,
  number
>({
  queryKey: ["products"],
  endpoints: { create, update, delete },
  transforms: { create, update, delete },
  invalidateQueries: [["products"]],
  optimisticUpdate: { queryKey: ["products"], updater },
});
```

#### Component (UI)
```typescript
// Table Component
export const ProductsTable = () => {
  const productsModel = useProducts(); // Model
  const protocol = useProductProtocol(); // Protocol
  
  return (
    <ErrorBoundary>
      <DataTable queryResult={productsModel} columns={columns} />
    </ErrorBoundary>
  );
};

// Page Component with PageHeader
export const ProductsPage = () => {
  const { t } = useTranslation("products");
  const headerActions: PageHeaderAction[] = [
    {
      label: "Add Product",
      icon: RiAddLine,
      onClick: () => createDialog.open(),
      variant: "default",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("list.title")}
        description={t("list.description")}
        icon={RiBoxLine}
        variant="list"
        actions={headerActions}
      />
      <ProductsTable />
    </div>
  );
};
```

### 3. Required Files

- ✅ Schema with Zod validation
- ✅ Types exported from schema
- ✅ Endpoints registered in `endpoints.ts`
- ✅ Model hook (data fetching)
- ✅ Protocol factory (CRUD operations)
- ✅ Transformers utility (data conversion)
- ✅ Table component with ErrorBoundary
- ✅ Column definitions
- ✅ Page component with `PageHeader`
- ✅ Route added to router
- ✅ Navigation item added
- ✅ Translations (en + ar)

### 4. Best Practices

1. **Always use MCP patterns** - Model for data, Protocol for mutations
2. **Add ErrorBoundary** - Wrap table components
3. **Use transformers** - Centralize data conversion logic
4. **Enable optimistic updates** - Better UX with instant feedback
5. **Memoize expensive operations** - Performance optimization
6. **Type everything** - Full TypeScript support

### 5. Testing Checklist

- [ ] List loads correctly
- [ ] Create operation works
- [ ] Update operation works (with optimistic update)
- [ ] Delete operation works (with optimistic update)
- [ ] Error boundaries catch errors
- [ ] Cache invalidation works
- [ ] Translations display correctly
- [ ] RTL layout works in Arabic

---

**Full Guide:** See [FEATURE_CREATION_FLOW.md](./FEATURE_CREATION_FLOW.md) for detailed step-by-step instructions.
