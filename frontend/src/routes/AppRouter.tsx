import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import {
  LoginPage,
  RegisterPage,
  UnauthorizedPage,
} from '@/features/auth'
import { AdminCategoriasPage } from '@/features/categorias'
import { AdminUsuariosPage } from '@/features/usuarios'
import {
  AdminPedidosPage,
  AdminResumenPage,
  CarritoPage,
  CheckoutPage,
  MisPedidosPage,
} from '@/features/pedidos'
import { CatalogoPage, AdminProductosPage } from '@/features/productos'
import { MainLayout } from '@/shared'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Rutas públicas */}
          <Route path="/" element={<CatalogoPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/carrito" element={<CarritoPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Cualquier usuario autenticado */}
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/mis-pedidos" element={<MisPedidosPage />} />
          </Route>

          {/* Solo administradores */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/resumen" element={<AdminResumenPage />} />
            <Route path="/admin/categorias" element={<AdminCategoriasPage />} />
            <Route path="/admin/productos" element={<AdminProductosPage />} />
            <Route path="/admin/pedidos" element={<AdminPedidosPage />} />
            <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
