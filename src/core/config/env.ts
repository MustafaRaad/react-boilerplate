import { type BackendKind } from '../types/api'

const normalizeBackendKind = (value?: string): BackendKind => {
  if (!value) return 'aspnet'
  return value.toLowerCase() === 'laravel' ? 'laravel' : 'aspnet'
}

export const backendKind: BackendKind = normalizeBackendKind(
  import.meta.env.VITE_BACKEND_KIND as string | undefined,
)

export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''

export const envConfig = {
  backendKind,
  apiBaseUrl,
}
