/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 * 
 * User Data Transformers
 * Centralized transformation logic for user data between UI and API formats
 */

import type { UserFormData, UserUpdateData } from "../types";

/**
 * Transform form data to API format
 * Handles boolean to number conversion for approved field
 * Maps phone_no to phone for API compatibility
 */
export function transformUserToApi(
  data: UserFormData | UserUpdateData
): Record<string, unknown> {
  return {
    ...data,
    phone: data.phone_no,
    approved:
      data.approved !== undefined
        ? typeof data.approved === "boolean"
          ? data.approved
            ? 1
            : 0
          : data.approved
        : undefined,
    password: "password" in data && data.password ? data.password : undefined,
  };
}

/**
 * Transform API data to form format
 * Converts approved from number (0/1) to boolean for form display
 * Maps phone to phone_no for form compatibility
 * 
 * Note: This returns a partial object that can be used as initialValues
 * The approved field will be converted to boolean for checkbox components
 */
export function transformUserFromApi(
  data: Record<string, unknown>
): Record<string, unknown> {
  return {
    ...data,
    phone_no: (data.phone ?? data.phone_no) as string,
    approved: data.approved === 1, // Convert to boolean for form checkbox
  };
}

/**
 * Get user display name for UI
 * Falls back to email or ID if name is not available
 */
export function getUserDisplayName(user: {
  name?: string;
  email?: string;
  id: number | string;
}): string {
  return user.name ?? user.email ?? `#${user.id}`;
}
