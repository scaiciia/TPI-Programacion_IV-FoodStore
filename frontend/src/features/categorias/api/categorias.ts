import { api } from '@/shared/api/axiosInstance'
import type { Categoria, CategoriaPayload } from '../types/categoria.types'

export async function listarCategorias(): Promise<Categoria[]> {
  const { data } = await api.get<Categoria[]>('/categorias')
  return data
}

export async function crearCategoria(payload: CategoriaPayload): Promise<Categoria> {
  const { data } = await api.post<Categoria>('/categorias', payload)
  return data
}

export async function actualizarCategoria(id: number, payload: CategoriaPayload): Promise<Categoria> {
  const { data } = await api.put<Categoria>(`/categorias/${id}`, payload)
  return data
}

export async function eliminarCategoria(id: number): Promise<void> {
  await api.delete(`/categorias/${id}`)
}
