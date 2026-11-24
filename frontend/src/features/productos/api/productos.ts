import { api } from '@/shared/api/axiosInstance'
import { paramsDeConsulta } from '@/shared/api/handleApiError'
import type {
  FiltrosProductos,
  Producto,
  ProductoPayload,
  ProductosPaginados,
  StockPayload,
} from '../types/producto.types'

export async function listarProductos(
  filtros: FiltrosProductos,
): Promise<ProductosPaginados> {
  const { data } = await api.get<ProductosPaginados>('/productos', {
    params: paramsDeConsulta({ ...filtros }),
  })
  return data
}

export async function obtenerProducto(id: number): Promise<Producto> {
  const { data } = await api.get<Producto>(`/productos/${id}`)
  return data
}

export async function crearProducto(payload: ProductoPayload): Promise<Producto> {
  const { data } = await api.post<Producto>('/productos', payload)
  return data
}

export async function actualizarProducto(id: number, payload: ProductoPayload): Promise<Producto> {
  const { data } = await api.put<Producto>(`/productos/${id}`, payload)
  return data
}

export async function cambiarStock(id: number, payload: StockPayload): Promise<Producto> {
  const { data } = await api.patch<Producto>(`/productos/${id}/stock`, payload)
  return data
}

export async function eliminarProducto(id: number): Promise<void> {
  await api.delete(`/productos/${id}`)
}
