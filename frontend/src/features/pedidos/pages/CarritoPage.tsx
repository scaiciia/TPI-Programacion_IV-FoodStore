import { Link } from 'react-router-dom'
import { Button, Card, EstadoVacio } from '@/shared'
import { useCartStore } from '@/store/cartStore'

export function CarritoPage() {
  const items = useCartStore((state) => state.items)
  const cambiarCantidad = useCartStore((state) => state.cambiarCantidad)
  const quitar = useCartStore((state) => state.quitar)
  const total = useCartStore((state) => state.total)()

  if (items.length === 0) {
    return (
      <EstadoVacio
        mensaje="Tu carrito está vacío."
        accion={<Link to="/" className="btn-primary">Ver el catálogo</Link>}
      />
    )
  }

  return (
    <Card title="Tu carrito" subtitle="Los ítems se guardan en tu navegador.">
      <ul className="divide-y divide-slate-100">
        {items.map((item) => (
          <li key={item.producto_id} className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div className="min-w-48 flex-1">
              <p className="font-semibold text-slate-900">{item.nombre}</p>
              <p className="text-sm text-slate-500">${item.precio_unitario.toFixed(2)} c/u</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn-outline px-3"
                aria-label={`Quitar una unidad de ${item.nombre}`}
                onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
              >
                −
              </button>
              <span className="w-8 text-center font-bold">{item.cantidad}</span>
              <button
                type="button"
                className="btn-outline px-3"
                aria-label={`Agregar una unidad de ${item.nombre}`}
                onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
              >
                +
              </button>
            </div>
            <p className="w-24 text-right font-bold">${(item.precio_unitario * item.cantidad).toFixed(2)}</p>
            <Button variant="danger" onClick={() => quitar(item.producto_id)}>Quitar</Button>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-5">
        <p className="text-2xl font-black">Total: ${total.toFixed(2)}</p>
        <Link to="/checkout" className="btn-primary">Continuar con el pedido</Link>
      </div>
    </Card>
  )
}
