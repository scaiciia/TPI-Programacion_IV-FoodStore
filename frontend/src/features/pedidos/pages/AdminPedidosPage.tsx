import { useState } from 'react'
import { BadgeEstado, Button, Card, Modal } from '@/shared'
import { leerMensajeError } from '@/shared/api/handleApiError'
import { PedidoDetalle } from '../components/PedidoDetalle'
import { TablaPedidos } from '../components/TablaPedidos'
import {
  useCambiarEstadoPedido,
  useCancelarPedido,
  usePedido,
  usePedidos,
} from '../hooks/usePedidos'
import type { EstadoPedido, FiltrosPedidos, Pedido } from '../types/pedido.types'

const ESTADOS: (EstadoPedido | '')[] = ['', 'PENDIENTE', 'EN_PREPARACION', 'ENTREGADO', 'CANCELADO']

export function AdminPedidosPage() {
  const [filtros, setFiltros] = useState<FiltrosPedidos>({ skip: 0, limit: 100, estado: null })
  const { pedidos, isLoading, error, refetch } = usePedidos(filtros)
  const cambiarEstado = useCambiarEstadoPedido()
  const cancelar = useCancelarPedido()
  const [seleccionado, setSeleccionado] = useState<number | null>(null)
  const detalle = usePedido(seleccionado)

  const fallo = cambiarEstado.error ?? cancelar.error

  const acciones = (pedido: Pedido) => (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => setSeleccionado(pedido.id)}>Ver detalle</Button>
      {pedido.estado === 'PENDIENTE' && (
        <>
          <Button
            disabled={cambiarEstado.isPending}
            onClick={() =>
              cambiarEstado.mutate({
                id: pedido.id,
                data: { estado: 'EN_PREPARACION' },
              })
            }
          >
            Preparar
          </Button>
          <Button
            variant="danger"
            disabled={cancelar.isPending}
            onClick={() => {
              if (window.confirm(`¿Cancelar el pedido #${pedido.id}?`)) cancelar.mutate(pedido.id)
            }}
          >
            Cancelar
          </Button>
        </>
      )}
      {pedido.estado === 'EN_PREPARACION' && (
        <>
          <Button
            disabled={cambiarEstado.isPending}
            onClick={() =>
              cambiarEstado.mutate({ id: pedido.id, data: { estado: 'ENTREGADO' } })
            }
          >
            Entregar
          </Button>
          <Button
            variant="danger"
            disabled={cancelar.isPending || cambiarEstado.isPending}
            onClick={() =>
              cambiarEstado.mutate({ id: pedido.id, data: { estado: 'CANCELADO' } })
            }
          >
            Cancelar
          </Button>
        </>
      )}
      {(pedido.estado === 'ENTREGADO' || pedido.estado === 'CANCELADO') && (
        <BadgeEstado estado={pedido.estado} />
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <Card
        title="Gestión de pedidos"
        subtitle="Avanzá o cancelá estados no terminales."
        actions={
          <select
            className="input-field max-w-56"
            aria-label="Filtrar por estado"
            value={filtros.estado ?? ''}
            onChange={(event) =>
              setFiltros({
                ...filtros,
                estado: (event.target.value || null) as EstadoPedido | null,
              })
            }
          >
            {ESTADOS.map((estado) => (
              <option key={estado} value={estado}>
                {estado === '' ? 'Todos los estados' : estado.replace('_', ' ')}
              </option>
            ))}
          </select>
        }
      >
        {Boolean(fallo) && (
          <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {leerMensajeError(fallo, 'No se pudo actualizar el pedido')}
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
        {detalle.data && <PedidoDetalle pedido={detalle.data} />}
      </Modal>
    </div>
  )
}
