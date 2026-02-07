/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

import { type BackendKind } from '../types/api'

const normalizeBackendKind = (value?: string): BackendKind => {
  if (!value) return 'aspnet'
  return value.toLowerCase() === 'laravel' ? 'laravel' : 'aspnet'
}

const normalizeCredentials = (
  value?: string,
): RequestCredentials | undefined => {
  if (!value) return undefined
  const normalized = value.toLowerCase()
  if (normalized === 'omit' || normalized === 'same-origin' || normalized === 'include') {
    return normalized as RequestCredentials
  }
  return undefined
}

export const backendKind: BackendKind = normalizeBackendKind(
  import.meta.env.VITE_BACKEND_KIND as string,
)

export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string) ?? ''
export const apiCredentials = normalizeCredentials(
  import.meta.env.VITE_API_CREDENTIALS as string,
)

export const envConfig = {
  backendKind,
  apiBaseUrl,
  apiCredentials,
}
