import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table'
import { leerMensajeError } from '@/shared/api/handleApiError'
import { EstadoError } from './EstadoError'
import { EstadoVacio } from './EstadoVacio'
import { Paginacion } from './Paginacion'
import { Skeleton } from './Skeleton'

interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  isLoading: boolean
  error: unknown
  onRetry: () => void
  emptyMessage: string
  loadingMessage?: string
  searchPlaceholder?: string
  pageSize?: number
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  error,
  onRetry,
  emptyMessage,
  loadingMessage = 'Cargando registros...',
  searchPlaceholder = 'Buscar...',
  pageSize = 10,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  })
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination, globalFilter },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  if (isLoading) return <Skeleton mensaje={loadingMessage} />
  if (error) return <EstadoError mensaje={leerMensajeError(error)} onRetry={onRetry} />
  if (data.length === 0) return <EstadoVacio mensaje={emptyMessage} />

  return (
    <div>
      <input
        type="search"
        className="input-field mb-4 max-w-sm"
        placeholder={searchPlaceholder}
        value={globalFilter}
        onChange={(event) => {
          setGlobalFilter(event.target.value)
          table.setPageIndex(0)
        }}
        aria-label={searchPlaceholder}
      />

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="whitespace-nowrap px-4 py-3 font-semibold">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-slate-700">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Paginacion
        page={pagination.pageIndex}
        pageCount={table.getPageCount()}
        onPageChange={(pagina) => table.setPageIndex(pagina)}
      />
    </div>
  )
}
