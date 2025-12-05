import type { UserFormData, UserUpdateData } from "../types";

/**
 * User dialog field definitions - Define once, use everywhere
 * DRY: Single source of truth for all user form fields
 */
export const userFieldsDefinition = {
  name: { type: "text" as const, order: 1 },
  email: { type: "email" as const, order: 2 },
  password: { type: "password" as const, order: 3 },
  phone_no: { type: "text" as const, order: 4 },
  role: {
    type: "select" as const,
    order: 5,
    options: ["administrator", "manager", "user", "cashier"],
  },
  approved: { type: "checkbox" as const, order: 6 },
} satisfies Record<keyof UserFormData, unknown>;

/**
 * Edit-specific field definitions (includes hidden id field)
 */
export const userEditFieldsDefinition = {
  id: { type: "number" as const, hidden: true },
  ...userFieldsDefinition,
} satisfies Record<keyof UserUpdateData, unknown>;
