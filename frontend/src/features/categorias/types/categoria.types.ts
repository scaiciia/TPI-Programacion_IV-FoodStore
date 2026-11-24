export interface Categoria {
  id: number
  nombre: string
  descripcion: string
  activo: boolean
}

export interface CategoriaPayload {
  nombre: string
  descripcion: string
}
