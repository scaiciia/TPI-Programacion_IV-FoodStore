import { useAuthStore } from '@/store/authStore'
import { api } from './axiosInstance'

const RUTAS_DE_AUTH = ['/auth/token', '/auth/me']

/**
 * Se importa una sola vez desde main.tsx.
 * 401 fuera de auth y 400 «Cuenta de usuario desactivada» limpian la sesión.
 */
export function configurarInterceptores(): void {
  api.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      const url = (error as { config?: { url?: string } })?.config?.url ?? ''
      const estado = (error as { response?: { status?: number } })?.response?.status
      const detail = (
        error as { response?: { data?: { detail?: unknown } } }
      )?.response?.data?.detail

      const desactivada =
        estado === 400 && detail === 'Cuenta de usuario desactivada'
      const sinSesion = estado === 401 && !RUTAS_DE_AUTH.some((ruta) => url.includes(ruta))

      if (desactivada || sinSesion) {
        useAuthStore.getState().clearSession()
      }
      return Promise.reject(error)
    },
  )
}
