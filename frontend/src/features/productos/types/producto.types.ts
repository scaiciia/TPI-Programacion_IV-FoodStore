import type { Categoria } from '@/features/categorias/types/categoria.types'

export interface Producto {
  id: number
  categoria_id: number
  nombre: string
  descripcion: string
  precio_base: number
  imagen_url: string | null
  stock: number
  disponible: boolean
  activo: boolean
  categoria: Categoria | null
}

export interface ProductoPayload {
  nombre: string
  descripcion: string
  precio_base: number
  imagen_url: string | null
  stock: number
  disponible: boolean
  categoria_id: number
}

export interface StockPayload {
  stock: number
  disponible: boolean
}

export interface ProductosPaginados {
  total: number
  items: Producto[]
}

export interface FiltrosProductos {
  skip: number
  limit: number
  search: string
  categoria_id: number | null
  disponible: boolean | null
}

export const FILTROS_INICIALES: FiltrosProductos = {
  skip: 0,
  limit: 12,
  search: '',
  categoria_id: null,
  disponible: null,
}
