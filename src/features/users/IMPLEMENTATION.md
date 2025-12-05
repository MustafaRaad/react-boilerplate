# Users Feature - Create & Edit Implementation Summary

## 📁 Files Created

### API Layer (Separated Logic)

1. **`src/features/users/api/useCreateUser.ts`**

   - TanStack Query mutation hook for creating users
   - Auto-handles cache invalidation
   - Callbacks for success/error handling
   - Maps form data to API format (phone_no → phone, approved boolean → 0/1)

2. **`src/features/users/api/useUpdateUser.ts`**
   - TanStack Query mutation hook for updating users
   - Auto-handles cache invalidation
   - Optional field support for partial updates
   - Maps form data to API format

## 📝 Files Modified

### Schema Updates

- **`user.schema.ts`**: Added `password` field to both create and update schemas
- **`dialogConfig.ts`**: Added password field definition with order 3

### Translation Updates

- **English (`users.json`)**: Added password label, placeholder, and validation
- **Arabic (`users.json`)**: Added Arabic translations for password field

### Component Updates

- **`UsersListPage.tsx`**:
  - Imports `useCreateUser` hook
  - Removed inline handler logic
  - Uses `createUserMutation.mutateAsync` with proper type wrapping
- **`UsersTable.tsx`**:
  - Imports `useUpdateUser` hook
  - Removed inline handler logic
  - Uses `updateUserMutation.mutateAsync` with proper type wrapping

## 🔌 API Endpoints (Already Configured)

```typescript
users: {
  create: {
    path: "/Users/addUser",
    method: "POST",
    requiresAuth: true,
  },
  update: {
    path: "/Users/updateUser",
    method: "PUT",
    requiresAuth: true,
  },
}
```

## 📤 Request Format

### Create User

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "phone": "+1234567890",
  "approved": 1,
  "role": "admin"
}
```

### Update User

```json
{
  "id": 123,
  "name": "John Doe",
  "email": "john@example.com",
  "password": "newsecret", // optional
  "phone": "+1234567890",
  "approved": 0,
  "role": "manager"
}
```

## ✨ Key Features

### DRY Architecture

- ✅ Single field definition in `dialogConfig.ts`
- ✅ Auto-generated form fields via `useDialogConfig`
- ✅ Reusable mutation hooks
- ✅ Type-safe with TypeScript generics

### Performance

- ✅ Automatic cache invalidation after mutations
- ✅ Optimistic UI updates possible
- ✅ Memoized field configurations
- ✅ Proper React Query integration

### Data Transformation

- ✅ `phone_no` (form) → `phone` (API)
- ✅ `approved` boolean → 0/1 integer
- ✅ Password handling (required for create, optional for update)

### User Experience

- ✅ Toast notifications (success/error)
- ✅ Automatic dialog closing on success
- ✅ Loading states during submission
- ✅ Real-time validation
- ✅ Proper error handling

## 🎯 Usage Pattern

### Create User Flow

1. User clicks "Add User" button
2. Dialog opens with empty form
3. User fills required fields (name, email, password, phone, role)
4. On submit → `useCreateUser` mutation executes
5. Success → Cache invalidated, toast shown, dialog closes
6. Table refreshes automatically with new data

### Edit User Flow

1. User clicks edit icon on table row
2. Dialog opens with pre-filled form data
3. User modifies fields (all optional except id)
4. On submit → `useUpdateUser` mutation executes
5. Success → Cache invalidated, toast shown, dialog closes
6. Table refreshes automatically with updated data

## 🔄 Automatic Features

- **Cache Management**: Users list automatically refetches after create/update
- **Field Generation**: All form fields auto-generated from schema
- **Translations**: Labels/placeholders auto-resolved from i18n
- **Validation**: Real-time validation with translated error messages
- **Type Safety**: Full TypeScript support throughout

## 📚 Follow This Pattern For Other Features

To implement similar dialogs for other features (products, orders, etc.):

1. **Define fields once** in `config/dialogConfig.ts`
2. **Create mutation hooks** in `api/` folder
3. **Use the hooks** in page/table components
4. **Add translations** for new fields
5. **Done!** - Everything else is automated
