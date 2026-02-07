/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

/**
 * CSRF (Cross-Site Request Forgery) Protection
 * 
 * Implements CSRF token handling for API requests
 */

const CSRF_TOKEN_KEY = 'csrf_token';
const CSRF_HEADER_NAME =
  (import.meta.env.VITE_CSRF_HEADER_NAME as string) ?? 'X-CSRF-Token';
const CSRF_COOKIE_NAME =
  (import.meta.env.VITE_CSRF_COOKIE_NAME as string) ?? 'XSRF-TOKEN';
const CSRF_META_NAME =
  (import.meta.env.VITE_CSRF_META_NAME as string) ?? 'csrf-token';

/**
 * Generate a random CSRF token
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Read CSRF token from a cookie (e.g., Laravel's XSRF-TOKEN)
 */
export function getCsrfTokenFromCookie(
  cookieName: string = CSRF_COOKIE_NAME
): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${cookieName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}=([^;]*)`)
  );

  if (!match) return null;

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

/**
 * Read CSRF token from a meta tag (e.g., <meta name="csrf-token" content="...">)
 */
export function getCsrfTokenFromMeta(
  metaName: string = CSRF_META_NAME
): string | null {
  if (typeof document === 'undefined') return null;

  const meta = document.querySelector(`meta[name="${metaName}"]`);
  return meta?.getAttribute('content') ?? null;
}

/**
 * Store CSRF token in sessionStorage
 */
export function storeCsrfToken(token: string): void {
  try {
    sessionStorage.setItem(CSRF_TOKEN_KEY, token);
  } catch (error) {
    console.warn('Failed to store CSRF token:', error);
  }
}

/**
 * Retrieve CSRF token from sessionStorage
 */
export function getCsrfToken(): string | null {
  try {
    return sessionStorage.getItem(CSRF_TOKEN_KEY);
  } catch (error) {
    console.warn('Failed to retrieve CSRF token:', error);
    return null;
  }
}

/**
 * Remove CSRF token from sessionStorage
 */
export function clearCsrfToken(): void {
  try {
    sessionStorage.removeItem(CSRF_TOKEN_KEY);
  } catch (error) {
    console.warn('Failed to clear CSRF token:', error);
  }
}

/**
 * Initialize CSRF token if not exists
 */
export function initializeCsrfToken(): string {
  let token = getCsrfToken();
  
  if (!token) {
    token = getCsrfTokenFromMeta() ?? getCsrfTokenFromCookie();

    if (!token) {
      token = generateCsrfToken();
    }

    storeCsrfToken(token);
  }
  
  return token;
}

/**
 * Add CSRF token to request headers
 */
export function addCsrfHeader(headers: HeadersInit = {}): HeadersInit {
  const token = getCsrfToken() ?? initializeCsrfToken();

  return {
    ...headers,
    [CSRF_HEADER_NAME]: token || '',
  };
}

/**
 * Validate CSRF token from response
 * Some backends return a new token in response headers
 */
export function validateCsrfToken(headers: Headers): void {
  const newToken = headers.get(CSRF_HEADER_NAME);
  
  if (newToken) {
    storeCsrfToken(newToken);
    return;
  }

  const cookieToken = getCsrfTokenFromCookie();
  if (cookieToken) {
    storeCsrfToken(cookieToken);
  }
}

/**
 * Check if request method requires CSRF protection
 */
export function requiresCsrfProtection(method: string): boolean {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  return !safeMethods.includes(method.toUpperCase());
}

/**
 * CSRF token refresh utility
 * Call this periodically or after authentication
 */
export function refreshCsrfToken(): string {
  clearCsrfToken();
  return initializeCsrfToken();
}

/**
 * Get CSRF header name (useful for backend configuration)
 */
export function getCsrfHeaderName(): string {
  return CSRF_HEADER_NAME;
}

/**
 * Get CSRF cookie name (useful for backend configuration)
 */
export function getCsrfCookieName(): string {
  return CSRF_COOKIE_NAME;
}

/**
 * Get CSRF meta name (useful for backend configuration)
 */
export function getCsrfMetaName(): string {
  return CSRF_META_NAME;
}
