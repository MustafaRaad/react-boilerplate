import { type EndpointDef } from "@/core/api/endpoints";
import {
  apiBaseUrl,
  backendKind as defaultBackendKind,
} from "@/core/config/env";
import {
  aspNetEnvelopeSchema,
  aspNetPagedResultSchema,
  laravelDataTableSchema,
} from "@/core/schemas/endpoints.schema";
import {
  aspNetLoginEnvelopeSchema,
  laravelLoginSchema,
} from "@/features/auth/schemas/auth.schema";
import {
  type AspNetPagedResult,
  type BackendKind,
  type LaravelDataTableResponse,
  type PagedResult,
  type UnifiedApiError,
} from "@/core/types/api";
import {
  type AspNetLoginResult,
  type AuthTokens,
} from "@/features/auth/types/auth.types";
import { useAuthStore } from "@/store/auth.store";
import {
  addCsrfHeader,
  initializeCsrfToken,
  requiresCsrfProtection,
} from "@/core/security/csrf";
import {
  rateLimiter,
  DEFAULT_RATE_LIMITS,
  type RateLimitConfig,
} from "@/core/security/rateLimit";
import { sanitizeObject } from "@/core/security/sanitize";
import {
  executeRequestInterceptors,
  executeResponseInterceptors,
  executeErrorInterceptors,
  type RequestConfig,
  type InterceptedResponse,
  type InterceptedError,
} from "@/core/api/interceptors";
import {
  ExponentialBackoffCalculator,
  type RetryConfig,
  type RetryableError,
  DEFAULT_RETRY_CONFIG,
} from "@/core/api/retry";

type ApiFetchOptions = {
  body?: unknown;
  query?: Record<string, unknown>;
  overrideBackendKind?: BackendKind;
  signal?: AbortSignal;
  /**
   * Custom retry configuration for this request
   */
  retryConfig?: Partial<RetryConfig>;
  /**
   * Skip interceptors for this request
   */
  skipInterceptors?: boolean;
};

// Re-export interceptor and retry utilities for convenience
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

export {
  createRetryConfig,
  ExponentialBackoffCalculator,
  withRetry,
} from "./retry";

export { setupApiConfig, getGlobalRetryConfig, API_PRESETS } from "./config";

export type {
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
  RequestConfig,
  InterceptedResponse,
  InterceptedError,
} from "./interceptors";

export type { RetryConfig, RetryableError, RetryState } from "./retry";

export type { ApiConfig } from "./config";

const buildUrl = (path: string, query?: Record<string, unknown>) => {
  const base = apiBaseUrl || window.location.origin;

  // Ensure base ends with / and path doesn't start with / for proper concatenation
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;

  const url = new URL(normalizedPath, normalizedBase);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      url.searchParams.append(key, String(value));
    });
  }

  return url.toString();
};

const parseJson = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const parseAspNetEnvelope = (value: unknown) =>
  aspNetEnvelopeSchema.safeParse(value);

const parseAspNetLoginEnvelope = (value: unknown) =>
  aspNetLoginEnvelopeSchema.safeParse(value);

const parseAspNetPagedResult = (value: unknown) =>
  aspNetPagedResultSchema.safeParse(value);

const parseLaravelDataTable = (value: unknown) =>
  laravelDataTableSchema.safeParse(value);

const parseLaravelLogin = (value: unknown) =>
  laravelLoginSchema.safeParse(value);

const mapAspNetLoginResult = (payload: AspNetLoginResult): AuthTokens => {
  const now = Date.now();
  const parsedAccessExpiry = Date.parse(payload.accessExpiresAtUtc);
  const parsedRefreshExpiry = payload.refreshExpiresAtUtc
    ? Date.parse(payload.refreshExpiresAtUtc)
    : NaN;

  const accessTokenExpiresAt = Number.isNaN(parsedAccessExpiry)
    ? now
    : parsedAccessExpiry;
  const expiresIn = Math.max(
    0,
    Math.floor((accessTokenExpiresAt - now) / 1000)
  );

  return {
    backend: "aspnet",
    accessToken: payload.accessToken,
    tokenType: "Bearer",
    expiresIn,
    accessTokenExpiresAt,
    refreshToken: payload.refreshToken ?? null,
    refreshTokenExpiresAt: Number.isNaN(parsedRefreshExpiry)
      ? null
      : parsedRefreshExpiry,
  };
};

const mapAspNetPaged = <T>(
  payload: AspNetPagedResult<T>,
  query?: Record<string, unknown>
): PagedResult<T> => {
  const currentPageCandidate = Number(query?.page ?? query?.pageNumber ?? 1);
  const pageSizeCandidate = Number(
    query?.pageSize ?? query?.size ?? payload.items.length ?? 0
  );
  const totalPages = Number(payload.totalPages) || 1;
  const totalCount = Number(payload.totalCount) || payload.items.length;

  return {
    items: payload.items,
    currentPage: Number.isNaN(currentPageCandidate) ? 1 : currentPageCandidate,
    pageSize: Number.isNaN(pageSizeCandidate)
      ? payload.items.length
      : pageSizeCandidate,
    rowCount: totalCount,
    pageCount: totalPages,
  };
};

const mapLaravelPaged = <T>(
  payload: LaravelDataTableResponse<T>
): PagedResult<T> => ({
  items: payload.data,
  currentPage: 1,
  pageSize: payload.data.length,
  rowCount: payload.recordsFiltered ?? payload.data.length,
  pageCount: 1,
});

const normalizeAspNetResponse = <T>(
  raw: unknown,
  query?: Record<string, unknown>
): T | PagedResult<T> => {
  if (!raw) return raw as T;

  const loginEnvelope = parseAspNetLoginEnvelope(raw);
  if (loginEnvelope.success) {
    return mapAspNetLoginResult(
      loginEnvelope.data.result as AspNetLoginResult
    ) as T;
  }

  const envelope = parseAspNetEnvelope(raw);
  const payload = (envelope.success ? envelope.data.result : null) ?? raw;

  const pagedPayload = parseAspNetPagedResult(payload);
  if (pagedPayload.success) {
    return mapAspNetPaged<T>(pagedPayload.data as AspNetPagedResult<T>, query);
  }

  const pagedRaw = parseAspNetPagedResult(raw);
  if (pagedRaw.success) {
    return mapAspNetPaged<T>(pagedRaw.data as AspNetPagedResult<T>, query);
  }

  return (envelope.success ? envelope.data.result : payload) as T;
};

const normalizeLaravelResponse = <T>(
  raw: unknown
): T | PagedResult<T> | AuthTokens => {
  if (!raw) return raw as T;

  const loginResult = parseLaravelLogin(raw);
  if (loginResult.success) {
    const now = Date.now();
    const accessTokenExpiresAt = now + loginResult.data.expires_in * 1000;
    const tokens: AuthTokens = {
      backend: "laravel",
      accessToken: loginResult.data.access_token,
      tokenType: loginResult.data.token_type,
      expiresIn: loginResult.data.expires_in,
      accessTokenExpiresAt,
      refreshToken: null,
      refreshTokenExpiresAt: null,
    };
    return tokens;
  }

  if (typeof raw === "object" && raw !== null && "result" in raw) {
    return (raw as { result: T }).result;
  }

  const dataTable = parseLaravelDataTable(raw);
  if (
    typeof raw === "object" &&
    raw !== null &&
    "data" in raw &&
    !dataTable.success
  ) {
    return (raw as { data: T }).data;
  }

  if (dataTable.success) {
    return mapLaravelPaged<T>(dataTable.data as LaravelDataTableResponse<T>);
  }

  return raw as T;
};

const normalizeError = (
  backend: BackendKind,
  status: number,
  body: unknown
): UnifiedApiError => {
  if (backend === "aspnet" && body && typeof body === "object") {
    const errorBody = body as Record<string, unknown>;
    const code = (errorBody.code as number) ?? status;
    const message =
      (errorBody.message as string) ??
      (errorBody.error as string) ??
      (errorBody.result as string) ??
      "Unexpected error";
    return {
      code,
      message: typeof message === "string" ? message : "Unexpected error",
      raw: body,
    };
  }

  if (backend === "laravel" && body && typeof body === "object") {
    const errorBody = body as Record<string, unknown>;
    const message = (errorBody.message as string) ?? "Unexpected error";
    return {
      code: status,
      message,
      raw: body,
    };
  }

  return {
    code: status,
    message: "Unexpected error",
    raw: body,
  };
};

const performFetch = async (
  endpoint: EndpointDef<unknown, unknown>,
  options: ApiFetchOptions = {},
  tokenOverride?: string,
  backendHint?: BackendKind
): Promise<Response> => {
  const url = buildUrl(endpoint.path, options.query);
  const startTime = Date.now();

  let headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const authState = useAuthStore.getState();
  const backend =
    backendHint ??
    options.overrideBackendKind ??
    authState.tokens?.backend ??
    defaultBackendKind;
  const accessToken = tokenOverride ?? authState.tokens?.accessToken;
  if (endpoint.requiresAuth && accessToken) {
    if (backend === "laravel") {
      // Capitalize the token type (Laravel returns "bearer" lowercase)
      const tokenType = authState.tokens?.tokenType ?? "Bearer";
      const capitalizedTokenType =
        tokenType.charAt(0).toUpperCase() + tokenType.slice(1).toLowerCase();
      headers.Authorization = `${capitalizedTokenType} ${accessToken}`;
    } else {
      const tokenType = authState.tokens?.tokenType ?? "Bearer";
      headers.Authorization = `${tokenType} ${accessToken}`;
    }
  }

  // Add CSRF token for state-changing requests
  if (requiresCsrfProtection(endpoint.method)) {
    headers = addCsrfHeader(headers) as Record<string, string>;
  }

  // Sanitize request body to prevent XSS
  const sanitizedBody =
    options.body && typeof options.body === "object"
      ? sanitizeObject(options.body as Record<string, unknown>)
      : options.body;

  // Build request config for interceptors
  let requestConfig: RequestConfig = {
    url,
    method: endpoint.method,
    headers,
    body: sanitizedBody ? JSON.stringify(sanitizedBody) : undefined,
    signal: options.signal,
    metadata: {
      endpoint: endpoint.path,
      timestamp: startTime,
    },
  };

  // Execute request interceptors
  if (!options.skipInterceptors) {
    requestConfig = await executeRequestInterceptors(requestConfig);
  }

  // Perform the fetch
  const response = await fetch(requestConfig.url, {
    method: requestConfig.method,
    headers: requestConfig.headers,
    body: requestConfig.body,
    signal: requestConfig.signal,
  });

  return response;
};

export async function apiFetch<TNormalized, TRaw = unknown>(
  endpoint: EndpointDef<unknown, TRaw>,
  options: ApiFetchOptions = {}
): Promise<TNormalized> {
  const backend =
    options.overrideBackendKind ??
    useAuthStore.getState().tokens?.backend ??
    defaultBackendKind;

  const startTime = Date.now();

  // Initialize CSRF token on first request
  if (requiresCsrfProtection(endpoint.method)) {
    initializeCsrfToken();
  }

  // Apply rate limiting based on endpoint type
  const rateLimitKey = `${endpoint.method}:${endpoint.path}`;
  let rateLimitConfig: RateLimitConfig = DEFAULT_RATE_LIMITS.api;

  // Use stricter rate limits for sensitive endpoints
  if (endpoint.path.includes("login")) {
    rateLimitConfig = DEFAULT_RATE_LIMITS.login;
  } else if (endpoint.path.includes("register")) {
    rateLimitConfig = DEFAULT_RATE_LIMITS.register;
  } else if (endpoint.path.includes("password")) {
    rateLimitConfig = DEFAULT_RATE_LIMITS.resetPassword;
  } else if (endpoint.path.includes("upload")) {
    rateLimitConfig = DEFAULT_RATE_LIMITS.upload;
  } else if (endpoint.path.includes("search") || options.query) {
    rateLimitConfig = DEFAULT_RATE_LIMITS.search;
  }

  if (!rateLimiter.check(rateLimitKey, rateLimitConfig)) {
    const retryAfter = rateLimiter.getRetryAfter(rateLimitKey);
    throw normalizeError(backend, 429, {
      message:
        rateLimitConfig.message ||
        `Rate limit exceeded. Retry after ${Math.ceil(
          retryAfter / 1000
        )} seconds.`,
      retryAfter,
    });
  }

  // Configure retry with exponential backoff
  const retryConfig: RetryConfig = {
    ...DEFAULT_RETRY_CONFIG,
    ...options.retryConfig,
    onRetry: (attempt, error, delay) => {
      console.log(
        `[API Retry] Attempt ${attempt} after ${delay}ms for ${endpoint.path}`,
        error
      );
      options.retryConfig?.onRetry?.(attempt, error, delay);
    },
  };

  const calculator = new ExponentialBackoffCalculator(retryConfig);

  const execute = async (): Promise<Response> => {
    return performFetch(endpoint, options, undefined, backend);
  };

  const handleResponse = async (response: Response): Promise<TNormalized> => {
    const body = await parseJson(response);
    const duration = Date.now() - startTime;

    // Build intercepted response
    let interceptedResponse: InterceptedResponse = {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      body,
      metadata: {
        endpoint: endpoint.path,
        duration,
        timestamp: startTime,
      },
    };

    // Execute response interceptors
    if (!options.skipInterceptors) {
      interceptedResponse = await executeResponseInterceptors(
        interceptedResponse
      );
    }

    // Handle 401 errors
    if (response.status === 401) {
      useAuthStore.getState().clearAuth();

      const error: InterceptedError = {
        code: response.status,
        message: "Unauthorized",
        raw: interceptedResponse.body,
        metadata: interceptedResponse.metadata,
      };

      // Try error interceptors (might refresh token)
      if (!options.skipInterceptors) {
        const result = await executeErrorInterceptors(error);

        // If interceptor recovered (e.g., refreshed token), retry the request
        if ("ok" in result && result.ok) {
          // Retry once with refreshed token
          const retryResponse = await execute();
          return handleResponse(retryResponse);
        }
      }

      throw normalizeError(backend, response.status, interceptedResponse.body);
    }

    // Handle other errors
    if (!response.ok) {
      const error: InterceptedError = {
        code: response.status,
        message: response.statusText || "Request failed",
        raw: interceptedResponse.body,
        metadata: interceptedResponse.metadata,
      };

      // Execute error interceptors
      if (!options.skipInterceptors) {
        const result = await executeErrorInterceptors(error);

        // If interceptor recovered, return the recovered response
        if ("ok" in result && result.ok) {
          interceptedResponse = result;
        } else {
          throw normalizeError(
            backend,
            response.status,
            interceptedResponse.body
          );
        }
      } else {
        throw normalizeError(
          backend,
          response.status,
          interceptedResponse.body
        );
      }
    }

    // Normalize response based on backend
    if (backend === "aspnet") {
      return normalizeAspNetResponse<TNormalized>(
        interceptedResponse.body,
        options.query
      ) as TNormalized;
    }

    return normalizeLaravelResponse<TNormalized>(
      interceptedResponse.body
    ) as TNormalized;
  };

  // Retry loop with exponential backoff
  while (true) {
    try {
      const response = await execute();
      calculator.reset();
      return await handleResponse(response);
    } catch (error: unknown) {
      const apiError = error as UnifiedApiError;
      const retryableError: RetryableError = {
        code: typeof apiError.code === "number" ? apiError.code : 0,
        message: apiError.message ?? "Unknown error",
        raw: error,
        isNetworkError:
          error instanceof TypeError && error.message.includes("fetch"),
        isTimeout: error instanceof DOMException && error.name === "AbortError",
      };

      // Check if we should retry
      if (!calculator.shouldRetry(retryableError)) {
        throw error;
      }

      // Calculate delay and wait
      const delay = calculator.nextAttempt(retryableError);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
