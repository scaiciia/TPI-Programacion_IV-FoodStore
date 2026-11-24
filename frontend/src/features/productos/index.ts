export { CatalogoPage } from './pages/CatalogoPage'
export { AdminProductosPage } from './pages/AdminProductosPage'
export { ProductoCard } from './components/ProductoCard'
export { useProductos, PRODUCTOS_QUERY_KEY } from './hooks/useProductos'
export { listarProductos } from './api/productos'
export type {
  Producto,
  ProductoPayload,
  ProductosPaginados,
  FiltrosProductos,
} from './types/producto.types'
