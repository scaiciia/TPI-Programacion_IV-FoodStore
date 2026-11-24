import { BadgeEstado, Card } from '@/shared'
import type { Pedido } from '../types/pedido.types'

interface PedidoDetalleProps {
  pedido: Pedido
}

export function PedidoDetalle({ pedido }: PedidoDetalleProps) {
  const fecha = new Date(pedido.created_at).toLocaleString('es-AR')
  return (
    <Card title={`Pedido #${pedido.id}`} subtitle={fecha} actions={<BadgeEstado estado={pedido.estado} />}>
      <div className="mb-5 grid gap-3 text-sm sm:grid-cols-2">
        <p><strong className="text-slate-500">Entrega:</strong> {pedido.direccion_entrega}</p>
        <p><strong className="text-slate-500">Pago:</strong> {pedido.forma_pago}</p>
        <p><strong className="text-slate-500">Notas:</strong> {pedido.notas ?? '—'}</p>
        <p><strong className="text-slate-500">Cliente:</strong> #{pedido.usuario_id}</p>
      </div>

      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
          <tr>
            <th className="py-2">Producto</th>
            <th className="py-2">Cantidad</th>
            <th className="py-2">Precio unitario</th>
            <th className="py-2 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {pedido.items.map((item, index) => (
            <tr key={`${item.producto_id}-${index}`}>
              <td className="py-2 font-medium">{item.nombre_producto}</td>
              <td className="py-2">{item.cantidad}</td>
              <td className="py-2">${item.precio_unitario.toFixed(2)}</td>
              <td className="py-2 text-right font-semibold">${item.subtotal.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-right text-xl font-black">Total: ${pedido.total.toFixed(2)}</p>
    </Card>
  )
}
