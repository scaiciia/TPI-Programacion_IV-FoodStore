import { Card } from '@/shared'

interface TarjetaResumenProps {
  titulo: string
  valor: number | string
  detalle?: string
  destacado?: boolean
}

export function TarjetaResumen({ titulo, valor, detalle, destacado }: TarjetaResumenProps) {
  return (
    <Card className={destacado ? 'border-orange-300 bg-orange-50' : ''}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{titulo}</p>
      <p className="mt-2 text-3xl font-black text-slate-900">{valor}</p>
      {detalle && <p className="mt-1 text-xs text-slate-500">{detalle}</p>}
    </Card>
  )
}
