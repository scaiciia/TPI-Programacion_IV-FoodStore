import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { Role } from '@/features/auth/types/auth.types'

interface ProtectedRouteProps {
  allowedRoles?: Role[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const location = useLocation()

  if (status === 'checking') {
    return (
      <div className="card mx-auto max-w-md text-center" role="status" aria-live="polite">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />
        <p className="mt-4 text-sm font-semibold text-slate-500">Verificando sesión...</p>
      </div>
    )
  }

  if (status === 'unauthenticated' || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
