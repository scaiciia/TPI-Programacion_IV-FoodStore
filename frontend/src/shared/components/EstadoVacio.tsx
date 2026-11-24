interface EstadoVacioProps {
  mensaje: string
  accion?: React.ReactNode
}

export function EstadoVacio({ mensaje, accion }: EstadoVacioProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <p className="text-sm font-medium text-slate-500">{mensaje}</p>
      {accion && <div className="mt-4 flex justify-center">{accion}</div>}
    </div>
  )
}
