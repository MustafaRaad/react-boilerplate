/**
 * AUTOMATED FORM SYSTEM - COMPLETE GUIDE
 * ======================================
 *
 * This guide shows how to create forms for ANY feature with minimal code.
 * The system is 100% automated - you only define field configuration!
 *
 *
 * ============================================================================
 * QUICK START - Create a Form in 3 Steps
 * ============================================================================
 *
 * STEP 1: Define Your Fields (One Config File)
 * ---------------------------------------------
 *
 * File: src/features/products/config/products.config.ts
 *
 * ```typescript
 * import { defineFields, field } from "@/shared/forms/autoForm";
 *
 * export const PRODUCT_FIELDS = defineFields({
 *   name: field.text({
 *     label: "products.name",
 *     placeholder: "products.namePlaceholder",
 *     required: true,
 *     validation: { minLength: 3 },
 *   }),
 *
 *   price: field.number({
 *     label: "products.price",
 *     placeholder: "products.pricePlaceholder",
 *     required: true,
 *     validation: { min: 0, positive: true },
 *   }),
 *
 *   category: field.select({
 *     label: "products.category",
 *     placeholder: "products.selectCategory",
 *     required: true,
 *     options: [
 *       { value: "electronics", label: "products.category.electronics" },
 *       { value: "clothing", label: "products.category.clothing" },
 *       { value: "food", label: "products.category.food" },
 *     ],
 *   }),
 *
 *   description: field.textarea({
 *     label: "products.description",
 *     placeholder: "products.descriptionPlaceholder",
 *     required: false,
 *     validation: { maxLength: 500 },
 *   }),
 *
 *   inStock: field.checkbox({
 *     label: "products.inStock",
 *     defaultValue: true,
 *   }),
 *
 *   releaseDate: field.date({
 *     label: "products.releaseDate",
 *     required: false,
 *   }),
 * });
 * ```
 *
 * STEP 2: Use AutoFormDialog in Your Page
 * ----------------------------------------
 *
 * File: src/features/products/pages/ProductsListPage.tsx
 *
 * ```typescript
 * import { AutoFormDialog } from "@/shared/forms/AutoFormDialog";
 * import { PRODUCT_FIELDS } from "../config/products.config";
 *
 * <AutoFormDialog
 *   fields={PRODUCT_FIELDS}
 *   namespace="products"
 *   mode="create"
 *   onSubmit={handleSubmit}
 * />
 * ```
 *
 * STEP 3: That's It!
 * ------------------
 * Everything is automated:
 * ✅ Schema generation (Zod)
 * ✅ Field validation
 * ✅ Form rendering
 * ✅ Error messages
 * ✅ Loading states
 * ✅ Success notifications
 * ✅ I18n support
 *
 *
 * ============================================================================
 * FIELD TYPES AVAILABLE
 * ============================================================================
 *
 * 1. TEXT FIELD
 * -------------
 * field.text({
 *   label: "namespace.fieldName",
 *   placeholder: "namespace.placeholder",
 *   description: "namespace.description",
 *   required: true,
 *   validation: {
 *     minLength: 3,
 *     maxLength: 100,
 *     pattern: /^[a-zA-Z]+$/,
 *   },
 *   defaultValue: "",
 *   showInMode: ["create", "edit"], // Optional: show only in specific modes
 *   disabled: false,
 * })
 *
 *
 * 2. EMAIL FIELD
 * --------------
 * field.email({
 *   label: "namespace.email",
 *   required: true,
 * })
 * // Automatically validates email format!
 *
 *
 * 3. PHONE/TEL FIELD
 * ------------------
 * field.tel({
 *   label: "namespace.phone",
 *   required: true,
 *   validation: {
 *     minLength: 10,
 *     maxLength: 15,
 *   },
 * })
 *
 *
 * 4. PASSWORD FIELD
 * -----------------
 * field.password({
 *   label: "namespace.password",
 *   required: true,
 *   validation: {
 *     minLength: 8,
 *   },
 *   showInMode: ["create"], // Only show in create mode
 * })
 *
 *
 * 5. NUMBER FIELD
 * ---------------
 * field.number({
 *   label: "namespace.amount",
 *   required: true,
 *   validation: {
 *     min: 0,
 *     max: 1000,
 *     integer: true,
 *     positive: true,
 *   },
 *   defaultValue: 0,
 * })
 *
 *
 * 6. SELECT/DROPDOWN FIELD
 * ------------------------
 * field.select({
 *   label: "namespace.category",
 *   required: true,
 *   options: [
 *     { value: "option1", label: "namespace.option1" },
 *     { value: "option2", label: "namespace.option2" },
 *   ],
 * })
 *
 *
 * 7. TEXTAREA FIELD
 * -----------------
 * field.textarea({
 *   label: "namespace.description",
 *   validation: {
 *     maxLength: 500,
 *   },
 * })
 *
 *
 * 8. CHECKBOX FIELD
 * -----------------
 * field.checkbox({
 *   label: "namespace.isActive",
 *   defaultValue: true,
 * })
 *
 *
 * 9. DATE FIELD
 * -------------
 * field.date({
 *   label: "namespace.birthDate",
 *   required: false,
 * })
 *
 *
 * ============================================================================
 * MODE-SPECIFIC FIELDS
 * ============================================================================
 *
 * Show fields only in CREATE or EDIT mode:
 *
 * ```typescript
 * password: field.password({
 *   showInMode: ["create"], // Only in create mode
 * }),
 *
 * approved: field.number({
 *   showInMode: ["edit"], // Only in edit mode
 * }),
 *
 * name: field.text({
 *   // No showInMode = shows in both modes
 * }),
 * ```
 *
 *
 * ============================================================================
 * COMPLETE EXAMPLES
 * ============================================================================
 *
 * EXAMPLE 1: User Management
 * --------------------------
 * ```typescript
 * export const USER_FIELDS = defineFields({
 *   name: field.text({ required: true, validation: { minLength: 2 } }),
 *   email: field.email({ required: true }),
 *   phone: field.tel({ required: true, validation: { minLength: 10 } }),
 *   role: field.select({
 *     required: true,
 *     options: [
 *       { value: "admin", label: "users.role.admin" },
 *       { value: "user", label: "users.role.user" },
 *     ],
 *   }),
 *   password: field.password({
 *     required: true,
 *     validation: { minLength: 6 },
 *     showInMode: ["create"],
 *   }),
 * });
 * ```
 *
 *
 * EXAMPLE 2: Product Management
 * -----------------------------
 * ```typescript
 * export const PRODUCT_FIELDS = defineFields({
 *   name: field.text({ required: true }),
 *   sku: field.text({ required: true, validation: { pattern: /^[A-Z0-9-]+$/ } }),
 *   price: field.number({ required: true, validation: { min: 0, positive: true } }),
 *   category: field.select({
 *     required: true,
 *     options: [
 *       { value: "electronics", label: "products.category.electronics" },
 *       { value: "clothing", label: "products.category.clothing" },
 *     ],
 *   }),
 *   description: field.textarea({ validation: { maxLength: 500 } }),
 *   inStock: field.checkbox({ defaultValue: true }),
 *   quantity: field.number({ validation: { min: 0, integer: true } }),
 * });
 * ```
 *
 *
 * EXAMPLE 3: Event Management
 * ---------------------------
 * ```typescript
 * export const EVENT_FIELDS = defineFields({
 *   title: field.text({ required: true, validation: { minLength: 5 } }),
 *   startDate: field.date({ required: true }),
 *   endDate: field.date({ required: true }),
 *   location: field.text({ required: true }),
 *   description: field.textarea({ validation: { maxLength: 1000 } }),
 *   maxAttendees: field.number({
 *     required: true,
 *     validation: { min: 1, integer: true },
 *   }),
 *   isPublic: field.checkbox({ defaultValue: true }),
 *   category: field.select({
 *     required: true,
 *     options: [
 *       { value: "conference", label: "events.category.conference" },
 *       { value: "workshop", label: "events.category.workshop" },
 *       { value: "webinar", label: "events.category.webinar" },
 *     ],
 *   }),
 * });
 * ```
 *
 *
 * ============================================================================
 * AUTOFORMDIALOG PROPS
 * ============================================================================
 *
 * ```typescript
 * <AutoFormDialog
 *   // REQUIRED
 *   fields={YOUR_FIELDS}          // Field configuration
 *   namespace="yourNamespace"     // Translation namespace
 *   onSubmit={handleSubmit}       // Submit handler
 *
 *   // OPTIONAL
 *   mode="create"                 // "create" or "edit" (default: "create")
 *   initialValues={data}          // For edit mode
 *   open={isOpen}                 // Controlled open state
 *   onOpenChange={setOpen}        // Open state callback
 *   trigger={<Button>Open</Button>}  // Custom trigger element
 *
 *   // CUSTOMIZATION
 *   title="Custom Title"          // Override default title
 *   description="Custom Desc"     // Override default description
 *   submitLabel="Save"            // Custom submit button text
 *   cancelLabel="Dismiss"         // Custom cancel button text
 *
 *   // CALLBACKS
 *   onSuccess={handleSuccess}     // Success callback
 *   onError={handleError}         // Error callback
 * />
 * ```
 *
 *
 * ============================================================================
 * BENEFITS
 * ============================================================================
 *
 * ✅ MINIMAL CODE
 *    - Only ONE config file per feature
 *    - No manual schema writing
 *    - No manual field rendering
 *    - No manual validation logic
 *
 * ✅ 100% TYPE SAFE
 *    - Full TypeScript support
 *    - Type inference from configuration
 *    - Compile-time error checking
 *
 * ✅ FULLY REUSABLE
 *    - Works for ANY feature
 *    - Consistent UX across all forms
 *    - Easy to maintain
 *
 * ✅ I18N READY
 *    - All labels are translation keys
 *    - Validation messages are translatable
 *    - Supports any language
 *
 * ✅ PRODUCTION READY
 *    - Error handling
 *    - Loading states
 *    - Toast notifications
 *    - Accessibility
 *
 *
 * ============================================================================
 * FILE STRUCTURE FOR NEW FEATURE
 * ============================================================================
 *
 * For a new "products" feature, you only need:
 *
 * src/features/products/
 * ├── config/
 * │   └── products.config.ts       ← ONLY ONE CONFIG FILE!
 * ├── pages/
 * │   └── ProductsListPage.tsx     ← Uses AutoFormDialog
 * └── components/
 *     └── ProductsTable.tsx        ← Uses AutoFormDialog
 *
 * No schema files, no validation files, no field component files needed!
 *
 *
 * ============================================================================
 * MIGRATION FROM OLD SYSTEM
 * ============================================================================
 *
 * Old way (multiple files):
 * - users.fields.ts (field definitions)
 * - users.schema.ts (validation schema)
 * - UserFormDialog.tsx (form component)
 * - ReactiveDynamicForm.tsx (field renderer)
 * Total: 4 files, ~500 lines
 *
 * New way (single file):
 * - users.config.ts (field configuration only)
 * - Use AutoFormDialog component
 * Total: 1 file, ~50 lines
 *
 * Result: 90% less code!
 *
 */

export {};
