# Progressive Web App (PWA) Implementation Guide

This document covers the complete PWA implementation in the React Boilerplate application.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Service Worker](#service-worker)
4. [Caching Strategies](#caching-strategies)
5. [Installation](#installation)
6. [Offline Support](#offline-support)
7. [Updates](#updates)
8. [Configuration](#configuration)
9. [Testing](#testing)
10. [Best Practices](#best-practices)

---

## Overview

The application is now a fully functional Progressive Web App with:
- ✅ Service worker for offline support
- ✅ Web app manifest for installation
- ✅ Install prompts for better UX
- ✅ Offline fallback UI
- ✅ Update notifications
- ✅ Smart caching strategies
- ✅ Online/offline indicators

---

## Features

### 1. Installable
Users can install the app on their devices:
- **Desktop**: Install via browser's install prompt or address bar icon
- **Mobile**: "Add to Home Screen" option
- **Custom Prompt**: Appears after 5 seconds (dismissible)

### 2. Offline Support
The app works without internet connection:
- Cached static assets (JS, CSS, HTML, fonts)
- Cached images and media
- API responses cached with NetworkFirst strategy
- Offline fallback page for navigation errors

### 3. Performance
Improved load times through aggressive caching:
- **Static Assets**: Precached during installation
- **API Calls**: Cached for 5 minutes
- **Images**: Cached for 30 days
- **Fonts**: Cached for 1 year

### 4. Update Management
Seamless updates without disrupting user:
- Update prompt when new version available
- User chooses when to update
- Automatic reload after update

### 5. Network Awareness
UI adapts to connection status:
- Offline banner when disconnected
- "Back online" notification when reconnected
- Automatic data sync after reconnection

---

## Service Worker

### Configuration
**File**: `vite.config.ts`

```typescript
VitePWA({
  registerType: "prompt",
  workbox: {
    globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
    cleanupOutdatedCaches: true,
    skipWaiting: false, // Wait for user confirmation
    clientsClaim: true,
  },
})
```

### Registration
**File**: `src/main.tsx`

Service worker is registered automatically on app load:

```typescript
const workbox = new Workbox('/sw.js', { scope: '/' });
workbox.register();
```

### Lifecycle Events

1. **Installing**: Service worker downloading and caching assets
2. **Waiting**: New version ready but old one still active
3. **Activated**: New service worker takes control
4. **Controlling**: Service worker managing page requests

---

## Caching Strategies

### 1. Cache First (Static Assets)
Used for: Images, fonts, icons

```typescript
{
  urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
  handler: "CacheFirst",
  options: {
    cacheName: "image-cache",
    expiration: {
      maxEntries: 50,
      maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
    },
  },
}
```

**How it works:**
1. Check cache first
2. If found, return cached version (fast!)
3. If not found, fetch from network and cache

**Best for:** Assets that rarely change

### 2. Network First (API Calls)
Used for: API requests, dynamic content

```typescript
{
  urlPattern: /\/api\/.*/i,
  handler: "NetworkFirst",
  options: {
    cacheName: "api-cache",
    networkTimeoutSeconds: 10,
    expiration: {
      maxEntries: 100,
      maxAgeSeconds: 60 * 5, // 5 minutes
    },
  },
}
```

**How it works:**
1. Try network first (10 second timeout)
2. If network fails or times out, use cache
3. Update cache with network response

**Best for:** API calls, fresh data preferred

### 3. Precaching (Critical Assets)
Used for: HTML, JS, CSS, fonts

```typescript
globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"]
```

**How it works:**
1. All matching files cached during installation
2. Updated when service worker updates
3. Always available offline

**Best for:** Core app functionality

---

## Installation

### User Flow

1. **Prompt Appears** (after 5 seconds)
   - Shows custom install UI
   - User can install or dismiss
   - Dismissed state saved for session

2. **Installation**
   - User clicks "Install"
   - Browser's native prompt appears
   - User confirms installation
   - App added to home screen/apps

3. **Post-Install**
   - App opens in standalone mode
   - Looks and feels like native app
   - Icon appears in app launcher

### Install Prompt Component
**File**: `src/shared/components/pwa/InstallPrompt.tsx`

**Features:**
- ✅ Automatic detection of installability
- ✅ Custom UI matching app design
- ✅ Dismissible with session storage
- ✅ Hidden when already installed

**Customization:**
```typescript
// Adjust delay before showing prompt
setTimeout(() => {
  setShowPrompt(true);
}, 5000); // 5 seconds - change as needed
```

### Detecting Installation

```typescript
// Check if app is installed
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('App is installed');
}

// Listen for installation
window.addEventListener('appinstalled', () => {
  console.log('App installed successfully');
});
```

---

## Offline Support

### Offline Indicator
**File**: `src/shared/components/pwa/OfflineIndicator.tsx`

Shows banner when offline:
- Yellow banner: "You're offline"
- Green banner: "Back online" (3 seconds)
- Automatically detects connection status

### Online Status Hook
**File**: `src/shared/hooks/useOnlineStatus.ts`

```typescript
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus';

function MyComponent() {
  const isOnline = useOnlineStatus();
  
  return (
    <div>
      Status: {isOnline ? 'Online' : 'Offline'}
    </div>
  );
}
```

### Offline Page
**File**: `src/shared/components/pwa/OfflinePage.tsx`

Shown when user navigates offline:
- Clear offline message
- Retry button
- Explanation of limited functionality

**Usage:**
```typescript
// Can be used as a route fallback
<Route path="/offline" component={OfflinePage} />
```

---

## Updates

### Update Prompt
**File**: `src/shared/components/pwa/UpdatePrompt.tsx`

Appears when new version available:
- "Update Available" notification
- User can update now or later
- Shows loading state during update
- Auto-reloads after update

### Update Flow

1. **New Version Deployed**
   - User visits app
   - Service worker detects new version
   - New service worker enters "waiting" state

2. **Update Prompt Shown**
   - User sees notification
   - Can choose "Update Now" or "Later"

3. **Update Process**
   - User clicks "Update Now"
   - `skipWaiting()` message sent to service worker
   - Service worker activates
   - Page reloads with new version

### Manual Update Check

```typescript
import { workbox } from '@/main';

// Check for updates
if (workbox) {
  workbox.update();
}
```

---

## Configuration

### Manifest (manifest.json)
**File**: `public/manifest.json`

```json
{
  "name": "Mustafa Raad Dashboard",
  "short_name": "Dashboard",
  "description": "Modern React Dashboard with PWA support",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0f172a"
}
```

**Key Properties:**
- `name`: Full app name (shows on splash screen)
- `short_name`: Name under icon (max 12 chars)
- `display`: `standalone` for app-like experience
- `theme_color`: Browser UI color
- `background_color`: Splash screen color
- `start_url`: URL when app launches

### Vite PWA Plugin
**File**: `vite.config.ts`

```typescript
VitePWA({
  registerType: "prompt", // Wait for user confirmation
  includeAssets: [...],   // Assets to precache
  manifest: {...},        // Web app manifest
  workbox: {...},         // Service worker config
  devOptions: {
    enabled: true,        // Enable in development
  },
})
```

### Cache Names
Organized by content type:

| Cache Name | Content | Max Entries | Max Age |
|-----------|---------|-------------|---------|
| `precache` | HTML, JS, CSS | Unlimited | Until update |
| `image-cache` | Images | 50 | 30 days |
| `api-cache` | API responses | 100 | 5 minutes |
| `google-fonts-cache` | Google Fonts CSS | 10 | 1 year |
| `gstatic-fonts-cache` | Font files | 10 | 1 year |

---

## Testing

### Development Testing

1. **Enable PWA in Dev Mode**
   ```typescript
   devOptions: {
     enabled: true,
     type: "module",
   }
   ```

2. **Start Dev Server**
   ```bash
   pnpm dev
   ```

3. **Open DevTools**
   - Application tab → Service Workers
   - Verify service worker is registered
   - Check "Update on reload" for testing updates

### Production Testing

1. **Build App**
   ```bash
   pnpm build
   ```

2. **Preview Build**
   ```bash
   pnpm preview
   ```

3. **Test Features**
   - Install prompt appears
   - App can be installed
   - Works offline
   - Updates properly

### Lighthouse Audit

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse http://localhost:5018 --view
```

**PWA Checklist:**
- [ ] Manifest present
- [ ] Service worker registered
- [ ] Works offline
- [ ] Installable
- [ ] Themed splash screen
- [ ] Accessible
- [ ] Fast load time

### Manual Testing

**Install Flow:**
1. Visit app in browser
2. Wait for install prompt (5 seconds)
3. Click "Install"
4. Confirm installation
5. Verify app opens standalone

**Offline Flow:**
1. Open app
2. Open DevTools → Network
3. Check "Offline"
4. Navigate pages
5. Verify cached pages work
6. Verify offline banner shows

**Update Flow:**
1. Make code changes
2. Build new version
3. Deploy
4. User opens app
5. Update prompt appears
6. User clicks "Update Now"
7. App reloads with new version

---

## Best Practices

### 1. Cache Appropriately

**DO:**
- ✅ Precache critical assets (HTML, JS, CSS)
- ✅ Use Cache First for static images
- ✅ Use Network First for API calls
- ✅ Set reasonable expiration times

**DON'T:**
- ❌ Cache sensitive data indefinitely
- ❌ Cache too many large files
- ❌ Use Cache First for dynamic content

### 2. Handle Offline Gracefully

```typescript
// Check online status before API call
if (!navigator.onLine) {
  showOfflineMessage();
  return;
}

try {
  await apiFetch(endpoint);
} catch (error) {
  if (!navigator.onLine) {
    showOfflineMessage();
  } else {
    showErrorMessage();
  }
}
```

### 3. Update Strategy

```typescript
// Don't force updates immediately
registerType: "prompt" // Let user choose

// Clean up old caches
cleanupOutdatedCaches: true

// Don't skip waiting automatically
skipWaiting: false
```

### 4. User Communication

- Show clear offline indicators
- Explain what works offline
- Notify when updates available
- Don't interrupt user workflow

### 5. Performance

```typescript
// Limit cache sizes
expiration: {
  maxEntries: 50,     // Prevent unlimited growth
  maxAgeSeconds: 2592000, // 30 days
}

// Set network timeouts
networkTimeoutSeconds: 10, // Don't wait forever
```

### 6. Icons and Assets

- Provide multiple icon sizes
- Use maskable icons for Android
- Optimize icon file sizes
- Test on multiple devices

### 7. Testing

- Test on real devices
- Test offline functionality
- Test update flow
- Run Lighthouse audits regularly

### 8. Analytics

```typescript
// Track PWA events
window.addEventListener('appinstalled', () => {
  analytics.track('PWA Installed');
});

workbox?.addEventListener('activated', (event) => {
  analytics.track('PWA Updated', { 
    isUpdate: event.isUpdate 
  });
});
```

---

## Troubleshooting

### Service Worker Not Registering

**Check:**
1. HTTPS enabled (required for PWA)
2. Service worker file path correct
3. No console errors
4. Browser supports service workers

**Fix:**
```typescript
if ('serviceWorker' in navigator) {
  // Browser supports service workers
  navigator.serviceWorker.register('/sw.js')
    .catch(error => console.error('SW registration failed:', error));
}
```

### Offline Page Not Showing

**Check:**
1. Offline page cached
2. Network First strategy configured
3. Fallback route set up

**Fix:**
```typescript
// Add to workbox config
navigateFallback: '/offline',
navigateFallbackAllowlist: [/^(?!\/__).*/],
```

### Update Not Applying

**Check:**
1. `skipWaiting: false` set correctly
2. Update prompt sending `skipWaiting()` message
3. Page reloading after activation

**Fix:**
```typescript
// In UpdatePrompt component
workbox?.messageSkipWaiting();

// Listen for controlling event
workbox?.addEventListener('controlling', () => {
  window.location.reload();
});
```

### Install Prompt Not Showing

**Check:**
1. App not already installed
2. Manifest properly configured
3. HTTPS enabled
4. PWA criteria met

**Fix:**
```typescript
// Listen for beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('Install prompt available');
  e.preventDefault(); // Prevent default
  // Store for custom prompt
});
```

---

## Resources

- [MDN: Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [web.dev: PWA](https://web.dev/progressive-web-apps/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- [PWA Builder](https://www.pwabuilder.com/)

---

## Summary

The application is now a fully functional PWA with:
- ✅ Offline support via service worker
- ✅ Install prompts for better engagement
- ✅ Smart caching for performance
- ✅ Update notifications
- ✅ Network status awareness
- ✅ App-like experience

**Next Steps:**
1. Add custom PWA icons (see PWA_ICONS.md)
2. Test on real devices
3. Run Lighthouse audit
4. Deploy to HTTPS server
5. Submit to app stores (optional)

**Last Updated:** December 2024
