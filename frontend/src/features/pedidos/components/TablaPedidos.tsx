import type { ReactNode } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { BadgeEstado, DataTable } from '@/shared'
import type { EstadoPedido, Pedido } from '../types/pedido.types'

interface TablaPedidosProps {
  pedidos: Pedido[]
  isLoading: boolean
  error: unknown
  onRetry: () => void
  acciones: (pedido: Pedido) => ReactNode
}

export function TablaPedidos({ pedidos, isLoading, error, onRetry, acciones }: TablaPedidosProps) {
  const columnas: ColumnDef<Pedido>[] = [
    { accessorKey: 'id', header: 'Nº' },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: (info) => <BadgeEstado estado={info.getValue() as EstadoPedido} />,
    },
    { accessorKey: 'direccion_entrega', header: 'Entrega' },
    { accessorKey: 'forma_pago', header: 'Pago' },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: (info) => `$${Number(info.getValue()).toFixed(2)}`,
    },
    {
      accessorKey: 'created_at',
      header: 'Fecha',
      cell: (info) => new Date(String(info.getValue())).toLocaleString('es-AR'),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: (info) => acciones(info.row.original),
    },
  ]

  return (
    <DataTable
      columns={columnas}
      data={pedidos}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      emptyMessage="No hay pedidos para mostrar."
      searchPlaceholder="Buscar pedido..."
    />
  )
}
