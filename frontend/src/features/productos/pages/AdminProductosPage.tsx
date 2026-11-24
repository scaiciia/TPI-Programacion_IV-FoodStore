import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { useCategorias } from '@/features/categorias'
import { Button, Card, DataTable } from '@/shared'
import { ProductoModal } from '../components/ProductoModal'
import { useProductos } from '../hooks/useProductos'
import type { Producto, ProductoPayload } from '../types/producto.types'

const ADMIN_FILTROS = {
  skip: 0,
  limit: 100,
  search: '',
  categoria_id: null,
  disponible: null,
} as const

export function AdminProductosPage() {
  const { categorias } = useCategorias()
  const { productos, isLoading, error, refetch, crear, actualizar, cambiarStock, eliminar } =
    useProductos(ADMIN_FILTROS)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [seleccionado, setSeleccionado] = useState<Producto | null>(null)

  const resetMutations = () => {
    crear.reset()
    actualizar.reset()
    cambiarStock.reset()
    eliminar.reset()
  }

  const abrirNuevo = () => {
    resetMutations()
    setSeleccionado(null)
    setModalAbierto(true)
  }

  const abrirEdicion = (producto: Producto) => {
    resetMutations()
    setSeleccionado(producto)
    setModalAbierto(true)
  }

  const cerrar = () => {
    setModalAbierto(false)
    setSeleccionado(null)
  }

  const guardar = async (data: ProductoPayload) => {
    if (seleccionado) await actualizar.mutateAsync({ id: seleccionado.id, data })
    else await crear.mutateAsync(data)
    cerrar()
  }

  const columnas: ColumnDef<Producto>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'nombre', header: 'Nombre' },
    { accessorKey: 'categoria.nombre', header: 'Categoría' },
    {
      accessorKey: 'precio_base',
      header: 'Precio',
      cell: (info) => `$${Number(info.getValue()).toFixed(2)}`,
    },
    { accessorKey: 'stock', header: 'Stock' },
    {
      accessorKey: 'disponible',
      header: 'Disponible',
      cell: (info) => (info.getValue() ? 'Sí' : 'No'),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: (info) => {
        const producto = info.row.original
        return (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => abrirEdicion(producto)}>Editar</Button>
            <Button
              variant="outline"
              onClick={() =>
                cambiarStock.mutate({
                  id: producto.id,
                  data: { stock: producto.stock, disponible: !producto.disponible },
                })
              }
            >
              {producto.disponible ? 'Marcar agotado' : 'Habilitar'}
            </Button>
            <Button
              variant="danger"
              disabled={eliminar.isPending}
              onClick={() => {
                if (window.confirm(`¿Dar de baja "${producto.nombre}"?`)) eliminar.mutate(producto.id)
              }}
            >
              Baja
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <Card
        title="Administración de productos"
        subtitle="Altas, cambios de stock y disponibilidad, y bajas lógicas."
        actions={<Button onClick={abrirNuevo}>Nuevo producto</Button>}
      >
        <DataTable
          columns={columnas}
          data={productos}
          isLoading={isLoading}
          error={error}
          onRetry={() => void refetch()}
          emptyMessage="No hay productos activos."
          searchPlaceholder="Buscar producto..."
        />
      </Card>

      <ProductoModal
        open={modalAbierto}
        producto={seleccionado}
        categorias={categorias}
        guardando={crear.isPending || actualizar.isPending}
        error={crear.error ?? actualizar.error ?? cambiarStock.error ?? eliminar.error}
        onClose={cerrar}
        onSubmit={guardar}
      />
    </div>
  )
}
