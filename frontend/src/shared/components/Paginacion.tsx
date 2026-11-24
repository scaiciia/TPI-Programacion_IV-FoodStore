interface PaginacionProps {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}

export function Paginacion({ page, pageCount, onPageChange }: PaginacionProps) {
  const total = Math.max(pageCount, 1)
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
      <span>
        Página <strong className="text-slate-900">{page + 1}</strong> de {total}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          className="btn-outline"
          disabled={page <= 0}
          onClick={() => onPageChange(Math.max(0, page - 1))}
        >
          Anterior
        </button>
        <button
          type="button"
          className="btn-outline"
          disabled={page + 1 >= total}
          onClick={() => onPageChange(Math.min(total - 1, page + 1))}
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}
