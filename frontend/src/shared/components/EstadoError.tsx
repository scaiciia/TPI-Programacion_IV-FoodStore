import { Button } from '@/shared/ui/Button'

interface EstadoErrorProps {
  mensaje: string
  onRetry?: () => void
}

export function EstadoError({ mensaje, onRetry }: EstadoErrorProps) {
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
      <p className="text-sm font-semibold text-red-700">{mensaje}</p>
      {onRetry && (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  )
}
