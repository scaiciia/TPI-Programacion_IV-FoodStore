import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as categoriasApi from '../api/categorias'
import type { CategoriaPayload } from '../types/categoria.types'

export const CATEGORIAS_QUERY_KEY = ['categorias'] as const

interface ActualizarVariables {
  id: number
  data: CategoriaPayload
}

/** TanStack Query es la única fuente de datos del servidor en esta feature. */
export function useCategorias() {
  const queryClient = useQueryClient()
  const invalidar = () =>
    queryClient.invalidateQueries({ queryKey: CATEGORIAS_QUERY_KEY })

  const listQuery = useQuery({
    queryKey: CATEGORIAS_QUERY_KEY,
    queryFn: categoriasApi.listarCategorias,
  })

  const crear = useMutation({
    mutationFn: (data: CategoriaPayload) => categoriasApi.crearCategoria(data),
    onSuccess: invalidar,
  })

  const actualizar = useMutation({
    mutationFn: ({ id, data }: ActualizarVariables) =>
      categoriasApi.actualizarCategoria(id, data),
    onSuccess: invalidar,
  })

  const eliminar = useMutation({
    mutationFn: (id: number) => categoriasApi.eliminarCategoria(id),
    onSuccess: invalidar,
  })

  return {
    categorias: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
    error: listQuery.error,
    refetch: listQuery.refetch,
    crear,
    actualizar,
    eliminar,
  }
}
