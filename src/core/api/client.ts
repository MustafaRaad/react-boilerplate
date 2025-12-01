import { endpoints, type EndpointDef } from '@/core/api/endpoints'
import { apiBaseUrl, backendKind as defaultBackendKind } from '@/core/config/env'
import {
  type AspNetEnvelope,
  type AspNetPagedResult,
  type BackendKind,
  type LaravelDataTableResponse,
  type PagedResult,
  type UnifiedApiError,
} from '@/core/types/api'
import { type AuthTokens, type LoginResultLaravel, type RefreshResultAspNet, type RefreshResultLaravel } from '@/core/types/auth'
import { useAuthStore } from '@/store/auth.store'

type ApiFetchOptions = {
  body?: any
  query?: Record<string, any>
  overrideBackendKind?: BackendKind
  signal?: AbortSignal
}

const buildUrl = (path: string, query?: Record<string, any>) => {
  const base = apiBaseUrl || window.location.origin
  const url = new URL(path, base)

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null) return
      url.searchParams.append(key, String(value))
    })
  }

  return url.toString()
}

const parseJson = async (response: Response) => {
  try {
    return await response.json()
  } catch (error) {
    return null
  }
}

const isAspNetPaged = <T>(value: any): value is AspNetPagedResult<T> => {
  return (
    !!value &&
    typeof value === 'object' &&
    'items' in value &&
    'totalPages' in value &&
    'totalCount' in value
  )
}

const isLaravelDataTable = <T>(value: any): value is LaravelDataTableResponse<T> => {
  return (
    !!value &&
    typeof value === 'object' &&
    'data' in value &&
    'recordsTotal' in value &&
    'recordsFiltered' in value
  )
}

const isLaravelLogin = (value: any): value is LoginResultLaravel => {
  return !!value && typeof value === 'object' && 'access_token' in value
}

const mapAspNetPaged = <T>(
  payload: AspNetPagedResult<T>,
  query?: Record<string, any>,
): PagedResult<T> => {
  const currentPageCandidate = Number(query?.page ?? query?.pageNumber ?? 1)
  const pageSizeCandidate = Number(query?.pageSize ?? query?.size ?? payload.items.length ?? 0)
  const totalPages = Number(payload.totalPages) || 1
  const totalCount = Number(payload.totalCount) || payload.items.length

  return {
    items: payload.items,
    currentPage: Number.isNaN(currentPageCandidate) ? 1 : currentPageCandidate,
    pageSize: Number.isNaN(pageSizeCandidate) ? payload.items.length : pageSizeCandidate,
    rowCount: totalCount,
    pageCount: totalPages,
  }
}

const mapLaravelPaged = <T>(payload: LaravelDataTableResponse<T>): PagedResult<T> => ({
  items: payload.data,
  currentPage: 1,
  pageSize: payload.data.length,
  rowCount: payload.recordsFiltered ?? payload.data.length,
  pageCount: 1,
})

const normalizeAspNetResponse = <T>(raw: any, query?: Record<string, any>): T | PagedResult<T> => {
  if (!raw) return raw as T

  const payload = (raw as AspNetEnvelope<T>).result ?? raw

  if (isAspNetPaged<T>(payload)) {
    return mapAspNetPaged<T>(payload, query)
  }

  if (isAspNetPaged<T>(raw)) {
    return mapAspNetPaged<T>(raw, query)
  }

  return payload as T
}

const normalizeLaravelResponse = <T>(
  raw: any,
): T | PagedResult<T> | AuthTokens | LoginResultLaravel => {
  if (!raw) return raw as T

  if (raw.result) {
    return raw.result as T
  }

  if (raw.data && !isLaravelDataTable<T>(raw)) {
    return raw.data as T
  }

  if (isLaravelDataTable<T>(raw)) {
    return mapLaravelPaged<T>(raw)
  }

  if (isLaravelLogin(raw)) {
    const tokens: AuthTokens = {
      accessToken: raw.access_token,
      refreshToken: raw.refresh_token ?? '',
    }
    return tokens
  }

  return raw as T
}

const normalizeError = (backend: BackendKind, status: number, body: any): UnifiedApiError => {
  if (backend === 'aspnet' && body) {
    const code = body.code ?? status
    const message = body.message ?? body.error ?? body.result ?? 'Unexpected error'
    return {
      code,
      message: typeof message === 'string' ? message : 'Unexpected error',
      raw: body,
    }
  }

  if (backend === 'laravel' && body) {
    const message = body.message ?? 'Unexpected error'
    return {
      code: status,
      message,
      raw: body,
    }
  }

  return {
    code: status,
    message: 'Unexpected error',
    raw: body,
  }
}

const performFetch = async (
  endpoint: EndpointDef<any, any>,
  options: ApiFetchOptions = {},
  tokenOverride?: string,
) => {
  const url = buildUrl(endpoint.path, options.query)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  const accessToken = tokenOverride ?? useAuthStore.getState().tokens?.accessToken
  if (endpoint.requiresAuth && accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const response = await fetch(url, {
    method: endpoint.method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  })

  return response
}

const tryRefreshTokens = async (backend: BackendKind): Promise<AuthTokens | null> => {
  const authState = useAuthStore.getState()
  const refreshToken = authState.tokens?.refreshToken
  if (!refreshToken) return null

  try {
    if (backend === 'aspnet') {
      const response = await performFetch(endpoints.auth.refreshAspNet, {
        body: { refreshToken },
      })
      const body = await parseJson(response)
      if (!response.ok) throw normalizeError(backend, response.status, body)
      const normalized = normalizeAspNetResponse<RefreshResultAspNet>(body) as RefreshResultAspNet
      const tokens: AuthTokens = {
        accessToken: normalized.accessToken,
        refreshToken: normalized.refreshToken ?? refreshToken,
      }
      authState.setAuth({ user: authState.user, tokens })
      return tokens
    }

    const response = await performFetch(endpoints.auth.refreshLaravel, {
      body: { refreshToken },
    })
    const body = await parseJson(response)
    if (!response.ok) throw normalizeError(backend, response.status, body)
    const normalized = normalizeLaravelResponse<RefreshResultLaravel>(body) as RefreshResultLaravel
    const tokens: AuthTokens = {
      accessToken: normalized.access_token,
      refreshToken: normalized.refresh_token ?? refreshToken,
    }
    authState.setAuth({ user: authState.user, tokens })
    return tokens
  } catch (error) {
    authState.clearAuth()
    return null
  }
}

export async function apiFetch<TNormalized, TRaw = any>(
  endpoint: EndpointDef<any, TRaw>,
  options: ApiFetchOptions = {},
): Promise<TNormalized> {
  const backend = options.overrideBackendKind ?? defaultBackendKind
  let attemptedRefresh = false
  const execute = () => performFetch(endpoint, options)

  const handleResponse = async (response: Response): Promise<TNormalized> => {
    const body = await parseJson(response)

    if (response.status === 401 && !attemptedRefresh) {
      attemptedRefresh = true
      const refreshed = await tryRefreshTokens(backend)
      if (refreshed?.accessToken) {
        const retryResponse = await performFetch(endpoint, options, refreshed.accessToken)
        return handleResponse(retryResponse)
      }
      const error = normalizeError(backend, response.status, body)
      throw error
    }

    if (!response.ok) {
      throw normalizeError(backend, response.status, body)
    }

    if (backend === 'aspnet') {
      return normalizeAspNetResponse<TNormalized>(body, options.query) as TNormalized
    }

    return normalizeLaravelResponse<TNormalized>(body) as TNormalized
  }

  try {
    const response = await execute()
    return await handleResponse(response)
  } catch (error: any) {
    if ((error as UnifiedApiError).message) {
      throw error
    }
    throw normalizeError(backend, 500, error)
  }
}
