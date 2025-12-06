# API Layer Enhancements

## Overview

The API client now includes advanced features for production-ready applications:

- **Request/Response Interceptors**: Modify requests and responses globally
- **Retry Logic with Exponential Backoff**: Automatically retry failed requests
- **Performance Monitoring**: Track API call duration and metrics
- **Logging**: Debug requests, responses, and errors
- **Custom Headers**: Add headers to all requests
- **Auth Token Refresh**: Automatically refresh expired tokens

## Table of Contents

1. [Quick Start](#quick-start)
2. [Interceptors](#interceptors)
3. [Retry Logic](#retry-logic)
4. [Configuration](#configuration)
5. [Built-in Interceptors](#built-in-interceptors)
6. [Examples](#examples)
7. [Best Practices](#best-practices)

## Quick Start

### Development Setup

```typescript
import { setupApiConfig, API_PRESETS } from "@/core/api/client";

// Initialize API with development preset
const cleanup = setupApiConfig(API_PRESETS.development());

// Later, cleanup when app unmounts
cleanup();
```

### Production Setup

```typescript
import { setupApiConfig, API_PRESETS } from "@/core/api/client";

// Initialize API with production preset
const cleanup = setupApiConfig(
  API_PRESETS.production((metric) => {
    // Send metrics to your analytics service
    analytics.track("api_request", {
      endpoint: metric.endpoint,
      duration: metric.duration,
      status: metric.status,
    });
  })
);
```

## Interceptors

Interceptors allow you to modify requests and responses globally before they're processed.

### Request Interceptors

Modify outgoing requests:

```typescript
import { addRequestInterceptor } from "@/core/api/client";

// Add custom header to all requests
const unregister = addRequestInterceptor((config) => {
  return {
    ...config,
    headers: {
      ...config.headers,
      "X-Client-Version": "1.0.0",
    },
  };
});

// Later, remove the interceptor
unregister();
```

### Response Interceptors

Modify incoming responses:

```typescript
import { addResponseInterceptor } from "@/core/api/client";

// Log slow requests
const unregister = addResponseInterceptor((response) => {
  if (response.metadata?.duration && response.metadata.duration > 2000) {
    console.warn(
      `Slow request: ${response.metadata.endpoint} took ${response.metadata.duration}ms`
    );
  }
  return response;
});
```

### Error Interceptors

Handle errors or recover from them:

```typescript
import { addErrorInterceptor } from "@/core/api/client";

// Retry with refreshed token on 401
const unregister = addErrorInterceptor(async (error) => {
  if (error.code === 401) {
    const newToken = await refreshAuthToken();

    if (newToken) {
      // Return a recovery response to signal retry
      return {
        ok: true,
        status: 200,
        statusText: "Token Refreshed",
        headers: new Headers(),
        body: { tokenRefreshed: true },
        metadata: error.metadata,
      };
    }
  }

  // Return error unchanged
  return error;
});
```

## Retry Logic

### Default Retry Behavior

By default, the API client retries:

- **Max retries**: 3 attempts
- **Initial delay**: 1000ms
- **Max delay**: 30000ms
- **Backoff multiplier**: 2x
- **Jitter**: Enabled (±25% randomization)
- **Retryable status codes**: 408, 429, 500, 502, 503, 504

### Custom Retry Configuration

#### Per-Request Retry

```typescript
import { apiFetch, endpoints } from "@/core/api/client";

// Custom retry for specific request
const data = await apiFetch(endpoints.users.list, {
  retryConfig: {
    maxRetries: 5,
    initialDelay: 2000,
    onRetry: (attempt, error, delay) => {
      console.log(`Retry attempt ${attempt} after ${delay}ms`);
    },
  },
});
```

#### Retry Presets

```typescript
import { createRetryConfig } from "@/core/api/client";

// Fast retry (time-sensitive operations)
const fastRetry = createRetryConfig("fast");
// maxRetries: 2, initialDelay: 500ms, maxDelay: 2000ms

// Standard retry (most operations)
const standardRetry = createRetryConfig("standard");
// maxRetries: 3, initialDelay: 1000ms, maxDelay: 30000ms

// Persistent retry (critical operations)
const persistentRetry = createRetryConfig("persistent");
// maxRetries: 5, initialDelay: 2000ms, maxDelay: 60000ms
```

#### Custom Retry Logic

```typescript
const data = await apiFetch(endpoints.users.create, {
  retryConfig: {
    maxRetries: 3,
    shouldRetry: (error) => {
      // Custom logic: only retry on specific errors
      return error.code === 503 || error.isNetworkError;
    },
  },
});
```

### Exponential Backoff

The retry logic uses exponential backoff to avoid overwhelming the server:

```
Attempt 1: Wait 1000ms
Attempt 2: Wait 2000ms (1000 * 2)
Attempt 3: Wait 4000ms (2000 * 2)
Attempt 4: Wait 8000ms (4000 * 2)
```

With jitter enabled, delays are randomized ±25% to prevent thundering herd:

```
Attempt 1: Wait 750-1250ms
Attempt 2: Wait 1500-2500ms
Attempt 3: Wait 3000-5000ms
```

## Configuration

### Setup API Config

```typescript
import { setupApiConfig, ApiConfig } from "@/core/api/client";

const config: ApiConfig = {
  // Enable logging
  logging: {
    requests: true,
    responses: true,
    errors: true,
  },

  // Enable performance monitoring
  performance: {
    enabled: true,
    onMetric: (metric) => {
      console.log(`API call: ${metric.endpoint} took ${metric.duration}ms`);
    },
  },

  // Add custom headers
  headers: {
    "X-App-Version": "1.0.0",
    "X-Platform": "web",
  },

  // Or use a function for dynamic headers
  headers: () => ({
    "X-Timestamp": Date.now().toString(),
  }),

  // Auto-refresh tokens
  authRefresh: {
    enabled: true,
    refreshToken: async () => {
      const response = await fetch("/api/auth/refresh", { method: "POST" });
      const data = await response.json();
      return data.accessToken;
    },
  },

  // Custom interceptors
  interceptors: {
    request: [
      (config) => {
        // Modify request
        return config;
      },
    ],
    response: [
      (response) => {
        // Modify response
        return response;
      },
    ],
    error: [
      async (error) => {
        // Handle error
        return error;
      },
    ],
  },

  // Retry configuration
  retry: "standard", // or 'fast', 'persistent', or custom config
};

const cleanup = setupApiConfig(config);
```

### Clear All Interceptors

```typescript
import { clearInterceptors } from "@/core/api/client";

// Remove all registered interceptors
clearInterceptors();
```

## Built-in Interceptors

### Logging Interceptor

```typescript
import {
  createLoggingInterceptor,
  addRequestInterceptor,
  addResponseInterceptor,
  addErrorInterceptor,
} from "@/core/api/client";

const { requestInterceptor, responseInterceptor, errorInterceptor } =
  createLoggingInterceptor({
    logRequests: true,
    logResponses: true,
    logErrors: true,
  });

if (requestInterceptor) addRequestInterceptor(requestInterceptor);
if (responseInterceptor) addResponseInterceptor(responseInterceptor);
if (errorInterceptor) addErrorInterceptor(errorInterceptor);
```

### Performance Monitoring Interceptor

```typescript
import {
  createPerformanceInterceptor,
  addRequestInterceptor,
  addResponseInterceptor,
} from "@/core/api/client";

const { requestInterceptor, responseInterceptor } =
  createPerformanceInterceptor((metric) => {
    // Send to analytics
    analytics.track("api_performance", metric);

    // Alert on slow requests
    if (metric.duration > 3000) {
      alert(`Slow API call: ${metric.endpoint}`);
    }
  });

addRequestInterceptor(requestInterceptor);
addResponseInterceptor(responseInterceptor);
```

### Custom Headers Interceptor

```typescript
import {
  createHeadersInterceptor,
  addRequestInterceptor,
} from "@/core/api/client";

const headersInterceptor = createHeadersInterceptor(() => ({
  "X-Request-ID": crypto.randomUUID(),
  "X-Timestamp": new Date().toISOString(),
}));

addRequestInterceptor(headersInterceptor);
```

### Auth Refresh Interceptor

```typescript
import {
  createAuthRefreshInterceptor,
  addErrorInterceptor,
} from "@/core/api/client";

const authInterceptor = createAuthRefreshInterceptor(async () => {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) return null;

    const data = await response.json();

    // Update auth store
    useAuthStore.getState().setTokens(data);

    return data.accessToken;
  } catch {
    return null;
  }
});

addErrorInterceptor(authInterceptor);
```

## Examples

### Example 1: Development Environment Setup

```typescript
// src/main.tsx
import { setupApiConfig } from "@/core/api/client";

if (import.meta.env.DEV) {
  setupApiConfig({
    logging: {
      requests: true,
      responses: true,
      errors: true,
    },
    performance: {
      enabled: true,
      onMetric: (metric) => {
        if (metric.duration > 1000) {
          console.warn(
            `Slow request: ${metric.endpoint} (${metric.duration}ms)`
          );
        }
      },
    },
    retry: "fast",
  });
}
```

### Example 2: Production Environment Setup

```typescript
// src/main.tsx
import { setupApiConfig } from "@/core/api/client";

if (import.meta.env.PROD) {
  setupApiConfig({
    logging: {
      errors: true, // Only log errors in production
    },
    performance: {
      enabled: true,
      onMetric: (metric) => {
        // Send to analytics service
        window.gtag?.("event", "api_call", {
          endpoint: metric.endpoint,
          duration: metric.duration,
          status: metric.status,
        });
      },
    },
    headers: {
      "X-App-Version": import.meta.env.VITE_APP_VERSION,
      "X-Build": import.meta.env.VITE_BUILD_ID,
    },
    authRefresh: {
      enabled: true,
      refreshToken: async () => {
        const { refreshAccessToken } = await import(
          "@/features/auth/api/auth.api"
        );
        return refreshAccessToken();
      },
    },
    retry: "persistent",
  });
}
```

### Example 3: Request with Custom Retry

```typescript
import { apiFetch, endpoints } from "@/core/api/client";

async function uploadFile(file: File) {
  // Upload with persistent retry (critical operation)
  return apiFetch(endpoints.files.upload, {
    body: { file },
    retryConfig: {
      maxRetries: 5,
      initialDelay: 2000,
      maxDelay: 60000,
      onRetry: (attempt, error, delay) => {
        toast.info(`Upload failed, retrying (${attempt}/5)...`);
      },
      shouldRetry: (error) => {
        // Don't retry on 413 (Payload Too Large)
        if (error.code === 413) return false;

        // Retry on network errors and 5xx
        return error.isNetworkError || error.code >= 500;
      },
    },
  });
}
```

### Example 4: Custom Interceptor Chain

```typescript
import {
  addRequestInterceptor,
  addResponseInterceptor,
  addErrorInterceptor,
} from "@/core/api/client";

// 1. Add request ID to all requests
addRequestInterceptor((config) => ({
  ...config,
  headers: {
    ...config.headers,
    "X-Request-ID": crypto.randomUUID(),
  },
  metadata: {
    ...config.metadata,
    requestId: crypto.randomUUID(),
  },
}));

// 2. Track request timing
addRequestInterceptor((config) => ({
  ...config,
  metadata: {
    ...config.metadata,
    startTime: Date.now(),
  },
}));

// 3. Log response time
addResponseInterceptor((response) => {
  const startTime = response.metadata?.startTime as number;
  const duration = Date.now() - startTime;

  console.log(`Request ${response.metadata?.requestId} took ${duration}ms`);

  return response;
});

// 4. Handle specific errors
addErrorInterceptor(async (error) => {
  if (error.code === 503) {
    toast.error("Service temporarily unavailable. Retrying...");
  }

  return error;
});
```

### Example 5: Programmatic Retry

```typescript
import { withRetry, createRetryConfig } from "@/core/api/client";

// Wrap any async function with retry logic
const fetchUserData = withRetry(async () => {
  const response = await fetch("/api/user/profile");
  if (!response.ok) throw new Error("Failed to fetch user");
  return response.json();
}, createRetryConfig("standard"));

const userData = await fetchUserData();
```

## Best Practices

### 1. Use Appropriate Retry Strategies

```typescript
// ✅ Fast retry for time-sensitive operations
const searchResults = await apiFetch(endpoints.search, {
  query: { q: searchTerm },
  retryConfig: createRetryConfig("fast"),
});

// ✅ Standard retry for most operations
const users = await apiFetch(endpoints.users.list);

// ✅ Persistent retry for critical operations
const payment = await apiFetch(endpoints.payments.process, {
  body: paymentData,
  retryConfig: createRetryConfig("persistent"),
});
```

### 2. Skip Retry for Non-Idempotent Operations

```typescript
// ❌ Don't retry POST/PUT/DELETE without careful consideration
const order = await apiFetch(endpoints.orders.create, {
  body: orderData,
  retryConfig: {
    maxRetries: 0, // Disable retry to avoid duplicate orders
  },
});
```

### 3. Use Interceptors for Cross-Cutting Concerns

```typescript
// ✅ Good: Centralized logging
addRequestInterceptor((config) => {
  logger.info("API Request", { url: config.url, method: config.method });
  return config;
});

// ❌ Bad: Logging in every API call
const users = await apiFetch(endpoints.users.list);
logger.info("Fetched users");
```

### 4. Cleanup Interceptors When No Longer Needed

```typescript
// ✅ Good: Cleanup in useEffect
useEffect(() => {
  const cleanup = setupApiConfig(config);

  return () => {
    cleanup(); // Remove interceptors on unmount
  };
}, []);

// ❌ Bad: Never cleanup
setupApiConfig(config); // Memory leak!
```

### 5. Monitor Performance in Production

```typescript
// ✅ Good: Track all API calls
setupApiConfig({
  performance: {
    enabled: true,
    onMetric: (metric) => {
      // Send to APM service
      newrelic.addPageAction("api_call", metric);
    },
  },
});
```

### 6. Handle Errors Gracefully

```typescript
// ✅ Good: Provide user feedback on retry
apiFetch(endpoints.users.create, {
  body: userData,
  retryConfig: {
    onRetry: (attempt) => {
      toast.info(`Retrying... (${attempt}/3)`);
    },
  },
});
```

### 7. Use Skip Interceptors for Special Cases

```typescript
// ✅ Skip interceptors for health checks
const health = await apiFetch(endpoints.health, {
  skipInterceptors: true, // Don't log, monitor, or retry
});
```

## API Reference

### Types

```typescript
interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
  retryableStatusCodes: number[];
  shouldRetry?: (error: RetryableError) => boolean;
  onRetry?: (attempt: number, error: RetryableError, delay: number) => void;
}

interface ApiConfig {
  logging?: {
    requests?: boolean;
    responses?: boolean;
    errors?: boolean;
  };
  performance?: {
    enabled?: boolean;
    onMetric?: (metric: {
      endpoint: string;
      duration: number;
      status: number;
      timestamp: number;
    }) => void;
  };
  headers?:
    | Record<string, string>
    | (() => Record<string, string> | Promise<Record<string, string>>);
  authRefresh?: {
    enabled?: boolean;
    refreshToken: () => Promise<string | null>;
  };
  interceptors?: {
    request?: RequestInterceptor[];
    response?: ResponseInterceptor[];
    error?: ErrorInterceptor[];
  };
  retry?: "fast" | "standard" | "persistent" | Partial<RetryConfig>;
}
```

### Functions

- `setupApiConfig(config: ApiConfig): () => void` - Initialize API configuration
- `addRequestInterceptor(interceptor: RequestInterceptor): () => void` - Add request interceptor
- `addResponseInterceptor(interceptor: ResponseInterceptor): () => void` - Add response interceptor
- `addErrorInterceptor(interceptor: ErrorInterceptor): () => void` - Add error interceptor
- `clearInterceptors(): void` - Remove all interceptors
- `createRetryConfig(scenario: 'fast' | 'standard' | 'persistent'): RetryConfig` - Create retry preset
- `withRetry<T>(fn: () => Promise<T>, config?: Partial<RetryConfig>): Promise<T>` - Wrap function with retry

---

**Need Help?** Check the examples above or refer to the inline documentation in the source code.
