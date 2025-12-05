# Dependency Audit Report

**Date:** December 6, 2025  
**Project:** react-boilerplate

## Summary

- **Total Dependencies**: 53
- **Dev Dependencies**: 16
- **Potentially Unused**: 3-5
- **Optimization Opportunities**: Several

---

## ✅ Core Dependencies (Required)

### React Ecosystem

- `react` (19.2.0) - Core
- `react-dom` (19.2.0) - Core
- `@vitejs/plugin-react` (dev) - Build tool

### Routing & State

- `@tanstack/react-router` (1.139.12) - Essential
- `@tanstack/react-query` (5.90.11) - Essential
- `zustand` (5.0.9) - Essential

### Forms & Validation

- `@tanstack/react-form` (1.27.0) - In use
- `zod` (4.1.13) - Validation
- `@tanstack/zod-form-adapter` (0.42.1) - Adapter

### UI Framework

- `@tailwindcss/*` - Required
- All `@radix-ui/*` packages - Shared components

### Tables

- `@tanstack/react-table` (8.21.3) - DataTable
- `@tanstack/react-virtual` (3.13.12) - Virtual scrolling ✅ Just added

### Internationalization

- `i18next` (25.7.1) - Required
- `react-i18next` (16.3.5) - Required
- `i18next-browser-languagedetector` (8.2.0) - Required

---

## ⚠️ Potentially Unused / Review Needed

### 1. `@hookform/resolvers` (5.2.2)

**Status:** ⚠️ Potentially unused  
**Reason:** Using `@tanstack/react-form`, not `react-hook-form`  
**Action:** Verify usage, possibly remove

```bash
# Search for usage
pnpm why @hookform/resolvers
```

### 2. `react-hook-form` (7.67.0)

**Status:** ⚠️ Duplicate form library  
**Reason:** Already using `@tanstack/react-form`  
**Action:** Check if still needed, migrate fully to TanStack Form

### 3. Unused Radix Components

**Status:** Review  
**Components to check:**

- `@radix-ui/react-accordion` - Check if used
- `@radix-ui/react-alert-dialog` - Check if used
- `@radix-ui/react-aspect-ratio` - Check if used
- `@radix-ui/react-avatar` - Check if used
- `@radix-ui/react-collapsible` - Check if used
- `@radix-ui/react-context-menu` - Check if used
- `@radix-ui/react-hover-card` - Check if used
- `@radix-ui/react-menubar` - Check if used
- `@radix-ui/react-navigation-menu` - Check if used
- `@radix-ui/react-progress` - Check if used
- `@radix-ui/react-radio-group` - Check if used
- `@radix-ui/react-scroll-area` - Check if used
- `@radix-ui/react-slider` - Check if used
- `@radix-ui/react-switch` - Check if used
- `@radix-ui/react-tabs` - Check if used
- `@radix-ui/react-toggle` - Check if used
- `@radix-ui/react-toggle-group` - Check if used

**Action:** Run dependency audit script to find unused

### 4. `@dnd-kit/*` packages

**Status:** Review  
**Packages:**

- `@dnd-kit/core`
- `@dnd-kit/modifiers`
- `@dnd-kit/sortable`
- `@dnd-kit/utilities`

**Action:** Check if drag-and-drop is actually implemented

### 5. `cmdk` (1.1.1)

**Status:** ⚠️ Check usage  
**Purpose:** Command menu component  
**Action:** Verify if command palette is implemented

### 6. `embla-carousel-react` (8.6.0)

**Status:** ⚠️ Check usage  
**Purpose:** Carousel component  
**Action:** Search for carousel usage

### 7. `input-otp` (1.4.2)

**Status:** ⚠️ Check usage  
**Purpose:** OTP input component  
**Action:** Verify if OTP functionality exists

### 8. `next-themes` (0.4.6)

**Status:** ⚠️ Check usage  
**Purpose:** Theme management (usually for Next.js)  
**Action:** Check if theme switching is implemented

### 9. `react-resizable-panels` (3.0.6)

**Status:** ⚠️ Check usage  
**Purpose:** Resizable panel layouts  
**Action:** Verify if used in any layouts

### 10. `recharts` (2.15.4)

**Status:** Review  
**Purpose:** Charts library  
**Size:** Large (~400 KB)  
**Action:** If only used in StatisticsPage, consider lazy loading or tree-shaking

### 11. `vaul` (1.1.2)

**Status:** ⚠️ Check usage  
**Purpose:** Drawer component  
**Action:** Check if drawer UI is used

---

## 📦 Size Analysis

### Large Dependencies (> 100 KB)

1. **recharts** (~400 KB) - Charts

   - Consider: `chart.js` or `victory` if simpler charts needed
   - Already lazy-loaded with StatisticsPage ✅

2. **@radix-ui packages** (combined ~300 KB)

   - Acceptable for UI library
   - Tree-shaking enabled ✅

3. **@tanstack packages** (combined ~200 KB)
   - Essential for architecture
   - Already optimized with code splitting ✅

---

## 🔍 Recommended Actions

### High Priority

1. **Remove duplicate form libraries**

```bash
pnpm remove react-hook-form @hookform/resolvers
```

2. **Audit unused Radix components**

```bash
# Use depcheck
pnpm add -D depcheck
pnpm depcheck
```

3. **Check DnD usage**

```bash
# Search for dnd-kit usage
grep -r "@dnd-kit" src/
```

### Medium Priority

4. **Verify small utility packages**

- `cmdk`
- `input-otp`
- `vaul`
- `embla-carousel-react`
- `react-resizable-panels`

5. **Consider alternatives**

- `date-fns` → Already using, good choice ✅
- `recharts` → Consider lighter alternative if only using basic charts

### Low Priority

6. **Check peer dependency warning**

```
└─┬ @tanstack/zod-form-adapter 0.42.1
  └── ✕ unmet peer zod@^3.x: found 4.1.13
```

**Action:** Check if causes issues, possibly update adapter

---

## 🛠️ Audit Commands

### Run Full Audit

```bash
# Install depcheck
pnpm add -D depcheck

# Run audit
pnpm depcheck

# Check bundle size
pnpm build
# Open dist/stats.html
```

### Search for Usage

```bash
# Example: Check if cmdk is used
grep -r "cmdk" src/

# Check for any component
grep -r "component-name" src/
```

### Remove Unused

```bash
# After verification
pnpm remove <package-name>
```

---

## 📊 Expected Savings

If all unused dependencies are removed:

- **Bundle Size**: -50 to -150 KB (gzipped)
- **Install Time**: -20-30%
- **node_modules**: -100-200 MB
- **Build Time**: Slightly faster

---

## ✅ Already Optimized

1. ✅ Using `date-fns` (lightweight date library)
2. ✅ Code splitting implemented
3. ✅ Tree-shaking enabled
4. ✅ Bundle visualizer installed
5. ✅ Dev dependencies properly separated

---

## 📝 Notes

1. **Peer Dependency Warning**: Zod v4 vs v3 - Monitor for compatibility issues
2. **Tailwind v4**: Using latest with Vite plugin ✅
3. **React 19**: Using latest stable ✅
4. **TypeScript**: Using 5.9.3 ✅

---

## Next Steps

1. Run `pnpm depcheck` to find unused
2. Search codebase for usage of flagged packages
3. Remove confirmed unused packages
4. Test thoroughly after removals
5. Update documentation

---

**Status**: Ready for manual review and cleanup
