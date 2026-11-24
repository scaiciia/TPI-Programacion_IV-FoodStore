import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as pedidosApi from '../api/pedidos'
import type {
  CambioEstado,
  FiltrosPedidos,
  PedidoCreate,
} from '../types/pedido.types'

export const PEDIDOS_QUERY_KEY = ['pedidos'] as const
export const RESUMEN_QUERY_KEY = ['pedidos', 'resumen'] as const
export const clavePedidos = (filtros: FiltrosPedidos) => [...PEDIDOS_QUERY_KEY, filtros] as const

const refetchInterval = 60 * 1000

/** Datos propios o todos, según el rol resuelto por el backend. */
export function usePedidos(filtros: FiltrosPedidos) {
  const queryClient = useQueryClient()
  const invalidar = () =>
    queryClient.invalidateQueries({ queryKey: PEDIDOS_QUERY_KEY })

  const listQuery = useQuery({
    queryKey: clavePedidos(filtros),
    queryFn: () => pedidosApi.listarPedidos(filtros),
    refetchInterval: refetchInterval,
    refetchIntervalInBackground: false,
  })

  return {
    pedidos: listQuery.data?.items ?? [],
    total: listQuery.data?.total ?? 0,
    isLoading: listQuery.isLoading,
    error: listQuery.error,
    refetch: listQuery.refetch,
    invalidar,
  }
}

export function usePedido(id: number | null) {
  return useQuery({
    queryKey: [...PEDIDOS_QUERY_KEY, 'detalle', id],
    queryFn: () => pedidosApi.obtenerPedido(id ?? 0),
    enabled: id !== null,
  })
}

export function useCrearPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PedidoCreate) => pedidosApi.crearPedido(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: PEDIDOS_QUERY_KEY }),
  })
}

export function useCambiarEstadoPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CambioEstado }) =>
      pedidosApi.cambiarEstadoPedido(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PEDIDOS_QUERY_KEY })
      void queryClient.invalidateQueries({ queryKey: RESUMEN_QUERY_KEY })
    },
  })
}

export function useCancelarPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => pedidosApi.cancelarPedido(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PEDIDOS_QUERY_KEY })
      void queryClient.invalidateQueries({ queryKey: RESUMEN_QUERY_KEY })
    },
  })
}

export function useResumenPedidos() {
  return useQuery({
    queryKey: RESUMEN_QUERY_KEY,
    queryFn: pedidosApi.resumenPedidos,
    refetchInterval: refetchInterval,
    refetchIntervalInBackground: false,
  })
}
