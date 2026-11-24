import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as productosApi from '../api/productos'
import {
  FILTROS_INICIALES,
  type FiltrosProductos,
  type ProductoPayload,
  type StockPayload,
} from '../types/producto.types'

export const PRODUCTOS_QUERY_KEY = ['productos'] as const
export const claveProductos = (filtros: FiltrosProductos) => [...PRODUCTOS_QUERY_KEY, filtros] as const

interface ActualizarVariables {
  id: number
  data: ProductoPayload
}

interface StockVariables {
  id: number
  data: StockPayload
}

export function useProductos(filtros: FiltrosProductos = FILTROS_INICIALES) {
  const queryClient = useQueryClient()
  const invalidar = () =>
    queryClient.invalidateQueries({ queryKey: PRODUCTOS_QUERY_KEY })

  const listQuery = useQuery({
    queryKey: claveProductos(filtros),
    queryFn: () => productosApi.listarProductos(filtros),
  })

  const crear = useMutation({
    mutationFn: (data: ProductoPayload) => productosApi.crearProducto(data),
    onSuccess: invalidar,
  })

  const actualizar = useMutation({
    mutationFn: ({ id, data }: ActualizarVariables) =>
      productosApi.actualizarProducto(id, data),
    onSuccess: invalidar,
  })

  const cambiarStock = useMutation({
    mutationFn: ({ id, data }: StockVariables) => productosApi.cambiarStock(id, data),
    onSuccess: invalidar,
  })

  const eliminar = useMutation({
    mutationFn: (id: number) => productosApi.eliminarProducto(id),
    onSuccess: invalidar,
  })

  return {
    productos: listQuery.data?.items ?? [],
    total: listQuery.data?.total ?? 0,
    isLoading: listQuery.isLoading,
    error: listQuery.error,
    refetch: listQuery.refetch,
    crear,
    actualizar,
    cambiarStock,
    eliminar,
  }
}
