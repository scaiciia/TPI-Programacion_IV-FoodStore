import { Link, useNavigate } from 'react-router-dom'
import { EstadoVacio } from '@/shared'
import { useCartStore } from '@/store/cartStore'
import { CheckoutForm } from '../components/CheckoutForm'
import { useCrearPedido } from '../hooks/usePedidos'
import type { PedidoCreate } from '../types/pedido.types'

export function CheckoutPage() {
  const navigate = useNavigate()
  const items = useCartStore((state) => state.items)
  const total = useCartStore((state) => state.total)()
  const vaciar = useCartStore((state) => state.vaciar)
  const crearPedido = useCrearPedido()

  if (items.length === 0) {
    return (
      <EstadoVacio
        mensaje="No hay productos en el carrito para confirmar."
        accion={<Link to="/" className="btn-primary">Ir al catálogo</Link>}
      />
    )
  }

  const confirmar = async (data: PedidoCreate) => {
    await crearPedido.mutateAsync(data)
    vaciar()
    navigate('/mis-pedidos')
  }

  return (
    <CheckoutForm
      items={items}
      total={total}
      guardando={crearPedido.isPending}
      error={crearPedido.error}
      onCancelar={() => navigate('/carrito')}
      onSubmit={confirmar}
    />
  )
}
