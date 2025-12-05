# PWA Development Notes

## Service Worker in Development

The service worker is **disabled in development mode** to avoid issues with:

- Hot Module Replacement (HMR)
- MIME type errors
- Caching conflicts during development

### Why Disabled?

1. **MIME Type Issues**: Dev server serves files differently than production
2. **HMR Conflicts**: Service worker caching interferes with hot reload
3. **Debugging**: Easier to debug without cache layer

### Testing PWA Features

To test PWA functionality during development:

#### Option 1: Production Preview (Recommended)

```bash
# Build the app
pnpm build

# Preview the production build
pnpm preview

# Open http://localhost:4173
```

This runs a production build with:

- ✅ Service worker enabled
- ✅ Proper MIME types
- ✅ Full PWA features
- ✅ Install prompts
- ✅ Offline support

#### Option 2: Enable Dev Mode PWA (Not Recommended)

If you really need PWA in dev mode:

**File:** `vite.config.ts`

```typescript
devOptions: {
  enabled: true, // Change to true
  type: "module",
}
```

**Warning:** May cause:

- Service worker registration errors
- MIME type warnings
- HMR conflicts
- Cached stale code

### Production Deployment

In production, the service worker works automatically:

1. **Build:** `pnpm build`
2. **Deploy:** Upload `dist/` folder
3. **Serve:** Via HTTPS server
4. **Result:** Full PWA functionality

### Checking Service Worker Status

**In Production Preview:**

```javascript
// Browser console
navigator.serviceWorker.getRegistration().then((reg) => {
  console.log("Active:", reg?.active?.state);
});
```

**Check Caches:**

```javascript
caches.keys().then((keys) => console.log("Caches:", keys));
```

## Security Headers

### Development vs Production

**Development (localhost):**

- Security headers set via Vite middleware
- HSTS disabled (not needed on localhost)
- CSP relaxed for HMR
- WebSocket connections allowed (`ws://`)

**Production:**

- All security headers active
- HSTS enforced (requires HTTPS)
- Strict CSP
- Frame-ancestors via HTTP header

### Headers Applied

| Header                    | Dev | Prod | Via                |
| ------------------------- | --- | ---- | ------------------ |
| X-Frame-Options           | ✅  | ✅   | HTTP Header        |
| X-Content-Type-Options    | ✅  | ✅   | HTTP Header        |
| X-XSS-Protection          | ✅  | ✅   | HTTP Header        |
| Referrer-Policy           | ✅  | ✅   | HTTP Header + Meta |
| Permissions-Policy        | ✅  | ✅   | HTTP Header        |
| Content-Security-Policy   | ✅  | ✅   | HTTP Header + Meta |
| Strict-Transport-Security | ❌  | ✅   | HTTP Header        |

### Why Some Headers Use Meta Tags?

**CSP via Meta:**

- Works for most directives
- `frame-ancestors` **requires HTTP header** (ignored in meta)
- Both meta + header used for maximum compatibility

**Referrer-Policy:**

- Works via both meta and header
- Redundant for extra safety

**Can't Use Meta:**

- X-Frame-Options
- X-Content-Type-Options
- Permissions-Policy
- Strict-Transport-Security

## Production Server Configuration

For optimal security in production, configure your web server:

### Nginx Example

```nginx
server {
  listen 443 ssl http2;
  server_name yourdomain.com;

  # Security Headers
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header X-Frame-Options "DENY" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;
  add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
  add_header Content-Security-Policy "frame-ancestors 'none'" always;

  # Service Worker
  location /sw.js {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Content-Type "application/javascript; charset=utf-8";
    add_header Service-Worker-Allowed "/";
  }

  # Static files
  location / {
    root /var/www/app;
    try_files $uri $uri/ /index.html;
  }
}
```

### Apache Example

```apache
<VirtualHost *:443>
  ServerName yourdomain.com

  # Security Headers
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
  Header always set X-Frame-Options "DENY"
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-XSS-Protection "1; mode=block"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
  Header always set Content-Security-Policy "frame-ancestors 'none'"

  # Service Worker
  <Files "sw.js">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Content-Type "application/javascript; charset=utf-8"
    Header set Service-Worker-Allowed "/"
  </Files>

  DocumentRoot /var/www/app
</VirtualHost>
```

## Common Issues & Solutions

### Issue: Service Worker Not Registering

**Symptoms:**

- Console error: "SecurityError: Failed to register ServiceWorker"
- Error: "Unsupported MIME type"

**Solutions:**

1. **In Dev:** Service worker is disabled - use `pnpm preview` instead
2. **In Prod:** Check server serves `/sw.js` with correct MIME type
3. Ensure HTTPS enabled (except localhost)

### Issue: Install Prompt Not Showing

**Cause:** Service worker not active in dev mode

**Solution:**

```bash
pnpm build
pnpm preview
# Wait 5 seconds for install prompt
```

### Issue: CSP/Frame-Ancestors Warning

**Console:** "frame-ancestors is ignored when delivered via meta element"

**Explanation:**

- This is normal and expected
- `frame-ancestors` requires HTTP header
- Still protected via Vite middleware header
- Warning can be safely ignored

**Fix:** Configured via HTTP header in security middleware

### Issue: X-Frame-Options Meta Warning

**Console:** "X-Frame-Options may only be set via HTTP header"

**Explanation:**

- Meta tags removed from HTML
- Header set via Vite middleware
- Protection active in both dev and prod

## Development Workflow

### Normal Development

```bash
pnpm dev
# No service worker, no PWA prompts
# Faster HMR, easier debugging
```

### Testing PWA Features

```bash
pnpm build
pnpm preview
# Full PWA functionality
# Test install, offline, updates
```

### Production Deploy

```bash
pnpm build
# Deploy dist/ to HTTPS server
# Configure server headers
# Verify PWA functionality
```

## Verification Checklist

### Development (localhost:5018)

- [ ] No service worker errors
- [ ] No MIME type warnings
- [ ] No CSP blocking errors
- [ ] HMR working properly
- [ ] Security headers in Network tab

### Production Preview (localhost:4173)

- [ ] Service worker registers
- [ ] Install prompt appears
- [ ] Offline mode works
- [ ] Update prompt works
- [ ] All security headers present

### Production Deployment

- [ ] HTTPS enabled
- [ ] Service worker active
- [ ] Installable from browser
- [ ] Offline functionality works
- [ ] Lighthouse PWA score: 100
- [ ] All security headers present

## References

- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [PWA Best Practices](https://web.dev/pwa/)
- [CSP Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Security Headers Guide](https://owasp.org/www-project-secure-headers/)
