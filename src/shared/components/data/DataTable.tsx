import { useEffect, useMemo, useState } from 'react'
import {
  type ColumnDef,
  type PaginationState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

type DataTableProps<TData> = {
  columns: ColumnDef<TData, any>[]
  data: TData[]
  total?: number
  page?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  mode: 'server' | 'client'
  className?: string
}

export function DataTable<TData>({
  columns,
  data,
  total,
  page = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  mode,
  className,
}: DataTableProps<TData>) {
  const { t } = useTranslation()

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: page - 1,
    pageSize,
  })

  useEffect(() => {
    setPagination({ pageIndex: page - 1, pageSize })
  }, [page, pageSize])

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
    },
    pageCount:
      mode === 'server' && total && pagination.pageSize
        ? Math.ceil(total / pagination.pageSize)
        : undefined,
    manualPagination: mode === 'server',
    onPaginationChange:
      mode === 'client'
        ? setPagination
        : (updater) => {
            const next =
              typeof updater === 'function' ? updater(pagination) : (updater as PaginationState)
            setPagination(next)
            onPageChange?.(next.pageIndex + 1)
            onPageSizeChange?.(next.pageSize)
          },
    getCoreRowModel: getCoreRowModel(),
    ...(mode === 'client' ? { getPaginationRowModel: getPaginationRowModel() } : {}),
  })

  const pageCount = table.getPageCount() || 1
  const canPrevious = table.getCanPreviousPage()
  const canNext = table.getCanNextPage()

  const pageSizeOptions = useMemo(() => [5, 10, 20, 50], [])

  return (
    <div className={cn('space-y-4', className)}>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {t('common.table.empty')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 text-sm sm:flex-row">
        <div className="flex items-center gap-2">
          <span>{t('common.table.page')}</span>
          <strong>
            {pagination.pageIndex + 1} / {pageCount}
          </strong>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!canPrevious}
          >
            {'<'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!canNext}>
            {'>'}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-muted-foreground">{t('common.table.perPage')}</label>
          <select
            className="h-9 rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={pagination.pageSize}
            onChange={(event) => {
              const newSize = Number(event.target.value)
              table.setPageSize(newSize)
              onPageSizeChange?.(newSize)
            }}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
