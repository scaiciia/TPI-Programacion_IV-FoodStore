import { api } from '@/shared/api/axiosInstance'
import { paramsDeConsulta } from '@/shared/api/handleApiError'
import type {
  CambioEstado,
  FiltrosPedidos,
  Pedido,
  PedidoCreate,
  PedidosPaginados,
  ResumenPedidos,
} from '../types/pedido.types'

export async function crearPedido(payload: PedidoCreate): Promise<Pedido> {
  const { data } = await api.post<Pedido>('/pedidos', payload)
  return data
}

export async function listarPedidos(filtros: FiltrosPedidos): Promise<PedidosPaginados> {
  const { data } = await api.get<PedidosPaginados>('/pedidos', {
    params: paramsDeConsulta({ ...filtros }),
  })
  return data
}

export async function obtenerPedido(id: number): Promise<Pedido> {
  const { data } = await api.get<Pedido>(`/pedidos/${id}`)
  return data
}

export async function resumenPedidos(): Promise<ResumenPedidos> {
  const { data } = await api.get<ResumenPedidos>('/pedidos/resumen')
  return data
}

export async function cambiarEstadoPedido(id: number, cambio: CambioEstado): Promise<Pedido> {
  const { data } = await api.patch<Pedido>(`/pedidos/${id}/estado`, cambio)
  return data
}

export async function cancelarPedido(id: number): Promise<Pedido> {
  const { data } = await api.patch<Pedido>(`/pedidos/${id}/cancelar`)
  return data
}
