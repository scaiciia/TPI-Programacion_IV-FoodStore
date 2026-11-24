import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Button, Card, DataTable } from '@/shared'
import { CategoriaModal } from '../components/CategoriaModal'
import { useCategorias } from '../hooks/useCategorias'
import type { Categoria, CategoriaPayload } from '../types/categoria.types'

export function AdminCategoriasPage() {
  const { categorias, isLoading, error, refetch, crear, actualizar, eliminar } = useCategorias()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [seleccionada, setSeleccionada] = useState<Categoria | null>(null)

  const abrirNueva = () => {
    crear.reset()
    actualizar.reset()
    eliminar.reset()
    setSeleccionada(null)
    setModalAbierto(true)
  }

  const abrirEdicion = (categoria: Categoria) => {
    crear.reset()
    actualizar.reset()
    eliminar.reset()
    setSeleccionada(categoria)
    setModalAbierto(true)
  }

  const cerrar = () => {
    setModalAbierto(false)
    setSeleccionada(null)
  }

  const guardar = async (data: CategoriaPayload) => {
    if (seleccionada) await actualizar.mutateAsync({ id: seleccionada.id, data })
    else await crear.mutateAsync(data)
    cerrar()
  }

  const columnas: ColumnDef<Categoria>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'nombre', header: 'Nombre' },
    { accessorKey: 'descripcion', header: 'Descripción' },
    {
      accessorKey: 'activo',
      header: 'Estado',
      cell: (info) => (info.getValue() ? 'Activa' : 'Inactiva'),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: (info) => {
        const categoria = info.row.original
        return (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => abrirEdicion(categoria)}>
              Editar
            </Button>
            <Button
              variant="danger"
              disabled={eliminar.isPending}
              onClick={() => {
                if (window.confirm(`¿Dar de baja "${categoria.nombre}"?`)) {
                  eliminar.mutate(categoria.id)
                }
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
        title="Administración de categorías"
        subtitle="Alta, edición y baja lógica del catálogo."
        actions={<Button onClick={abrirNueva}>Nueva categoría</Button>}
      >
        <DataTable
          columns={columnas}
          data={categorias}
          isLoading={isLoading}
          error={error}
          onRetry={() => void refetch()}
          emptyMessage="No hay categorías activas."
          searchPlaceholder="Buscar categoría..."
        />
      </Card>

      <CategoriaModal
        open={modalAbierto}
        categoria={seleccionada}
        guardando={crear.isPending || actualizar.isPending}
        error={crear.error ?? actualizar.error}
        onClose={cerrar}
        onSubmit={guardar}
      />
    </div>
  )
}
