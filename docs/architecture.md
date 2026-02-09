# Architecture And Consistency Rules

This document captures the conventions that keep the codebase consistent and DRY.

**Component Layers**
- `src/shared/components/ui`: primitive UI building blocks only (Radix/shadcn wrappers, no app logic).
- `src/shared/components/common`: reusable app-level components (e.g., empty/error cards, confirm dialogs).
- `src/shared/components/layout`: layout primitives and shells (sidebar, headers, page layouts).
- `src/features/*`: feature-owned components, pages, hooks, schemas, and API wiring.

**State And Data**
- API access lives in `src/core/api` and is surfaced via feature hooks in `src/features/*/api`.
- Tables use `src/shared/components/data-table` and `useDataTableQuery` or `createDataTableHook`.
- Global UI/auth state lives in `src/store` with selector hooks for slices.

**Dialogs**
- For controlled/uncontrolled open state, use `useControllableState`.
- For dialogs that carry selected data, use `useDialogState`.

**Error Handling**
- Use `getErrorMessage(error, fallback)` for user-facing error messages.
- Backend differences are normalized in `src/core/api/normalizers` and `src/core/api/client`.

**Utilities**
- Shared utilities belong in `src/shared/utils` or `src/lib`.
- Extend existing helpers before adding new ones to avoid duplicates.

**Styling**
- Tailwind CSS is the single styling system.
- Compose class names with `cn` from `src/lib/utils`.

**Naming**
- Components are `PascalCase` and live in matching `.tsx` files.
- Hooks are `useX` and live in matching `useX.ts` files.
- Keep file names consistent with their exported primary symbol.
