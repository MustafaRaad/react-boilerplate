import { type Role as CoreRole } from '@/core/types/auth'

export type Role = CoreRole

export type RolesQuery = {
  page?: number
  pageSize?: number
  search?: string
}
