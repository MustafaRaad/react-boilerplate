/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 *
 * USER FORM CONFIGURATION - Single Source of Truth
 * ================================================
 *
 * This is the ONLY file you need to define for user forms!
 * Everything else is automated from this configuration.
 *
 * The system automatically generates:
 * - Zod validation schema
 * - Form fields rendering
 * - Default values
 * - Error messages
 * - Table columns (coming soon)
 *
 * To add a new field: Just add it to USER_FIELDS below!
 */

import { defineFields, field } from "@/shared/forms/autoForm";

/**
 * Complete user form field configuration
 * This is the single source of truth for ALL user-related forms
 */
export const USER_FIELDS = defineFields({
  name: field.text({
    label: "fields.name",
    placeholder: "placeholders.name",
    description: "descriptions.name",
    required: true,
    validation: {
      minLength: 2,
    },
  }),

  email: field.email({
    label: "fields.email",
    placeholder: "placeholders.email",
    description: "descriptions.email",
    required: true,
  }),

  phone_no: field.tel({
    label: "fields.phone_no",
    placeholder: "placeholders.phone_no",
    description: "descriptions.phone_no",
    required: true,
    validation: {
      minLength: 10,
      maxLength: 15,
    },
  }),

  role: field.select({
    label: "fields.role",
    placeholder: "placeholders.role",
    description: "descriptions.role",
    required: true,
    options: [
      { value: "admin", label: "options.role.admin" },
      { value: "staff", label: "options.role.staff" },
      { value: "user", label: "options.role.user" },
    ],
  }),

  password: field.password({
    label: "fields.password",
    placeholder: "placeholders.password",
    description: "descriptions.password",
    required: true,
    validation: {
      minLength: 6,
    },
    showInMode: ["create"], // Only show in create mode
  }),

  approved: field.checkbox({
    label: "fields.approved",
    description: "descriptions.approved",
    defaultValue: false,
  }),
});

// Export type-safe field names
export type UserFieldName = keyof typeof USER_FIELDS;

/**
 * Example: Define a product form in just a few lines!
 *
 * export const PRODUCT_FIELDS = defineFields({
 *   name: field.text({ required: true, validation: { minLength: 3 } }),
 *   price: field.number({ required: true, validation: { min: 0, positive: true } }),
 *   category: field.select({
 *     required: true,
 *     options: [
 *       { value: 'electronics', label: 'products.category.electronics' },
 *       { value: 'clothing', label: 'products.category.clothing' }
 *     ]
 *   }),
 *   description: field.textarea({ required: false }),
 *   inStock: field.checkbox({ defaultValue: true }),
 * });
 */
