import { Button, Card } from '@/shared'
import { useCartStore } from '@/store/cartStore'
import type { Producto } from '../types/producto.types'

interface ProductoCardProps {
  producto: Producto
}

const formato = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

export function ProductoCard({ producto }: ProductoCardProps) {
  const agregar = useCartStore((state) => state.agregar)
  const sinStock = !producto.disponible || producto.stock < 1

  return (
    <Card className="flex h-full flex-col p-0">
      <div className="flex h-36 items-center justify-center overflow-hidden rounded-t-2xl bg-orange-50 text-5xl">
        {producto.imagen_url ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            className="h-full w-full object-cover"
          />
        ) : (
          <span aria-hidden="true">🍽️</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
          {producto.categoria?.nombre ?? 'Sin categoría'}
        </p>
        <h3 className="mt-1 text-lg font-bold text-slate-900">{producto.nombre}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{producto.descripcion}</p>
        <p className="mt-3 text-xl font-black text-slate-900">{formato.format(producto.precio_base)}</p>
        <p className={`mt-1 text-xs font-semibold ${sinStock ? 'text-red-600' : 'text-emerald-600'}`}>
          {sinStock ? 'Sin stock' : `${producto.stock} disponibles`}
        </p>
        <Button
          className="mt-4 w-full"
          disabled={sinStock}
          onClick={() =>
            agregar({
              producto_id: producto.id,
              nombre: producto.nombre,
              precio_unitario: producto.precio_base,
            })
          }
        >
          Agregar al carrito
        </Button>
      </div>
    </Card>
  )
}
