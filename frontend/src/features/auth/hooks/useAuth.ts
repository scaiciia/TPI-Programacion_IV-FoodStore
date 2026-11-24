import { useAuthStore } from '@/store/authStore'

/** Fachada tipada sobre el store de sesión. */
export function useAuth() {
  const user = useAuthStore((state) => state.user)
  const status = useAuthStore((state) => state.status)
  const isLoading = useAuthStore((state) => state.isLoading)
  const error = useAuthStore((state) => state.error)
  const login = useAuthStore((state) => state.login)
  const register = useAuthStore((state) => state.register)
  const logout = useAuthStore((state) => state.logout)
  const checkSession = useAuthStore((state) => state.checkSession)
  const hasRole = useAuthStore((state) => state.hasRole)

  return { user, status, isLoading, error, login, register, logout, checkSession, hasRole }
}
