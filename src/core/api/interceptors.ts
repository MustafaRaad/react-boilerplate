/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

/**
 * API Interceptors
 * Provides request/response interceptor system for the API client
 */

export type RequestInterceptor = (
  config: RequestConfig
) => RequestConfig | Promise<RequestConfig>;

export type ResponseInterceptor = (
  response: InterceptedResponse
) => InterceptedResponse | Promise<InterceptedResponse>;

export type ErrorInterceptor = (
  error: InterceptedError
) => Promise<InterceptedError | InterceptedResponse>;

export interface RequestConfig {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
  metadata?: {
    endpoint: string;
    timestamp: number;
    [key: string]: unknown;
  };
}

export interface InterceptedResponse {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Headers;
  body: unknown;
  metadata?: {
    endpoint: string;
    duration: number;
    timestamp: number;
    [key: string]: unknown;
  };
}

export interface InterceptedError {
  code: number;
  message: string;
  raw: unknown;
  metadata?: {
    endpoint: string;
    timestamp: number;
    [key: string]: unknown;
  };
}

interface InterceptorManager {
  request: RequestInterceptor[];
  response: ResponseInterceptor[];
  error: ErrorInterceptor[];
}

// Global interceptor storage
const interceptors: InterceptorManager = {
  request: [],
  response: [],
  error: [],
};

/**
 * Register a request interceptor
 * Interceptors are executed in the order they are registered
 */
export function addRequestInterceptor(
  interceptor: RequestInterceptor
): () => void {
  interceptors.request.push(interceptor);

  // Return unregister function
  return () => {
    const index = interceptors.request.indexOf(interceptor);
    if (index > -1) {
      interceptors.request.splice(index, 1);
    }
  };
}

/**
 * Register a response interceptor
 * Interceptors are executed in the order they are registered
 */
export function addResponseInterceptor(
  interceptor: ResponseInterceptor
): () => void {
  interceptors.response.push(interceptor);

  // Return unregister function
  return () => {
    const index = interceptors.response.indexOf(interceptor);
    if (index > -1) {
      interceptors.response.splice(index, 1);
    }
  };
}

/**
 * Register an error interceptor
 * Interceptors are executed in the order they are registered
 */
export function addErrorInterceptor(interceptor: ErrorInterceptor): () => void {
  interceptors.error.push(interceptor);

  // Return unregister function
  return () => {
    const index = interceptors.error.indexOf(interceptor);
    if (index > -1) {
      interceptors.error.splice(index, 1);
    }
  };
}

/**
 * Clear all interceptors
 */
export function clearInterceptors(): void {
  interceptors.request = [];
  interceptors.response = [];
  interceptors.error = [];
}

/**
 * Get current interceptors (read-only)
 */
export function getInterceptors(): Readonly<InterceptorManager> {
  return {
    request: [...interceptors.request],
    response: [...interceptors.response],
    error: [...interceptors.error],
  };
}

/**
 * Execute request interceptors in sequence
 */
export async function executeRequestInterceptors(
  config: RequestConfig
): Promise<RequestConfig> {
  let modifiedConfig = config;

  for (const interceptor of interceptors.request) {
    modifiedConfig = await interceptor(modifiedConfig);
  }

  return modifiedConfig;
}

/**
 * Execute response interceptors in sequence
 */
export async function executeResponseInterceptors(
  response: InterceptedResponse
): Promise<InterceptedResponse> {
  let modifiedResponse = response;

  for (const interceptor of interceptors.response) {
    modifiedResponse = await interceptor(modifiedResponse);
  }

  return modifiedResponse;
}

/**
 * Execute error interceptors in sequence
 * Error interceptors can transform errors or recover from them
 */
export async function executeErrorInterceptors(
  error: InterceptedError
): Promise<InterceptedError | InterceptedResponse> {
  let result: InterceptedError | InterceptedResponse = error;

  for (const interceptor of interceptors.error) {
    result = await interceptor(result as InterceptedError);

    // If an interceptor recovered from the error, stop processing
    if ("ok" in result && result.ok) {
      return result;
    }
  }

  return result;
}

/**
 * Built-in interceptors
 */

/**
 * Logging interceptor for debugging
 */
export function createLoggingInterceptor(options: {
  logRequests?: boolean;
  logResponses?: boolean;
  logErrors?: boolean;
}): {
  requestInterceptor?: RequestInterceptor;
  responseInterceptor?: ResponseInterceptor;
  errorInterceptor?: ErrorInterceptor;
} {
  const { logRequests = true, logResponses = true, logErrors = true } = options;

  return {
    requestInterceptor: logRequests
      ? (config) => {
          console.log("[API Request]", {
            method: config.method,
            url: config.url,
            headers: config.headers,
            timestamp: config.metadata?.timestamp,
          });
          return config;
        }
      : undefined,

    responseInterceptor: logResponses
      ? (response) => {
          console.log("[API Response]", {
            status: response.status,
            ok: response.ok,
            duration: response.metadata?.duration,
            timestamp: response.metadata?.timestamp,
          });
          return response;
        }
      : undefined,

    errorInterceptor: logErrors
      ? async (error) => {
          console.error("[API Error]", {
            code: error.code,
            message: error.message,
            endpoint: error.metadata?.endpoint,
            timestamp: error.metadata?.timestamp,
          });
          return error;
        }
      : undefined,
  };
}

/**
 * Performance monitoring interceptor
 */
export function createPerformanceInterceptor(
  onMetric: (metric: {
    endpoint: string;
    duration: number;
    status: number;
    timestamp: number;
  }) => void
): {
  requestInterceptor: RequestInterceptor;
  responseInterceptor: ResponseInterceptor;
} {
  return {
    requestInterceptor: (config) => {
      config.metadata = {
        ...config.metadata,
        endpoint: config.url,
        timestamp: Date.now(),
      };
      return config;
    },

    responseInterceptor: (response) => {
      const startTime = response.metadata?.timestamp ?? Date.now();
      const duration = Date.now() - startTime;

      onMetric({
        endpoint: (response.metadata?.endpoint as string) ?? "unknown",
        duration,
        status: response.status,
        timestamp: startTime,
      });

      return response;
    },
  };
}

/**
 * Custom headers interceptor
 */
export function createHeadersInterceptor(
  getHeaders: () => Record<string, string> | Promise<Record<string, string>>
): RequestInterceptor {
  return async (config) => {
    const customHeaders = await getHeaders();

    return {
      ...config,
      headers: {
        ...config.headers,
        ...customHeaders,
      },
    };
  };
}

/**
 * Authentication refresh interceptor
 * Automatically refreshes tokens on 401 errors
 */
export function createAuthRefreshInterceptor(
  refreshToken: () => Promise<string | null>
): ErrorInterceptor {
  return async (error) => {
    // Only handle 401 errors
    if (error.code !== 401) {
      return error;
    }

    try {
      const newToken = await refreshToken();

      if (!newToken) {
        return error;
      }

      // Token refreshed successfully, return a recovery response
      // The caller should retry the request with the new token
      return {
        ok: true,
        status: 200,
        statusText: "Token Refreshed",
        headers: new Headers(),
        body: { tokenRefreshed: true },
        metadata: error.metadata,
      } as InterceptedResponse;
    } catch {
      // Token refresh failed, return original error
      return error;
    }
  };
}
