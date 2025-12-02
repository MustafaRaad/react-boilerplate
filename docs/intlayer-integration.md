# Intlayer Integration Guide

This project integrates Intlayer with i18next to provide enhanced translation management capabilities while keeping the existing i18next runtime.

## Setup Complete ✅

The following has been configured:

1. **Intlayer packages installed**:

   - `intlayer` - Core library and CLI
   - `@intlayer/sync-json-plugin` - Syncs dictionaries to JSON files

2. **Configuration file**: `intlayer.config.ts` at project root

   - Configured for English and Arabic locales
   - JSON files stored in `src/locales/{locale}/{namespace}.json`

3. **Locale files converted**:

   - All `.ts` locale files now have `.json` equivalents
   - `i18n.ts` updated to import JSON files instead of TypeScript modules

4. **NPM scripts added**:

   - `pnpm intlayer:build` - Build/sync dictionaries
   - `pnpm intlayer:push` - Push translations to Intlayer CMS
   - `pnpm intlayer:fill` - AI auto-fill missing translations

5. **AI provider configured** (optional):
   - OpenAI integration for automatic translation filling
   - Configure with `OPENAI_API_KEY` in `.env` file

## Project Structure

```
src/
  locales/
    en/
      common.json       ← i18next resources (synced by Intlayer)
      common.ts         ← Legacy TypeScript (can be removed)
      users.json        ← i18next resources
      users.ts          ← Legacy TypeScript (can be removed)
    ar/
      common.json
      common.ts         ← Legacy TypeScript (can be removed)
      users.json
      users.ts          ← Legacy TypeScript (can be removed)
  core/
    i18n/
      i18n.ts           ← i18next setup (now imports JSON files)

intlayer.config.ts      ← Intlayer configuration
```

## Usage

### Current State: i18next Runtime

The application continues to use i18next for runtime translations:

```tsx
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation("common");
  return <h1>{t("welcome")}</h1>;
}
```

### Creating New Translations with Intlayer

You can now create Intlayer content declaration files:

```typescript
// src/features/invoices/content/invoices.content.ts
import { t, type DeclarationContent } from "intlayer";

const invoicesContent = {
  key: "invoices",
  content: {
    title: t({
      en: "Invoices",
      ar: "الفواتير",
    }),
    description: t({
      en: "Manage your invoices",
      ar: "إدارة الفواتير الخاصة بك",
    }),
    // ... more translations
  },
} satisfies DeclarationContent;

export default invoicesContent;
```

Then build with Intlayer CLI:

```bash
pnpm intlayer:build
```

This will:

1. Scan for `*.content.ts` files
2. Extract translations
3. Sync to `src/locales/{locale}/{key}.json`
4. Make them available to i18next

### Intlayer CLI Commands

#### Build/Sync Dictionaries

```bash
pnpm intlayer:build
```

Scans content declaration files and syncs translations to JSON files.

#### Auto-Fill Missing Translations (AI-powered)

```bash
pnpm intlayer:fill
```

Uses AI to automatically fill missing translation keys across all locales. Requires OpenAI API key configured in `.env`:

```bash
OPENAI_API_KEY=sk-your-api-key-here
```

The `.env` file is gitignored for security. See `.env.example` for reference.

#### Push to Intlayer CMS

````bash
pnpm intlayer:push
**Option 2: Intlayer content files** (Recommended for new features)

1. Create `*.content.ts` file with translations
2. Run `pnpm intlayer:build`
3. JSON files are auto-generated
4. Use with `t()` from `useTranslation`

**Option 3: AI-powered auto-fill** (For missing translations)

1. Add translations to one locale (e.g., English)
2. Run `pnpm intlayer:fill`
3. AI automatically translates to other locales
4. Review and adjust as needed
### Adding New Translations

**Option 1: Direct JSON editing** (Traditional)

1. Edit `src/locales/en/{namespace}.json`
2. Edit `src/locales/ar/{namespace}.json`
3. Use with `t()` from `useTranslation`

**Option 2: Intlayer content files** (Recommended for new features)

1. Create `*.content.ts` file with translations
2. Run `pnpm intlayer:build`
3. JSON files are auto-generated
4. Use with `t()` from `useTranslation`

### Managing Translations

With Intlayer CMS (optional):

1. Push dictionaries: `pnpm intlayer:push`
2. Collaborate on translations via Intlayer web interface
3. Pull updates back to your project
4. Build to sync to JSON files

## Benefits

✅ **Type-safe translations** in content declaration files
✅ **Centralized translation management** with Intlayer CMS
✅ **AI-powered auto-fill** for missing translations
✅ **Auto-completion** for translation keys
✅ **No breaking changes** - i18next runtime unchanged
✅ **Backward compatible** - existing translations continue to work
✅ **Scalable** - easy to add new languages

## Migration Notes

### Legacy TypeScript Files

The old `.ts` locale files (`common.ts`, `users.ts`) can now be safely removed since:

- JSON equivalents exist
- `i18n.ts` imports JSON files
- All functionality preserved

To clean up:

```bash
rm src/locales/en/*.ts
rm src/locales/ar/*.ts
````

### Adding New Namespaces

When adding a new namespace (e.g., "invoices"):

1. Create content file:

```typescript
// src/features/invoices/content/invoices.content.ts
import { t, type DeclarationContent } from "intlayer";

const content = {
  key: "invoices", // ← namespace name
  content: {
    /* translations */
  },
} satisfies DeclarationContent;

export default content;
```

2. Build:

```bash
pnpm intlayer:build
```

3. Register in i18n.ts:

```typescript
import enInvoices from "@/locales/en/invoices.json";
import arInvoices from "@/locales/ar/invoices.json";

export const resources = {
  en: {
    common: enCommon,
    users: enUsers,
    invoices: enInvoices, // ← add here
  },
  ar: {
    common: arCommon,
    users: arUsers,
    invoices: arInvoices, // ← add here
  },
};
```

4. Use in components:

```typescript
const { t } = useTranslation("invoices");
```

## Troubleshooting

### AI auto-fill not working

Ensure `OPENAI_API_KEY` is set in your `.env` file (not `.env.example`):

```bash
OPENAI_API_KEY=sk-your-actual-key
```

The `.env` file is gitignored for security.

### JSON imports not working

Ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "resolveJsonModule": true
  }
}
```

### Intlayer CLI not found

Reinstall dependencies:

```bash
pnpm install
```

### Sync not working

Check `intlayer.config.ts` paths match your project structure.

## Resources

- [Intlayer Documentation](https://intlayer.org/docs)
- [Intlayer with next-i18next Blog Post](https://intlayer.org/blog/intlayer-with-next-i18next)
- [i18next Documentation](https://www.i18next.com/)

## Next Steps

1. ✅ Intlayer is installed and configured
2. ✅ JSON files are synced
3. ✅ i18next uses JSON resources
4. 📝 Create your first `*.content.ts` file
5. 🚀 Run `pnpm intlayer:build` to test
6. 🌐 (Optional) Set up Intlayer CMS for team collaboration
