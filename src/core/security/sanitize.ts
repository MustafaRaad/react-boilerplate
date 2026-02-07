/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

/**
 * Input Sanitization Utilities
 * 
 * Provides functions to sanitize user inputs and prevent XSS attacks
 */

/**
 * Sanitizes HTML string by escaping special characters
 * Prevents XSS attacks by converting HTML entities
 */
export function sanitizeHtml(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  const reg = /[&<>"'/]/gi;
  return input.replace(reg, (match) => map[match] ?? match);
}

/**
 * Sanitizes string for safe URL usage
 * Removes potentially dangerous characters
 */
export function sanitizeUrl(url: string): string {
  // Remove javascript: and data: protocols
  const dangerous = /^(javascript|data|vbscript):/i;
  if (dangerous.test(url)) {
    return '';
  }
  
  // Allow only http, https, mailto, and relative URLs
  const safe = /^(https?:\/\/|mailto:|\/|\.\/|#)/i;
  if (!safe.test(url)) {
    return '';
  }
  
  return url;
}

/**
 * Sanitizes string for SQL injection prevention
 * Note: This is a basic sanitization. Always use parameterized queries on backend
 */
export function sanitizeForSql(input: string): string {
  // Remove SQL special characters and keywords
  return input
    .replace(/['";\\]/g, '')
    .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi, '');
}

/**
 * Validates and sanitizes email addresses
 */
export function sanitizeEmail(email: string): string {
  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  const trimmed = email.trim().toLowerCase();
  
  if (!emailRegex.test(trimmed)) {
    return '';
  }
  
  return trimmed;
}

/**
 * Sanitizes filename by removing dangerous characters
 */
export function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts and dangerous characters
  return filename
    .replace(/\.\./g, '')
    .replace(/[/\\:*?"<>|]/g, '')
    .trim();
}

/**
 * Removes script tags and event handlers from HTML content
 * More aggressive sanitization for untrusted HTML
 */
export function stripScripts(html: string): string {
  // Remove script tags
  let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onerror, etc.)
  clean = clean.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  clean = clean.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: in attributes
  clean = clean.replace(/javascript:/gi, '');
  
  return clean;
}

/**
 * Sanitizes user input for display in React components
 * Safe for rendering as text content
 */
export function sanitizeText(text: string | null | undefined): string {
  if (!text) return '';
  
  return String(text)
    .trim()
    .substring(0, 10000); // Limit length to prevent DOS
}

/**
 * Deep sanitizes an object recursively
 * Useful for sanitizing form data or API responses
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = {} as T;
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeText(value) as T[keyof T];
    } else if (Array.isArray(value)) {
      sanitized[key as keyof T] = value.map((item) =>
        typeof item === 'object' && item !== null
          ? sanitizeObject(item as Record<string, unknown>)
          : typeof item === 'string'
          ? sanitizeText(item)
          : item
      ) as T[keyof T];
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key as keyof T] = sanitizeObject(value as Record<string, unknown>) as T[keyof T];
    } else {
      sanitized[key as keyof T] = value as T[keyof T];
    }
  }
  
  return sanitized;
}

/**
 * Validates that a string contains only alphanumeric characters
 * Useful for usernames, IDs, etc.
 */
export function isAlphanumeric(str: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(str);
}

/**
 * Validates that a string is a safe integer
 */
export function sanitizeInteger(value: string | number): number | null {
  const num = Number(value);
  
  if (Number.isNaN(num) || !Number.isInteger(num)) {
    return null;
  }
  
  // Prevent integer overflow
  if (num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER) {
    return null;
  }
  
  return num;
}

/**
 * Sanitize CSS identifier (e.g., variable names, data attributes)
 */
export function sanitizeCssIdentifier(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '');
}

/**
 * Sanitize CSS color values to reduce CSS injection risk
 */
export function sanitizeCssColor(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const hex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
  const functional = /^(rgb|rgba|hsl|hsla)\([\d\s.,%+-]+\)$/i;
  const cssVar = /^var\(--[a-zA-Z0-9_-]+\)$/;
  const keywords = /^(currentColor|transparent|inherit|initial|unset)$/i;
  const named = /^[a-zA-Z]+$/;

  if (
    hex.test(trimmed) ||
    functional.test(trimmed) ||
    cssVar.test(trimmed) ||
    keywords.test(trimmed) ||
    named.test(trimmed)
  ) {
    return trimmed;
  }

  return null;
}
