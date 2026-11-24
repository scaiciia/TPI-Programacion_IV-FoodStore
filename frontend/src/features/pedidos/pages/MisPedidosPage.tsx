import { useState } from 'react'
import { BadgeEstado, Button, Card, Modal } from '@/shared'
import { leerMensajeError } from '@/shared/api/handleApiError'
import { PedidoDetalle } from '../components/PedidoDetalle'
import { TablaPedidos } from '../components/TablaPedidos'
import { useCancelarPedido, usePedido, usePedidos } from '../hooks/usePedidos'
import { FILTROS_PEDIDOS, type Pedido } from '../types/pedido.types'

export function MisPedidosPage() {
  const filtros = FILTROS_PEDIDOS
  const { pedidos, isLoading, error, refetch } = usePedidos(filtros)
  const cancelar = useCancelarPedido()
  const [seleccionado, setSeleccionado] = useState<number | null>(null)
  const detalle = usePedido(seleccionado)

  const acciones = (pedido: Pedido) => (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => setSeleccionado(pedido.id)}>Ver detalle</Button>
      {pedido.estado === 'PENDIENTE' && (
        <Button
          variant="danger"
          disabled={cancelar.isPending}
          onClick={() => {
            if (window.confirm(`¿Cancelar el pedido #${pedido.id}?`)) cancelar.mutate(pedido.id)
          }}
        >
          Cancelar
        </Button>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <Card title="Mis pedidos" subtitle="Solo podés cancelar los pedidos en estado PENDIENTE.">
        {Boolean(cancelar.error) && (
          <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {leerMensajeError(cancelar.error, 'No se pudo cancelar el pedido')}
          </div>
        )}
        <TablaPedidos
          pedidos={pedidos}
          isLoading={isLoading}
          error={error}
          onRetry={() => void refetch()}
          acciones={acciones}
        />
      </Card>

      <Modal
        open={seleccionado !== null}
        title="Detalle del pedido"
        onClose={() => setSeleccionado(null)}
      >
        {detalle.isLoading && <p className="text-sm text-slate-500">Cargando detalle...</p>}
        {detalle.error && <p className="text-sm text-red-600">No se pudo cargar el detalle.</p>}
        {detalle.data && <PedidoDetalle pedido={detalle.data} />}
        {detalle.data && <div className="mt-4 flex justify-end"><BadgeEstado estado={detalle.data.estado} /></div>}
      </Modal>
    </div>
  )
}
