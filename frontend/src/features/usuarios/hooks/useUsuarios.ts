import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as usuariosApi from '../api/usuarios'

export const USUARIOS_QUERY_KEY = ['admin', 'usuarios'] as const

export function useUsuarios() {
  const queryClient = useQueryClient()
  const invalidar = () =>
    queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEY })

  const listQuery = useQuery({
    queryKey: USUARIOS_QUERY_KEY,
    queryFn: usuariosApi.listarUsuarios,
  })

  const activar = useMutation({
    mutationFn: (id: number) => usuariosApi.activarUsuario(id),
    onSuccess: invalidar,
  })

  const desactivar = useMutation({
    mutationFn: (id: number) => usuariosApi.desactivarUsuario(id),
    onSuccess: invalidar,
  })

  return {
    usuarios: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
    error: listQuery.error,
    refetch: listQuery.refetch,
    activar,
    desactivar,
  }
}
