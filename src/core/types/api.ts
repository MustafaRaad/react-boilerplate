/**
 * @copyright Copyright (c) 2025 Mustafa Raad Mutashar
 * @license MIT
 * @contact mustf.raad@gmail.com
 */

export type BackendKind = 'aspnet' | 'laravel'

export type AspNetEnvelope<T> = {
  code: number
  message: string | null
  error: unknown
  result: T
}

export type AspNetPagedResult<T> = {
  code: string | number
  totalPages: number
  totalCount: number
  hasPreviousPage: boolean
  hasNextPage: boolean
  items: T[]
}

export type LaravelDataTableResponse<T> = {
  draw: number
  recordsTotal: number
  recordsFiltered: number
  data: T[]
}

export type PagedResult<T> = {
  items: T[]
  currentPage: number
  pageSize: number
  rowCount: number
  pageCount: number
}

export type UnifiedApiError = {
  code?: number | string
  message: string
  raw?: unknown
}
