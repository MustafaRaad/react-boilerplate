/**
 * API Configuration and Setup Utilities
 * Provides easy setup and configuration for API interceptors and retry behavior
 */

import {
  addRequestInterceptor,
  addResponseInterceptor,
  addErrorInterceptor,
  createLoggingInterceptor,
  createPerformanceInterceptor,
  createHeadersInterceptor,
  createAuthRefreshInterceptor,
  type RequestInterceptor,
  type ResponseInterceptor,
  type ErrorInterceptor,
} from "./interceptors";

import { createRetryConfig, type RetryConfig } from "./retry";

export interface ApiConfig {
  /**
   * Enable request/response logging
   */
  logging?: {
    requests?: boolean;
    responses?: boolean;
    errors?: boolean;
  };

  /**
   * Enable performance monitoring
   */
  performance?: {
    enabled?: boolean;
    onMetric?: (metric: {
      endpoint: string;
      duration: number;
      status: number;
      timestamp: number;
    }) => void;
  };

  /**
   * Custom headers to include in all requests
   */
  headers?:
    | Record<string, string>
    | (() => Record<string, string> | Promise<Record<string, string>>);

  /**
   * Auto-refresh authentication tokens on 401 errors
   */
  authRefresh?: {
    enabled?: boolean;
    refreshToken: () => Promise<string | null>;
  };

  /**
   * Custom interceptors
   */
  interceptors?: {
    request?: RequestInterceptor[];
    response?: ResponseInterceptor[];
    error?: ErrorInterceptor[];
  };

  /**
   * Retry configuration preset or custom config
   */
  retry?: "fast" | "standard" | "persistent" | Partial<RetryConfig>;
}

/**
 * Global API configuration
 */
let globalRetryConfig: RetryConfig | undefined;

/**
 * Initialize API configuration with interceptors and retry behavior
 */
export function setupApiConfig(config: ApiConfig): () => void {
  const cleanupFunctions: Array<() => void> = [];

  // Setup logging interceptors
  if (config.logging) {
    const loggingInterceptors = createLoggingInterceptor({
      logRequests: config.logging.requests,
      logResponses: config.logging.responses,
      logErrors: config.logging.errors,
    });

    if (loggingInterceptors.requestInterceptor) {
      cleanupFunctions.push(
        addRequestInterceptor(loggingInterceptors.requestInterceptor)
      );
    }

    if (loggingInterceptors.responseInterceptor) {
      cleanupFunctions.push(
        addResponseInterceptor(loggingInterceptors.responseInterceptor)
      );
    }

    if (loggingInterceptors.errorInterceptor) {
      cleanupFunctions.push(
        addErrorInterceptor(loggingInterceptors.errorInterceptor)
      );
    }
  }

  // Setup performance monitoring
  if (config.performance?.enabled && config.performance.onMetric) {
    const perfInterceptors = createPerformanceInterceptor(
      config.performance.onMetric
    );
    cleanupFunctions.push(
      addRequestInterceptor(perfInterceptors.requestInterceptor)
    );
    cleanupFunctions.push(
      addResponseInterceptor(perfInterceptors.responseInterceptor)
    );
  }

  // Setup custom headers
  if (config.headers) {
    const headersInterceptor = createHeadersInterceptor(
      typeof config.headers === "function"
        ? config.headers
        : () => config.headers as Record<string, string>
    );
    cleanupFunctions.push(addRequestInterceptor(headersInterceptor));
  }

  // Setup auth refresh
  if (config.authRefresh?.enabled && config.authRefresh.refreshToken) {
    const authInterceptor = createAuthRefreshInterceptor(
      config.authRefresh.refreshToken
    );
    cleanupFunctions.push(addErrorInterceptor(authInterceptor));
  }

  // Setup custom interceptors
  if (config.interceptors?.request) {
    config.interceptors.request.forEach((interceptor) => {
      cleanupFunctions.push(addRequestInterceptor(interceptor));
    });
  }

  if (config.interceptors?.response) {
    config.interceptors.response.forEach((interceptor) => {
      cleanupFunctions.push(addResponseInterceptor(interceptor));
    });
  }

  if (config.interceptors?.error) {
    config.interceptors.error.forEach((interceptor) => {
      cleanupFunctions.push(addErrorInterceptor(interceptor));
    });
  }

  // Setup retry configuration
  if (config.retry) {
    if (typeof config.retry === "string") {
      globalRetryConfig = createRetryConfig(config.retry);
    } else {
      globalRetryConfig = config.retry as RetryConfig;
    }
  }

  // Return cleanup function to remove all interceptors
  return () => {
    cleanupFunctions.forEach((cleanup) => cleanup());
    globalRetryConfig = undefined;
  };
}

/**
 * Get global retry configuration
 */
export function getGlobalRetryConfig(): RetryConfig | undefined {
  return globalRetryConfig;
}

/**
 * Preset configurations for common scenarios
 */
export const API_PRESETS = {
  /**
   * Development preset with logging and relaxed retry
   */
  development: (): ApiConfig => ({
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
            `[API Slow Request] ${metric.endpoint} took ${metric.duration}ms`
          );
        }
      },
    },
    retry: "fast",
  }),

  /**
   * Production preset with performance monitoring and persistent retry
   */
  production: (
    onMetric?: (metric: {
      endpoint: string;
      duration: number;
      status: number;
      timestamp: number;
    }) => void
  ): ApiConfig => ({
    logging: {
      errors: true,
    },
    performance: {
      enabled: !!onMetric,
      onMetric,
    },
    retry: "persistent",
  }),

  /**
   * Testing preset with no retry and minimal logging
   */
  testing: (): ApiConfig => ({
    retry: {
      maxRetries: 0,
      initialDelay: 0,
      maxDelay: 0,
      backoffMultiplier: 1,
      jitter: false,
      retryableStatusCodes: [],
    },
  }),
};

/**
 * Re-export commonly used functions for convenience
 */
export {
  addRequestInterceptor,
  addResponseInterceptor,
  addErrorInterceptor,
  clearInterceptors,
  createLoggingInterceptor,
  createPerformanceInterceptor,
  createHeadersInterceptor,
  createAuthRefreshInterceptor,
} from "./interceptors";

export { createRetryConfig } from "./retry";

export type {
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
  RequestConfig,
  InterceptedResponse,
  InterceptedError,
} from "./interceptors";

export type { RetryConfig, RetryableError, RetryState } from "./retry";
