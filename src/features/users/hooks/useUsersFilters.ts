import { useState } from 'react'
import { usePaginationState } from '@/shared/hooks/usePaginationState'

export const useUsersFilters = () => {
  const [search, setSearch] = useState('')
  const { page, setPage, pageSize, setPageSize } = usePaginationState()

  return {
    search,
    setSearch,
    page,
    setPage,
    pageSize,
    setPageSize,
    query: {
      page,
      pageSize,
      search,
    },
  }
}
