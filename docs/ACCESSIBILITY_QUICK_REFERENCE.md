# Accessibility (a11y) Quick Reference

Quick reference for accessibility features in this React boilerplate.

## ⚡ Quick Start

### Run Accessibility Checks

```bash
# ESLint accessibility linting
pnpm lint

# Start dev server with axe-core auditing
pnpm dev
# Check browser console for violations

# Show color contrast audit
# Click "Show A11y Audit" button (bottom right in dev mode)
```

### Keyboard Testing

1. Press `Tab` on page load → Skip link should appear
2. Use `Tab`/`Shift+Tab` to navigate
3. Test global shortcuts (Ctrl+H, Ctrl+U, Ctrl+R, Ctrl+/)
4. Open modal → Focus should be trapped
5. Press `Escape` → Modal closes, focus restored

## 🎯 Components

| Component            | Import                                        | Use Case               |
| -------------------- | --------------------------------------------- | ---------------------- |
| `SkipToContent`      | `@/shared/components/a11y/SkipToContent`      | Skip navigation link   |
| `FocusTrap`          | `@/shared/components/a11y/FocusTrap`          | Trap focus in modals   |
| `VisuallyHidden`     | `@/shared/components/a11y/VisuallyHidden`     | Screen reader only     |
| `LiveRegion`         | `@/shared/components/a11y/LiveRegion`         | Dynamic announcements  |
| `KeyboardShortcuts`  | `@/shared/components/a11y/KeyboardShortcuts`  | Global shortcuts       |
| `ColorContrastAudit` | `@/shared/components/a11y/ColorContrastAudit` | Contrast testing (dev) |

## 🎹 Keyboard Shortcuts

| Shortcut        | Action            |
| --------------- | ----------------- |
| `Tab`           | Navigate forward  |
| `Shift+Tab`     | Navigate backward |
| `Enter`/`Space` | Activate          |
| `Escape`        | Close modals      |
| `Ctrl/Cmd+K`    | Quick search      |
| `Ctrl/Cmd+/`    | Show help         |
| `Ctrl/Cmd+H`    | Go to dashboard   |
| `Ctrl/Cmd+U`    | Go to users       |
| `Ctrl/Cmd+R`    | Go to roles       |

## 🪝 Hooks

```tsx
import {
  useAutoFocus,
  useRestoreFocus,
  useFocusWithin,
  useRovingTabIndex,
  useKeyboardShortcut,
} from "@/shared/hooks/useFocus";

// Auto-focus on mount
const inputRef = useAutoFocus<HTMLInputElement>();

// Restore focus on unmount
const containerRef = useRestoreFocus<HTMLDivElement>();

// Track focus within container
const { ref, isFocusWithin } = useFocusWithin<HTMLDivElement>();

// Roving tabindex for lists
const { itemRefs, currentIndex } = useRovingTabIndex({ onNavigate: (i) => {} });

// Custom keyboard shortcut
useKeyboardShortcut("s", () => save(), { ctrl: true });
```

## 🛠️ Utilities

```tsx
import {
  generateId,
  announceToScreenReader,
  getContrastRatio,
  meetsContrastRequirement,
  trapFocus,
  getFocusableElements,
  getAccessibleName,
} from "@/shared/utils/a11y";

// Generate unique ID for ARIA
const id = generateId("prefix");

// Announce to screen reader
announceToScreenReader("Item saved");

// Check color contrast
const ratio = getContrastRatio("#2563eb", "#ffffff");
const meetsAA = meetsContrastRequirement("#2563eb", "#ffffff", "AA", "normal");
```

## ✅ Common Patterns

### Skip Link

```tsx
<SkipToContent />
<Navigation />
<main id="main-content">{/* content */}</main>
```

### Modal with Focus Trap

```tsx
<FocusTrap enabled={isOpen} restoreFocus>
  <Dialog open={isOpen}>
    <DialogContent>{/* content */}</DialogContent>
  </Dialog>
</FocusTrap>
```

### Icon-Only Button

```tsx
<button aria-label="Close dialog">
  <X />
</button>
```

### Form with Errors

```tsx
<FormField field={field} label="Email">
  <Input {...field.getInputProps()} />
</FormField>
// Automatically adds aria-describedby, aria-invalid, role="alert"
```

### Screen Reader Announcement

```tsx
const { announce, AnnouncementRegion } = useAnnouncement("polite");

const handleSave = () => {
  // ... save logic
  announce("Saved successfully");
};

return (
  <>
    <AnnouncementRegion />
    <button onClick={handleSave}>Save</button>
  </>
);
```

### Loading State

```tsx
{
  isLoading && (
    <div role="status" aria-live="polite">
      <Spinner />
      <VisuallyHidden>Loading...</VisuallyHidden>
    </div>
  );
}
```

## 🎨 Color Contrast

| Level   | Normal Text | Large Text (18pt+) |
| ------- | ----------- | ------------------ |
| **AA**  | 4.5:1       | 3:1                |
| **AAA** | 7:1         | 4.5:1              |

All colors in this boilerplate meet WCAG AA standards.

## 🧪 Testing

### ESLint Rules (25+)

- `alt-text`: Images must have alt text
- `aria-props`: Valid ARIA properties
- `click-events-have-key-events`: Keyboard support for click handlers
- `label-has-associated-control`: Forms must have labels
- `tabindex-no-positive`: No positive tabindex values

### Manual Testing Checklist

- [ ] Tab through all interactive elements
- [ ] Test skip link (Tab on page load)
- [ ] Open modal → focus trapped, Escape closes
- [ ] Test keyboard shortcuts
- [ ] Check focus indicators visible
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Run color contrast audit

### Automated Tools

- **ESLint**: `pnpm lint`
- **Axe-core**: Check console in dev mode
- **Axe DevTools**: Browser extension
- **Lighthouse**: Chrome DevTools → Lighthouse → Accessibility

## 📚 Resources

- [Full Documentation](./ACCESSIBILITY.md)
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [axe DevTools Extension](https://www.deque.com/axe/devtools/)

---

**Tip**: Press `Ctrl/Cmd + /` in the app to see all keyboard shortcuts!
