import { useState } from 'react'
import { useCategorias } from '@/features/categorias'
import { Card, EstadoError, EstadoVacio, Paginacion, Skeleton } from '@/shared'
import { ProductoCard } from '../components/ProductoCard'
import { useProductos } from '../hooks/useProductos'
import { FILTROS_INICIALES, type FiltrosProductos } from '../types/producto.types'

export function CatalogoPage() {
  const [filtros, setFiltros] = useState<FiltrosProductos>(FILTROS_INICIALES)
  const { categorias } = useCategorias()
  const { productos, total, isLoading, error, refetch } = useProductos(filtros)

  const paginas = Math.ceil(total / filtros.limit)
  const actualizar = (cambios: Partial<FiltrosProductos>) =>
    setFiltros((actual) => ({ ...actual, skip: 0, ...cambios }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900">Catálogo</h1>
        <p className="mt-1 text-slate-600">Elegí tus favoritos y armá tu pedido.</p>
      </div>

      <Card>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="buscar-producto" className="mb-1 block text-sm font-semibold text-slate-700">
              Buscar
            </label>
            <input
              id="buscar-producto"
              type="search"
              className="input-field"
              placeholder="Buscar por nombre..."
              value={filtros.search}
              onChange={(event) => actualizar({ search: event.target.value })}
            />
          </div>
          <div>
            <label htmlFor="filtro-categoria" className="mb-1 block text-sm font-semibold text-slate-700">
              Categoría
            </label>
            <select
              id="filtro-categoria"
              className="input-field"
              value={filtros.categoria_id ?? ''}
              onChange={(event) =>
                actualizar({ categoria_id: event.target.value ? Number(event.target.value) : null })
              }
            >
              <option value="">Todas</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className="inline-flex items-center gap-2 pb-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={filtros.disponible ?? false}
                onChange={(event) => actualizar({ disponible: event.target.checked ? true : null })}
              />
              Solo disponibles
            </label>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <Skeleton mensaje="Cargando catálogo..." filas={6} />
      ) : error ? (
        <EstadoError mensaje="No se pudo cargar el catálogo." onRetry={() => void refetch()} />
      ) : productos.length === 0 ? (
        <EstadoVacio mensaje="No encontramos productos con esos filtros." />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {productos.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>
          <Paginacion
            page={Math.floor(filtros.skip / filtros.limit)}
            pageCount={paginas}
            onPageChange={(pagina) => setFiltros((actual) => ({ ...actual, skip: pagina * actual.limit }))}
          />
        </>
      )}
    </div>
  )
}
