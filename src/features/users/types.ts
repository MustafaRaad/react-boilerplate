import { type Role } from '@/core/types/auth'

export type User = {
  id: string
  name: string
  email: string
  roles: Role[]
}

export type UsersQuery = {
  page?: number
  pageSize?: number
  search?: string
}
