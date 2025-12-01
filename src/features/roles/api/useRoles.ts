import { endpoints } from '@/core/api/endpoints'
import { apiFetch } from '@/core/api/client'
import { useApiQuery } from '@/core/api/hooks'
import { backendKind } from '@/core/config/env'
import { type PagedResult } from '@/core/types/api'
import { type RolesQuery, type Role } from '@/features/roles/types'

const emptyPagedResult = (): PagedResult<Role> => ({
  items: [],
  currentPage: 1,
  pageSize: 0,
  rowCount: 0,
  pageCount: 1,
})

export const useRoles = (query: RolesQuery) => {
  const isLaravel = backendKind === 'laravel'

  return useApiQuery<PagedResult<Role>>({
    queryKey: ['roles', backendKind, query],
    queryFn: async () => {
      const response = await apiFetch<PagedResult<Role>>(endpoints.roles.list, {
        query,
        overrideBackendKind: backendKind,
      })

      if (isLaravel && query.search) {
        const term = query.search.toLowerCase()
        const filtered = response.items.filter((role) => role.name.toLowerCase().includes(term))

        const pageSize = query.pageSize ?? (filtered.length || 10)
        const currentPage = query.page ?? 1
        const offset = (currentPage - 1) * pageSize
        const pagedItems = filtered.slice(offset, offset + pageSize)

        return {
          items: pagedItems,
          currentPage,
          pageSize,
          rowCount: filtered.length,
          pageCount: Math.max(1, Math.ceil(filtered.length / pageSize)),
        }
      }

      return response
    },
    initialData: emptyPagedResult(),
  })
}
