/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

/**
 * Backend Normalizers - Centralized data transformation layer
 *
 * This module provides unified normalizers for converting backend-specific
 * responses (Laravel vs ASP.NET) into standardized internal types.
 *
 * ALL backend differences should be handled here, not in components or hooks.
 */

import type { z } from "zod";
import { type BackendKind } from "@/core/types/api";
import {
  type AuthTokens,
  type AuthUser,
  type AuthPos,
} from "@/features/auth/types/auth.types";
import {
  laravelLoginSchema,
  laravelRefreshSchema,
  laravelMeSchema,
  aspNetLoginEnvelopeSchema,
  aspNetMeSchema,
  aspNetMeEnvelopeSchema,
} from "@/features/auth/schemas/auth.schema";

/**
 * Normalizes login response from either backend into unified AuthTokens
 *
 * @param raw - Raw response from login endpoint
 * @param backend - Which backend type
 * @returns Normalized AuthTokens with expiration timestamps
 *
 * @example
 * // Laravel
 * const tokens = normalizeLoginResponse(laravelResponse, "laravel");
 * // ASP.NET
 * const tokens = normalizeLoginResponse(aspNetEnvelope, "aspnet");
 */
export function normalizeLoginResponse(
  raw: unknown,
  backend: BackendKind
): AuthTokens {
  if (backend === "laravel") {
    const parsed = laravelLoginSchema.parse(raw);
    const expiresAt = Date.now() + parsed.expires_in * 1000;

    return {
      backend: "laravel",
      accessToken: parsed.access_token,
      tokenType: parsed.token_type,
      expiresIn: parsed.expires_in,
      accessTokenExpiresAt: expiresAt,
      refreshToken: null,
      refreshTokenExpiresAt: null,
    };
  } else {
    // ASP.NET returns envelope: { code, message, result: { accessToken, refreshToken, ... } }
    const envelope = aspNetLoginEnvelopeSchema.parse(raw);
    const result = envelope.result;

    const accessExpiresAt = new Date(result.accessExpiresAtUtc).getTime();
    const refreshExpiresAt = new Date(result.refreshExpiresAtUtc).getTime();
    const expiresIn = Math.floor((accessExpiresAt - Date.now()) / 1000);

    return {
      backend: "aspnet",
      accessToken: result.accessToken,
      tokenType: "bearer",
      expiresIn: expiresIn,
      accessTokenExpiresAt: accessExpiresAt,
      refreshToken: result.refreshToken,
      refreshTokenExpiresAt: refreshExpiresAt,
    };
  }
}

/**
 * Normalizes refresh token response (Laravel only, ASP.NET uses different pattern)
 */
export function normalizeRefreshResponse(
  raw: unknown,
  backend: BackendKind
): AuthTokens {
  if (backend === "laravel") {
    const parsed = laravelRefreshSchema.parse(raw);
    const expiresAt = Date.now() + parsed.expires_in * 1000;

    return {
      backend: "laravel",
      accessToken: parsed.access_token,
      tokenType: parsed.token_type,
      expiresIn: parsed.expires_in,
      accessTokenExpiresAt: expiresAt,
      refreshToken: null,
      refreshTokenExpiresAt: null,
    };
  } else {
    // ASP.NET refresh not implemented yet
    throw new Error("ASP.NET refresh token not implemented");
  }
}

/**
 * Normalizes /me endpoint response into unified AuthUser
 *
 * Also extracts permissions, POS data, and fees where available
 *
 * @param raw - Raw /me response
 * @param backend - Which backend type
 * @returns Object with user, permissions, pos, fees
 */
export function normalizeUserProfile(
  raw: unknown,
  backend: BackendKind
): {
  user: AuthUser;
  permissions: string[];
  pos: AuthPos | null;
  fees: number | null;
} {
  if (backend === "laravel") {
    const parsed = laravelMeSchema.parse(raw);

    return {
      user: {
        id: parsed.user.id,
        name: parsed.user.name,
        email: parsed.user.email,
        phoneNo: parsed.user.phone_no,
        image: null,
        role: null,
        backend: "laravel",
      },
      permissions: parsed.perm,
      pos: {
        id: parsed.pos.id,
        name: parsed.pos.pos_name,
        lat: parsed.pos.pos_lat,
        lng: parsed.pos.pos_lng,
      },
      fees: parsed.fees,
    };
  } else {
    // ASP.NET /me response structure - can be envelope or direct
    let parsed: z.infer<typeof aspNetMeSchema>;
    
    // Try to parse as envelope first
    const envelopeParse = aspNetMeEnvelopeSchema.safeParse(raw);
    if (envelopeParse.success) {
      parsed = envelopeParse.data.result;
    } else {
      // Fallback to direct parsing for backward compatibility
      parsed = aspNetMeSchema.parse(raw);
    }

    return {
      user: {
        id: parsed.id,
        name: parsed.fullName,
        email: null,
        phoneNo: parsed.phoneNumber,
        image: parsed.photo,
        role: parsed.role.name,
        roles: [{ id: parsed.role.id, name: parsed.role.name }],
        backend: "aspnet",
      },
      permissions: [], // ASP.NET uses role-based, not permission array
      pos: null,
      fees: null,
    };
  }
}

/**
 * Normalizes Iraqi phone number to international format
 * Converts formats like "07XXXXXXXXX" or "07711087733" to "+9647711087733"
 *
 * @param phone - Phone number in various formats
 * @returns Normalized phone number in +964 format
 */
function normalizePhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\s/g, "");
  
  // Already in international format
  if (cleaned.startsWith("+964")) {
    return cleaned;
  }
  
  // Remove leading 0 and add +964 prefix
  if (cleaned.startsWith("0")) {
    return `+964${cleaned.slice(1)}`;
  }
  
  // If it starts with 7, assume it's missing the country code
  if (cleaned.startsWith("7") && cleaned.length === 10) {
    return `+964${cleaned}`;
  }
  
  // Return as-is if format is unclear
  return cleaned;
}

/**
 * Builds login request body based on backend and credentials
 *
 * @param credentials - User input (email/password or phone/password)
 * @param backend - Which backend type
 * @param options - Additional options like clientId, fingerprintHash for ASP.NET
 * @returns Properly formatted login request body
 */
export function buildLoginRequestBody(
  credentials: {
    email?: string;
    phone?: string;
    username?: string;
    password: string;
  },
  backend: BackendKind,
  options?: { clientId?: string; fingerprintHash?: string }
): unknown {
  if (backend === "laravel") {
    // Laravel always uses email + type: "web"
    return {
      email: credentials.email || credentials.phone || credentials.username,
      password: credentials.password,
      type: "web",
    };
  } else {
    // ASP.NET: Phone login vs Username login
    if (credentials.phone) {
      const normalizedPhone = normalizePhoneNumber(credentials.phone);
      return {
        phoneNumber: normalizedPhone,
        password: credentials.password,
        clientId: options?.clientId || "web-app",
        fingerprintHash: options?.fingerprintHash || "default-hash",
      };
    } else {
      return {
        username: credentials.username || credentials.email,
        password: credentials.password,
        clientId: options?.clientId || "web-app",
        fingerprintHash: options?.fingerprintHash || "default-hash",
      };
    }
  }
}

/**
 * Normalizes field names for server requests
 *
 * Converts internal camelCase to backend-specific format:
 * - Laravel: snake_case
 * - ASP.NET: PascalCase
 *
 * @param data - Object with internal field names
 * @param backend - Which backend type
 * @returns Object with backend-specific field names
 */
export function normalizeFieldNamesToServer(
  data: Record<string, unknown>,
  backend: BackendKind
): Record<string, unknown> {
  if (backend === "laravel") {
    // Convert camelCase to snake_case
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      const snakeKey = key.replace(
        /[A-Z]/g,
        (letter) => `_${letter.toLowerCase()}`
      );
      result[snakeKey] = value;
    }
    return result;
  } else {
    // ASP.NET expects PascalCase
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
      result[pascalKey] = value;
    }
    return result;
  }
}

/**
 * Normalizes field names from server responses
 *
 * Converts backend-specific format to internal camelCase:
 * - Laravel: snake_case → camelCase
 * - ASP.NET: PascalCase → camelCase
 *
 * @param data - Object with server field names
 * @param backend - Which backend type
 * @returns Object with internal camelCase field names
 */
export function normalizeFieldNamesFromServer(
  data: Record<string, unknown>,
  backend: BackendKind
): Record<string, unknown> {
  if (backend === "laravel") {
    // Convert snake_case to camelCase
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
        letter.toUpperCase()
      );
      result[camelKey] = value;
    }
    return result;
  } else {
    // Convert PascalCase to camelCase
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
      result[camelKey] = value;
    }
    return result;
  }
}

/**
 * Formats pagination parameters for backend-specific query strings
 *
 * @param page - 1-indexed page number
 * @param pageSize - Number of items per page
 * @param backend - Which backend type
 * @returns Backend-specific query params object
 *
 * @example
 * formatPaginationParams(1, 10, "laravel")
 * // → { page: 1, size: 10 }
 *
 * formatPaginationParams(1, 10, "aspnet")
 * // → { PageNumber: 1, PageSize: 10 }
 */
export function formatPaginationParams(
  page: number,
  pageSize: number,
  backend: BackendKind
): Record<string, number> {
  if (backend === "laravel") {
    return { page, size: pageSize };
  } else {
    return { PageNumber: page, PageSize: pageSize };
  }
}
