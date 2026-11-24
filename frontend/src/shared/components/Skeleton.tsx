interface SkeletonProps {
  mensaje?: string
  filas?: number
}

export function Skeleton({ mensaje = 'Cargando datos...', filas = 4 }: SkeletonProps) {
  return (
    <div role="status" aria-live="polite" className="space-y-3 rounded-xl border border-slate-200 bg-white p-6">
      <p className="text-sm font-semibold text-slate-500">{mensaje}</p>
      {Array.from({ length: filas }, (_, index) => (
        <div key={index} className="flex animate-pulse gap-4">
          <div className="h-4 w-1/12 rounded bg-slate-200" />
          <div className="h-4 w-4/12 rounded bg-slate-200" />
          <div className="h-4 w-5/12 rounded bg-slate-200" />
          <div className="h-4 w-2/12 rounded bg-slate-200" />
        </div>
      ))}
    </div>
  )
}
