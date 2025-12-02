import { endpoints, type EndpointDef } from "@/core/api/endpoints";
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
  laravelRefreshSchema,
} from "@/features/auth/schemas/auth.schema";
import {
  type AspNetPagedResult,
  type BackendKind,
  type LaravelDataTableResponse,
  type PagedResult,
  type UnifiedApiError,
} from "@/core/types/api";
import {
  type AuthTokens,
  type LoginResultLaravel,
  type RefreshResultAspNet,
} from "@/core/types/auth";
import { useAuthStore } from "@/store/auth.store";

type ApiFetchOptions = {
  body?: unknown;
  query?: Record<string, unknown>;
  overrideBackendKind?: BackendKind;
  signal?: AbortSignal;
};

const buildUrl = (path: string, query?: Record<string, unknown>) => {
  const base = apiBaseUrl || window.location.origin;
  const url = new URL(path, base);

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

const parseLaravelRefresh = (value: unknown) =>
  laravelRefreshSchema.safeParse(value);

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
    return loginEnvelope.data.result as T;
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
): T | PagedResult<T> | AuthTokens | LoginResultLaravel => {
  if (!raw) return raw as T;

  const loginResult = parseLaravelLogin(raw);
  if (loginResult.success) {
    const now = Date.now();
    const accessExpiresAt = now + loginResult.data.expires_in * 1000;
    const tokens: AuthTokens = {
      accessToken: loginResult.data.access_token,
      refreshToken: "", // Laravel doesn't provide refresh token
      accessTokenType: loginResult.data.token_type,
      accessExpiresAt,
      backend: "laravel",
    };
    return tokens;
  }

  const refreshResult = parseLaravelRefresh(raw);
  if (refreshResult.success) {
    const now = Date.now();
    const accessExpiresAt = now + refreshResult.data.expires_in * 1000;
    const tokens: AuthTokens = {
      accessToken: refreshResult.data.access_token,
      refreshToken: "", // Laravel doesn't provide refresh token
      accessTokenType: refreshResult.data.token_type,
      accessExpiresAt,
      backend: "laravel",
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
  tokenOverride?: string
) => {
  const url = buildUrl(endpoint.path, options.query);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const authState = useAuthStore.getState();
  const accessToken = tokenOverride ?? authState.tokens?.accessToken;
  if (endpoint.requiresAuth && accessToken) {
    const backend = options.overrideBackendKind ?? defaultBackendKind;
    if (backend === "laravel") {
      const tokenType = authState.tokens?.accessTokenType ?? "Bearer";
      headers.Authorization = `${tokenType} ${accessToken}`;
    } else {
      headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  const response = await fetch(url, {
    method: endpoint.method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  return response;
};

const tryRefreshTokens = async (
  backend: BackendKind
): Promise<AuthTokens | null> => {
  const authState = useAuthStore.getState();

  if (backend === "aspnet") {
    const refreshToken = authState.tokens?.refreshToken;
    if (!refreshToken) return null;

    try {
      const response = await performFetch(endpoints.auth.refreshAspNet, {
        body: { refreshToken },
      });
      const body = await parseJson(response);
      if (!response.ok) throw normalizeError(backend, response.status, body);
      const normalized = normalizeAspNetResponse<RefreshResultAspNet>(
        body
      ) as RefreshResultAspNet;
      const tokens: AuthTokens = {
        accessToken: normalized.accessToken,
        refreshToken: normalized.refreshToken ?? refreshToken,
      };
      authState.setAuth({ user: authState.user, tokens });
      return tokens;
    } catch {
      authState.clearAuth();
      return null;
    }
  }

  // Laravel: refresh using existing access token
  if (!authState.tokens?.accessToken) return null;

  try {
    const response = await performFetch(endpoints.auth.refreshLaravel, {
      body: {}, // Laravel refresh doesn't need body, uses auth token from header
    });
    const body = await parseJson(response);
    if (!response.ok) throw normalizeError(backend, response.status, body);
    const normalizedTokens = normalizeLaravelResponse<AuthTokens>(
      body
    ) as AuthTokens;
    // Preserve the full token data including expiration
    authState.setAuth({ user: authState.user, tokens: normalizedTokens });
    return normalizedTokens;
  } catch {
    authState.clearAuth();
    return null;
  }
};

export async function apiFetch<TNormalized, TRaw = unknown>(
  endpoint: EndpointDef<unknown, TRaw>,
  options: ApiFetchOptions = {}
): Promise<TNormalized> {
  const backend = options.overrideBackendKind ?? defaultBackendKind;
  let attemptedRefresh = false;
  const execute = () => performFetch(endpoint, options);

  const handleResponse = async (response: Response): Promise<TNormalized> => {
    const body = await parseJson(response);

    if (response.status === 401 && !attemptedRefresh) {
      attemptedRefresh = true;
      const refreshed = await tryRefreshTokens(backend);
      if (refreshed?.accessToken) {
        const retryResponse = await performFetch(
          endpoint,
          options,
          refreshed.accessToken
        );
        return handleResponse(retryResponse);
      }
      const error = normalizeError(backend, response.status, body);
      throw error;
    }

    if (!response.ok) {
      throw normalizeError(backend, response.status, body);
    }

    if (backend === "aspnet") {
      return normalizeAspNetResponse<TNormalized>(
        body,
        options.query
      ) as TNormalized;
    }

    return normalizeLaravelResponse<TNormalized>(body) as TNormalized;
  };

  try {
    const response = await execute();
    return await handleResponse(response);
  } catch (error: unknown) {
    if ((error as UnifiedApiError).message) {
      throw error;
    }
    throw normalizeError(backend, 500, error);
  }
}
