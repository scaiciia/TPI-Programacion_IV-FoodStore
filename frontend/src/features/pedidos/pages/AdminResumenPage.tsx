import { Card, EstadoError, Skeleton } from '@/shared'
import { TarjetaResumen } from '../components/TarjetaResumen'
import { useResumenPedidos } from '../hooks/usePedidos'

export function AdminResumenPage() {
  const { data, isLoading, error, refetch } = useResumenPedidos()

  if (isLoading) return <Skeleton mensaje="Cargando resumen..." filas={3} />
  if (error || !data) {
    return <EstadoError mensaje="No se pudo cargar el resumen." onRetry={() => void refetch()} />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Resumen del negocio</h1>
        <p className="mt-1 text-slate-600">Indicadores calculados desde los pedidos.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <TarjetaResumen titulo="Pendientes" valor={data.pendientes} destacado />
        <TarjetaResumen titulo="En preparación" valor={data.en_preparacion} />
        <TarjetaResumen titulo="Entregados" valor={data.entregados} />
        <TarjetaResumen titulo="Cancelados" valor={data.cancelados} />
        <TarjetaResumen titulo="Pedidos de hoy" valor={data.pedidos_hoy} />
        <TarjetaResumen
          titulo="Ingresos entregados"
          valor={`$${data.ingresos_entregados.toFixed(2)}`}
          detalle="Suma de totales de pedidos ENTREGADO"
        />
      </div>

      <Card>
        <p className="text-sm text-slate-600">
          Los indicadores se actualizan cuando cambia el estado de un pedido.
        </p>
      </Card>
    </div>
  )
}
