# Accessibility (a11y) Documentation

## Overview

This React boilerplate includes comprehensive accessibility features to ensure the application is usable by everyone, including people with disabilities. We follow WCAG 2.1 Level AA standards as a minimum, with AAA compliance where feasible.

## Table of Contents

1. [Features](#features)
2. [Development Tools](#development-tools)
3. [Components](#components)
4. [Keyboard Navigation](#keyboard-navigation)
5. [Screen Reader Support](#screen-reader-support)
6. [Color Contrast](#color-contrast)
7. [Testing](#testing)
8. [Best Practices](#best-practices)
9. [WCAG Checklist](#wcag-checklist)

## Features

### ✅ Implemented Accessibility Features

- **Automated Linting**: ESLint with 25+ accessibility rules via `eslint-plugin-jsx-a11y`
- **Runtime Auditing**: Axe-core integration for dev mode accessibility testing
- **Keyboard Navigation**: Skip links, keyboard shortcuts, focus management
- **ARIA Support**: Labels, roles, live regions, and proper semantic HTML
- **Screen Reader Compatibility**: VoiceOver, NVDA, JAWS tested
- **Focus Management**: Auto-focus, focus trap, restore focus, roving tabindex
- **Color Contrast**: WCAG AA/AAA compliant color palette with audit tool
- **Semantic HTML**: Proper landmarks, headings, lists, and structure

## Development Tools

### ESLint Configuration

Automatic accessibility linting is enabled with comprehensive rules:

```javascript
// eslint.config.js
import jsxA11y from "eslint-plugin-jsx-a11y";

export default [
  {
    plugins: {
      "jsx-a11y": jsxA11y,
    },
    rules: {
      // Images
      "jsx-a11y/alt-text": "error",

      // ARIA
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-role": "error",

      // Keyboard Events
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/mouse-events-have-key-events": "warn",

      // Interactive Elements
      "jsx-a11y/interactive-supports-focus": "error",
      "jsx-a11y/no-noninteractive-tabindex": "error",
      "jsx-a11y/tabindex-no-positive": "error",

      // Labels
      "jsx-a11y/label-has-associated-control": "error",

      // ... 15+ more rules
    },
  },
];
```

### Axe-Core Runtime Auditing

Automatic accessibility testing in development:

```typescript
// src/main.tsx
if (import.meta.env.DEV) {
  import("@axe-core/react").then((axe) => {
    axe.default(React, ReactDOM, 1000, {
      rules: [
        { id: "color-contrast", enabled: true },
        { id: "label", enabled: true },
        { id: "button-name", enabled: true },
        { id: "link-name", enabled: true },
      ],
    });
  });
}
```

Check the browser console for accessibility violations during development.

### Color Contrast Audit Tool

A visual tool to audit color combinations (dev mode only):

```tsx
import { ColorContrastAudit } from "@/shared/components/a11y/ColorContrastAudit";

// Add to your layout
<ColorContrastAudit />;
```

Click the "Show A11y Audit" button in the bottom right to see contrast ratios for all color combinations.

## Components

### SkipToContent

Allows keyboard users to skip navigation and jump directly to main content:

```tsx
import { SkipToContent } from '@/shared/components/a11y/SkipToContent';

// Add as first element in your layout
<SkipToContent />
<Navigation />
<main id="main-content">
  {/* Your content */}
</main>
```

**Usage**: Press `Tab` on page load to reveal the skip link.

### FocusTrap

Traps keyboard focus within a container (essential for modals and dialogs):

```tsx
import { FocusTrap } from "@/shared/components/a11y/FocusTrap";

<FocusTrap enabled={isOpen} restoreFocus>
  <Dialog>
    <DialogContent>{/* Focus is trapped here */}</DialogContent>
  </Dialog>
</FocusTrap>;
```

**Features**:

- Auto-focuses first focusable element
- Tab cycles through focusable elements
- Shift+Tab cycles backward
- Restores focus on unmount

### VisuallyHidden

Hides content visually but keeps it accessible to screen readers:

```tsx
import { VisuallyHidden } from "@/shared/components/a11y/VisuallyHidden";

<button>
  <Icon />
  <VisuallyHidden>Delete item</VisuallyHidden>
</button>;
```

### LiveRegion

Announces dynamic content changes to screen readers:

```tsx
import { useAnnouncement } from "@/shared/components/a11y/LiveRegion";

function MyComponent() {
  const { announce, AnnouncementRegion } = useAnnouncement("polite");

  const handleSave = () => {
    // ... save logic
    announce("Item saved successfully");
  };

  return (
    <>
      <AnnouncementRegion />
      <button onClick={handleSave}>Save</button>
    </>
  );
}
```

**Politeness levels**:

- `polite`: Wait for user to finish current task (default)
- `assertive`: Interrupt immediately (use sparingly for errors)

## Keyboard Navigation

### Global Shortcuts

| Shortcut          | Action                                      |
| ----------------- | ------------------------------------------- |
| `Tab`             | Navigate forward through focusable elements |
| `Shift + Tab`     | Navigate backward                           |
| `Enter` / `Space` | Activate button or link                     |
| `Escape`          | Close modals, dialogs, dropdowns            |
| `Ctrl/Cmd + K`    | Quick search (if implemented)               |
| `Ctrl/Cmd + /`    | Show keyboard shortcuts help                |
| `Ctrl/Cmd + H`    | Navigate to dashboard                       |
| `Ctrl/Cmd + U`    | Navigate to users page                      |
| `Ctrl/Cmd + R`    | Navigate to roles page                      |

### Custom Shortcuts

Create custom keyboard shortcuts with the `useKeyboardShortcut` hook:

```tsx
import { useKeyboardShortcut } from "@/shared/hooks/useFocus";

useKeyboardShortcut(
  "s",
  () => {
    // Save action
    console.log("Saved!");
  },
  { ctrl: true, shift: true }
);
```

### Focus Management Hooks

```tsx
import {
  useAutoFocus,
  useRestoreFocus,
  useFocusWithin,
  useRovingTabIndex,
} from "@/shared/hooks/useFocus";

// Auto-focus element on mount
const inputRef = useAutoFocus<HTMLInputElement>();

// Restore previous focus when component unmounts
const containerRef = useRestoreFocus<HTMLDivElement>();

// Track if focus is within container
const { ref, isFocusWithin } = useFocusWithin<HTMLDivElement>();

// Implement roving tabindex for composite widgets
const { itemRefs, currentIndex } = useRovingTabIndex({
  onNavigate: (index) => console.log("Focus item:", index),
});
```

## Screen Reader Support

### ARIA Labels

Always provide accessible labels for interactive elements:

```tsx
// Button with icon only
<button aria-label="Close dialog">
  <X />
</button>

// Input with visible label
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />

// Input with aria-label
<Input aria-label="Search" type="search" />

// Input with aria-labelledby
<h2 id="section-title">Personal Information</h2>
<Input aria-labelledby="section-title" />
```

### ARIA Roles

Use appropriate ARIA roles for custom components:

```tsx
// Navigation
<nav role="navigation" aria-label="Main navigation">
  <ul role="list">
    <li role="listitem"><a href="/home">Home</a></li>
  </ul>
</nav>

// Alert
<div role="alert" aria-live="assertive">
  Error: Invalid email address
</div>

// Status
<div role="status" aria-live="polite">
  Loading...
</div>
```

### Form Error Handling

Properly associate errors with form fields:

```tsx
import { FormField } from "@/shared/components/form/FormField";

// FormField automatically handles:
// - aria-describedby for errors
// - aria-invalid when errors exist
// - role="alert" for error messages
// - aria-live="polite" for dynamic errors

<FormField field={field} label="Email">
  <Input {...field.getInputProps()} />
</FormField>;
```

### Screen Reader Announcements

Announce dynamic changes programmatically:

```tsx
import { announceToScreenReader } from "@/shared/utils/a11y";

const handleDelete = async () => {
  await deleteItem();
  announceToScreenReader("Item deleted successfully");
};
```

## Color Contrast

### WCAG Standards

We follow WCAG 2.1 contrast requirements:

| Level              | Normal Text | Large Text |
| ------------------ | ----------- | ---------- |
| **AA** (Minimum)   | 4.5:1       | 3:1        |
| **AAA** (Enhanced) | 7:1         | 4.5:1      |

**Large text** is defined as:

- 18pt (24px) or larger
- 14pt (18.66px) bold or larger

### Checking Contrast

Use the built-in contrast utilities:

```tsx
import {
  meetsContrastRequirement,
  getContrastRatio,
} from "@/shared/utils/a11y";

const foreground = "#2563eb"; // blue-600
const background = "#ffffff"; // white

const ratio = getContrastRatio(foreground, background);
console.log(`Contrast ratio: ${ratio.toFixed(2)}:1`);

const meetsAA = meetsContrastRequirement(
  foreground,
  background,
  "AA",
  "normal"
);
console.log(`Meets WCAG AA: ${meetsAA}`);
```

### Auditing Colors

Run the color contrast audit in dev mode:

1. Start the dev server: `pnpm dev`
2. Click "Show A11y Audit" button (bottom right)
3. Review all color combinations
4. Fix any failing combinations

All color combinations in this boilerplate meet WCAG AA standards.

## Testing

### Manual Testing

#### Keyboard Testing

1. **Tab Navigation**:

   - Press `Tab` to move forward
   - Press `Shift + Tab` to move backward
   - Verify focus indicators are visible
   - Ensure all interactive elements are reachable

2. **Skip Link**:

   - Press `Tab` on page load
   - Verify skip link appears
   - Press `Enter` and verify focus moves to main content

3. **Modal/Dialog**:

   - Open a modal
   - Verify focus is trapped inside
   - Press `Tab` and `Shift + Tab` to cycle
   - Press `Escape` to close
   - Verify focus returns to trigger element

4. **Keyboard Shortcuts**:
   - Test all global shortcuts (Ctrl+H, Ctrl+U, etc.)
   - Verify actions work as expected

#### Screen Reader Testing

**VoiceOver (macOS)**:

```bash
# Start VoiceOver
Cmd + F5

# Navigate
Ctrl + Option + Arrow Keys

# Interact with element
Ctrl + Option + Space
```

**NVDA (Windows)**:

```bash
# Download from: https://www.nvaccess.org/

# Start NVDA
Ctrl + Alt + N

# Navigate
Arrow Keys

# Interact
Enter or Space
```

**Testing Checklist**:

- [ ] All images have alt text
- [ ] Forms are properly labeled
- [ ] Errors are announced
- [ ] Dynamic content changes are announced
- [ ] Landmarks are correctly identified
- [ ] Heading hierarchy is logical (h1 → h2 → h3)
- [ ] Button purposes are clear

### Automated Testing

#### ESLint

Run accessibility linting:

```bash
pnpm lint
```

Fix auto-fixable issues:

```bash
pnpm lint --fix
```

#### Axe DevTools

1. Install [axe DevTools browser extension](https://www.deque.com/axe/devtools/)
2. Open DevTools → axe DevTools tab
3. Click "Scan ALL of my page"
4. Review and fix violations

#### jest-axe (Testing Library)

Add to your tests:

```typescript
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

test("should have no accessibility violations", async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Best Practices

### 1. Semantic HTML

Use semantic elements instead of divs:

```tsx
// ❌ Bad
<div onClick={handleClick}>Click me</div>

// ✅ Good
<button onClick={handleClick}>Click me</button>
```

### 2. Heading Hierarchy

Maintain logical heading structure:

```tsx
// ❌ Bad
<h1>Page Title</h1>
<h3>Section</h3> {/* Skipped h2 */}

// ✅ Good
<h1>Page Title</h1>
<h2>Section</h2>
<h3>Subsection</h3>
```

### 3. Focus Indicators

Never remove focus outlines without replacement:

```css
/* ❌ Bad */
button:focus {
  outline: none;
}

/* ✅ Good - Tailwind's focus-visible: */
button {
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring;
}
```

### 4. Alt Text

Provide descriptive alt text for images:

```tsx
// ❌ Bad
<img src="photo.jpg" alt="image" />

// ✅ Good
<img src="photo.jpg" alt="User avatar for John Doe" />

// ✅ Decorative images
<img src="decoration.svg" alt="" role="presentation" />
```

### 5. Form Labels

Every input needs an associated label:

```tsx
// ❌ Bad
<input type="text" placeholder="Email" />

// ✅ Good
<Label htmlFor="email">Email</Label>
<Input id="email" type="text" />

// ✅ Also good (programmatic)
<Input aria-label="Email" type="text" />
```

### 6. Loading States

Announce loading states to screen readers:

```tsx
// ❌ Bad
{
  isLoading && <Spinner />;
}

// ✅ Good
{
  isLoading && (
    <div role="status" aria-live="polite">
      <Spinner />
      <VisuallyHidden>Loading data...</VisuallyHidden>
    </div>
  );
}
```

### 7. Error Handling

Make errors clear and actionable:

```tsx
// ❌ Bad
<p className="text-red-500">Error</p>

// ✅ Good
<p role="alert" aria-live="polite" className="text-red-500">
  Error: Email address is invalid. Please enter a valid email.
</p>
```

### 8. Interactive Elements

Only use interactive elements for interactions:

```tsx
// ❌ Bad
<div onClick={handleClick}>Click me</div>

// ✅ Good
<button onClick={handleClick}>Click me</button>

// ✅ If you must use div, add proper ARIA
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Click me
</div>
```

## WCAG Checklist

### Level A (Must Have)

- [ ] **1.1.1 Non-text Content**: All images have alt text
- [ ] **1.3.1 Info and Relationships**: Proper semantic HTML and ARIA
- [ ] **1.3.2 Meaningful Sequence**: Logical reading order
- [ ] **1.4.1 Use of Color**: Don't rely solely on color
- [ ] **2.1.1 Keyboard**: All functionality via keyboard
- [ ] **2.1.2 No Keyboard Trap**: Can navigate away from all elements
- [ ] **2.2.1 Timing Adjustable**: User can extend time limits
- [ ] **2.4.1 Bypass Blocks**: Skip navigation link present
- [ ] **2.4.2 Page Titled**: Every page has a descriptive title
- [ ] **3.1.1 Language of Page**: `lang` attribute on `<html>`
- [ ] **4.1.1 Parsing**: Valid HTML
- [ ] **4.1.2 Name, Role, Value**: Proper ARIA implementation

### Level AA (Should Have)

- [ ] **1.4.3 Contrast (Minimum)**: 4.5:1 for normal text, 3:1 for large
- [ ] **1.4.5 Images of Text**: Use text instead of images of text
- [ ] **2.4.6 Headings and Labels**: Descriptive headings and labels
- [ ] **2.4.7 Focus Visible**: Keyboard focus indicators visible
- [ ] **3.1.2 Language of Parts**: Different languages marked
- [ ] **3.2.3 Consistent Navigation**: Navigation consistent across pages
- [ ] **3.3.1 Error Identification**: Errors clearly identified
- [ ] **3.3.2 Labels or Instructions**: Forms have labels
- [ ] **3.3.3 Error Suggestion**: Error messages suggest fixes
- [ ] **3.3.4 Error Prevention**: Reversible/confirmable submissions

### Level AAA (Nice to Have)

- [ ] **1.4.6 Contrast (Enhanced)**: 7:1 for normal text, 4.5:1 for large
- [ ] **2.1.3 Keyboard (No Exception)**: All functionality keyboard accessible
- [ ] **2.4.8 Location**: User knows where they are in the site
- [ ] **2.4.9 Link Purpose (Link Only)**: Link text describes destination
- [ ] **3.1.3 Unusual Words**: Definitions provided for jargon
- [ ] **3.2.5 Change on Request**: Context changes only on user request

## Resources

### Tools

- [axe DevTools](https://www.deque.com/axe/devtools/) - Browser extension for accessibility testing
- [WAVE](https://wave.webaim.org/) - Web accessibility evaluation tool
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Built into Chrome DevTools
- [Color Contrast Analyzer](https://www.tpgi.com/color-contrast-checker/) - Desktop app for contrast checking

### Documentation

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/) - Comprehensive accessibility resources

### Screen Readers

- [NVDA](https://www.nvaccess.org/) - Free screen reader for Windows
- [JAWS](https://www.freedomscientific.com/products/software/jaws/) - Popular screen reader for Windows
- VoiceOver - Built into macOS/iOS
- TalkBack - Built into Android

## Support

For accessibility issues or questions:

1. Check the [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
2. Review component documentation in this file
3. Run automated tests (ESLint + axe-core)
4. Test with actual screen readers
5. Create an issue with reproduction steps

---

**Remember**: Accessibility is not a feature to be added at the end—it's a fundamental aspect of web development that should be considered from the start. 🌟
