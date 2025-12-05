# Security Enhancements Guide

This document outlines the comprehensive security measures implemented in the React Boilerplate application.

## Table of Contents

1. [Content Security Policy (CSP)](#content-security-policy)
2. [Rate Limiting](#rate-limiting)
3. [CSRF Protection](#csrf-protection)
4. [Input Sanitization](#input-sanitization)
5. [Security Headers](#security-headers)
6. [Best Practices](#best-practices)

---

## Content Security Policy

### Overview
CSP headers prevent XSS attacks by controlling which resources can be loaded and executed.

### Implementation
CSP is configured in `index.html` with strict policies:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' http://localhost:* https:;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
">
```

### Policy Details

- **default-src 'self'**: Only allow resources from same origin
- **script-src**: Scripts from same origin + inline (for Vite HMR in dev)
- **style-src**: Styles from same origin + inline (for CSS-in-JS)
- **img-src**: Images from same origin, data URIs, and HTTPS
- **connect-src**: API calls to same origin and localhost (for dev)
- **frame-ancestors 'none'**: Prevent clickjacking
- **base-uri 'self'**: Restrict base tag to same origin
- **form-action 'self'**: Forms can only submit to same origin

### Notes
- `'unsafe-inline'` and `'unsafe-eval'` are needed for Vite dev mode
- For production, consider removing these and using nonces/hashes

---

## Rate Limiting

### Overview
Client-side rate limiting prevents abuse and improves UX with intelligent retry logic.

### Implementation
Rate limiting is implemented in `src/core/security/rateLimit.ts`:

```typescript
import { rateLimiter, DEFAULT_RATE_LIMITS } from '@/core/security/rateLimit';

// Check rate limit
if (!rateLimiter.check('api-endpoint', DEFAULT_RATE_LIMITS.api)) {
  console.error('Rate limit exceeded');
}
```

### Default Limits

| Endpoint Type | Max Requests | Time Window | Message |
|--------------|--------------|-------------|---------|
| Login | 5 | 15 minutes | Too many login attempts |
| Register | 3 | 1 hour | Too many registration attempts |
| Password Reset | 3 | 1 hour | Too many reset requests |
| API Calls | 100 | 1 minute | Too many requests |
| File Upload | 10 | 1 minute | Too many upload attempts |
| Search/Filter | 30 | 1 minute | Too many search requests |

### Exponential Backoff

The API client implements exponential backoff for failed requests:

```typescript
const backoff = new ExponentialBackoff(
  maxAttempts: 3,
  baseDelay: 1000ms,
  maxDelay: 10000ms
);
```

**Retry delays:**
- Attempt 1: ~1 second
- Attempt 2: ~2 seconds  
- Attempt 3: ~4 seconds

### Features

- ✅ Per-endpoint rate limiting
- ✅ Automatic retry with backoff
- ✅ Jitter to prevent thundering herd
- ✅ Graceful error messages
- ✅ Automatic cleanup of expired records

---

## CSRF Protection

### Overview
CSRF (Cross-Site Request Forgery) protection prevents unauthorized actions on behalf of authenticated users.

### Implementation
CSRF tokens are managed in `src/core/security/csrf.ts`:

```typescript
import { initializeCsrfToken, getCsrfToken } from '@/core/security/csrf';

// Initialize on app start (automatic in API client)
initializeCsrfToken();

// Token is automatically added to state-changing requests (POST, PUT, DELETE, PATCH)
```

### How It Works

1. **Token Generation**: Random 32-byte token generated using `crypto.getRandomValues()`
2. **Storage**: Token stored in `sessionStorage` (cleared on tab close)
3. **Header**: Token sent as `X-CSRF-Token` header on all state-changing requests
4. **Validation**: Backend validates token matches stored value

### Automatic Integration

The API client (`src/core/api/client.ts`) automatically:
- Initializes CSRF token on first state-changing request
- Adds token to request headers
- Handles token refresh on 403 responses

### Manual Usage

```typescript
import { 
  initializeCsrfToken, 
  getCsrfToken, 
  refreshCsrfToken 
} from '@/core/security/csrf';

// Get current token
const token = getCsrfToken();

// Refresh token (e.g., after login)
refreshCsrfToken();
```

---

## Input Sanitization

### Overview
Input sanitization prevents XSS attacks by cleaning user-provided data before processing or display.

### Implementation
Sanitization utilities are in `src/core/security/sanitize.ts`:

```typescript
import { 
  sanitizeHtml, 
  sanitizeUrl, 
  sanitizeText,
  sanitizeObject 
} from '@/core/security/sanitize';

// Sanitize HTML (escapes special characters)
const safe = sanitizeHtml('<script>alert("xss")</script>');
// Result: &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;

// Sanitize URL (removes dangerous protocols)
const safeUrl = sanitizeUrl('javascript:alert(1)');
// Result: '' (empty string)

// Sanitize text (limits length, trims)
const safeText = sanitizeText(userInput);

// Sanitize entire object (recursive)
const safeData = sanitizeObject(formData);
```

### Available Utilities

#### `sanitizeHtml(input: string): string`
Escapes HTML entities to prevent XSS:
- `<` → `&lt;`
- `>` → `&gt;`
- `"` → `&quot;`
- `'` → `&#x27;`
- `&` → `&amp;`
- `/` → `&#x2F;`

#### `sanitizeUrl(url: string): string`
Validates URLs and removes dangerous protocols:
- Blocks: `javascript:`, `data:`, `vbscript:`
- Allows: `http:`, `https:`, `mailto:`, relative URLs

#### `sanitizeEmail(email: string): string`
Validates and normalizes email addresses:
- Checks format with regex
- Converts to lowercase
- Trims whitespace
- Returns empty string if invalid

#### `sanitizeFilename(filename: string): string`
Removes dangerous characters from filenames:
- Removes path traversal: `../`
- Removes special chars: `/:*?"<>|`

#### `stripScripts(html: string): string`
Aggressively removes scripts and event handlers:
- Removes `<script>` tags
- Removes event handlers (`onclick`, `onerror`, etc.)
- Removes `javascript:` in attributes

#### `sanitizeObject<T>(obj: T): T`
Deep sanitizes objects recursively:
- Sanitizes all string values
- Handles nested objects and arrays
- Preserves structure and types

#### `sanitizeInteger(value: string | number): number | null`
Validates and sanitizes numeric input:
- Checks if valid integer
- Prevents integer overflow
- Returns `null` if invalid

### Automatic Sanitization

The API client automatically sanitizes request bodies:

```typescript
// In client.ts
const sanitizedBody = options.body && typeof options.body === "object"
  ? sanitizeObject(options.body as Record<string, unknown>)
  : options.body;
```

### Manual Usage Examples

```tsx
// In a form component
import { sanitizeText, sanitizeEmail } from '@/core/security/sanitize';

const handleSubmit = (data: FormData) => {
  const sanitized = {
    name: sanitizeText(data.name),
    email: sanitizeEmail(data.email),
    // ... other fields
  };
  
  submitData(sanitized);
};

// In a display component
import { sanitizeHtml } from '@/core/security/sanitize';

const UserComment = ({ comment }: { comment: string }) => (
  <div dangerouslySetInnerHTML={{ 
    __html: sanitizeHtml(comment) 
  }} />
);
```

---

## Security Headers

### Overview
Security headers provide defense-in-depth protection against various attacks.

### Implementation
Security headers are configured in `vite.config.ts`:

```typescript
const securityHeadersPlugin = (): Plugin => ({
  name: "security-headers",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      // Set security headers
      res.setHeader("Strict-Transport-Security", "...");
      res.setHeader("X-Frame-Options", "DENY");
      // ... more headers
      next();
    });
  },
});
```

### Headers Explained

#### Strict-Transport-Security (HSTS)
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```
- Forces HTTPS for 1 year
- Applies to all subdomains
- Prevents protocol downgrade attacks

#### X-Frame-Options
```
X-Frame-Options: DENY
```
- Prevents page from being embedded in iframes
- Protects against clickjacking attacks

#### X-Content-Type-Options
```
X-Content-Type-Options: nosniff
```
- Prevents MIME type sniffing
- Browser must respect declared content type

#### X-XSS-Protection
```
X-XSS-Protection: 1; mode=block
```
- Enables XSS filter in older browsers
- Blocks page if XSS attack detected

#### Referrer-Policy
```
Referrer-Policy: strict-origin-when-cross-origin
```
- Controls referrer information sent with requests
- Sends full URL for same-origin, origin only for cross-origin

#### Permissions-Policy
```
Permissions-Policy: camera=(), microphone=(), geolocation=()
```
- Disables browser features not needed by app
- Prevents unauthorized access to sensors

### Production Considerations

For production deployments, configure these headers on your web server (Nginx, Apache, etc.):

**Nginx Example:**
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
```

**Apache Example:**
```apache
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
Header always set X-Frame-Options "DENY"
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
```

---

## Best Practices

### 1. Always Sanitize User Input
```typescript
import { sanitizeText, sanitizeHtml } from '@/core/security/sanitize';

// Before displaying
const safeComment = sanitizeHtml(userComment);

// Before submitting
const safeData = sanitizeObject(formData);
```

### 2. Use HTTPS in Production
- CSP and HSTS require HTTPS
- Never transmit sensitive data over HTTP
- Use Let's Encrypt for free SSL certificates

### 3. Validate on Backend
- Client-side security is not enough
- Always validate and sanitize on server
- Use parameterized queries for database

### 4. Regular Security Audits
```bash
# Check for vulnerabilities
pnpm audit

# Update dependencies
pnpm update

# Check outdated packages
pnpm outdated
```

### 5. Monitor Rate Limits
```typescript
// Log rate limit violations
if (!rateLimiter.check(key, config)) {
  console.warn('Rate limit exceeded', { key, endpoint });
  // Send to analytics/monitoring
}
```

### 6. Handle Errors Gracefully
```typescript
try {
  await apiFetch(endpoint, options);
} catch (error) {
  if (error.code === 429) {
    // Rate limited - show user-friendly message
    showToast('Please slow down. Try again in a moment.');
  } else if (error.code === 403) {
    // CSRF token invalid - refresh and retry
    refreshCsrfToken();
  }
}
```

### 7. Keep Dependencies Updated
- Regularly update security packages
- Subscribe to security advisories
- Use Dependabot or Renovate for automation

### 8. Use Secure Coding Practices
- Never use `dangerouslySetInnerHTML` without sanitization
- Avoid `eval()` and `Function()` constructors
- Use secure random number generation (`crypto.getRandomValues()`)
- Validate all data from external sources

### 9. Implement Logging
```typescript
// Log security events
const logSecurityEvent = (event: string, details: unknown) => {
  console.warn('[Security]', event, details);
  // Send to monitoring service
};

// Example: Log rate limit violations
if (!rateLimiter.check(key, config)) {
  logSecurityEvent('rate_limit_exceeded', { endpoint: key });
}
```

### 10. Configure CSP for Production
For production, tighten CSP by:
- Removing `'unsafe-inline'` and `'unsafe-eval'`
- Using nonces or hashes for inline scripts
- Whitelisting only necessary domains

```html
<!-- Production CSP (more restrictive) -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'nonce-{RANDOM_NONCE}';
  style-src 'self' 'nonce-{RANDOM_NONCE}';
  img-src 'self' https://trusted-cdn.com;
  connect-src 'self' https://api.yourdomain.com;
  frame-ancestors 'none';
">
```

---

## Testing Security Features

### 1. Test Rate Limiting
```typescript
// Test in browser console
for (let i = 0; i < 150; i++) {
  fetch('/api/endpoint');
}
// Should see 429 errors after 100 requests
```

### 2. Test CSRF Protection
```typescript
// Should fail without CSRF token
fetch('/api/users', {
  method: 'POST',
  body: JSON.stringify({ name: 'Test' }),
  headers: { 'Content-Type': 'application/json' }
});
```

### 3. Test Input Sanitization
```typescript
import { sanitizeHtml } from '@/core/security/sanitize';

console.log(sanitizeHtml('<img src=x onerror=alert(1)>'));
// Should output: &lt;img src=x onerror=alert(1)&gt;
```

### 4. Test CSP
Open browser DevTools and check for CSP violations:
```javascript
// This should be blocked by CSP
eval('alert(1)');
```

---

## Security Checklist

- [x] Content Security Policy configured
- [x] Rate limiting on API endpoints
- [x] CSRF protection for state-changing requests
- [x] Input sanitization utilities available
- [x] Security headers configured
- [x] HTTPS enforced (HSTS)
- [x] XSS protection enabled
- [x] Clickjacking prevention (X-Frame-Options)
- [x] MIME sniffing prevention
- [x] Exponential backoff for retries
- [ ] Backend validation (must be implemented server-side)
- [ ] Security monitoring/logging (optional)
- [ ] Penetration testing (recommended)
- [ ] Security audit (recommended)

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Content Security Policy Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Security Headers Best Practices](https://securityheaders.com/)
- [CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)

---

## Support

For security concerns or questions, please contact the development team.

**Last Updated:** December 2024
