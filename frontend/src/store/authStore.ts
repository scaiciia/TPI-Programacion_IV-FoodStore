import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '@/shared/api/axiosInstance'
import { leerMensajeError } from '@/shared/api/handleApiError'
import type { RegisterPayload, Role, UsuarioAuth } from '@/features/auth/types/auth.types'

export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated'

interface AuthState {
  user: UsuarioAuth | null
  status: AuthStatus
  isLoading: boolean
  error: string | null
  setStatus: (status: AuthStatus) => void
  checkSession: () => Promise<void>
  login: (username: string, password: string) => Promise<void>
  register: (data: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  clearSession: () => void
  hasRole: (...roles: Role[]) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      status: 'checking',
      isLoading: false,
      error: null,

      setStatus: (status) => set({ status }),

      clearSession: () =>
        set({ user: null, status: 'unauthenticated', isLoading: false, error: null }),

      checkSession: async () => {
        set({ status: 'checking' })
        try {
          const { data } = await api.get<UsuarioAuth>('/auth/me')
          set({ user: data, status: 'authenticated', error: null })
        } catch {
          set({ user: null, status: 'unauthenticated', error: null })
        }
      },

      login: async (username, password) => {
        set({ isLoading: true, error: null })
        try {
          const form = new URLSearchParams({ username, password })
          await api.post('/auth/token', form, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          })
          const { data } = await api.get<UsuarioAuth>('/auth/me')
          set({ user: data, status: 'authenticated', isLoading: false })
        } catch (error) {
          const mensaje = leerMensajeError(error, 'Credenciales inválidas')
          set({
            user: null,
            status: 'unauthenticated',
            isLoading: false,
            error: mensaje,
          })
          throw error
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null })
        try {
          await api.post('/auth/register', data)
        } catch (error) {
          set({ isLoading: false, error: leerMensajeError(error, 'No se pudo registrar') })
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout')
        } finally {
          get().clearSession()
        }
      },

      hasRole: (...roles) => {
        const user = get().user
        return user ? roles.includes(user.role) : false
      },
    }),
    {
      name: 'foodstore-auth',
      // Solo se persiste el usuario: nunca el JWT (vive en cookie HttpOnly).
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state?.user) state.setStatus('authenticated')
      },
    },
  ),
)
