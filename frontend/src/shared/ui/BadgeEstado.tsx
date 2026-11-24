interface BadgeEstadoProps {
  estado: string
}

const ESTILOS: Record<string, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-800',
  EN_PREPARACION: 'bg-indigo-100 text-indigo-800',
  ENTREGADO: 'bg-emerald-100 text-emerald-800',
  CANCELADO: 'bg-red-100 text-red-800',
}

const ETIQUETAS: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'En preparación',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}

export function BadgeEstado({ estado }: BadgeEstadoProps) {
  const clases = ESTILOS[estado] ?? 'bg-slate-100 text-slate-700'
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${clases}`}>
      {ETIQUETAS[estado] ?? estado}
    </span>
  )
}
