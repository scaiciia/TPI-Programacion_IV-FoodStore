import { api } from '@/shared/api/axiosInstance'
import type { RegisterPayload, UsuarioAuth } from '../types/auth.types'

export async function registrar(data: RegisterPayload): Promise<UsuarioAuth> {
  const { data: usuario } = await api.post<UsuarioAuth>('/auth/register', data)
  return usuario
}

export async function login(username: string, password: string): Promise<void> {
  const form = new URLSearchParams({ username, password })
  await api.post('/auth/token', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout')
}

export async function perfil(): Promise<UsuarioAuth> {
  const { data } = await api.get<UsuarioAuth>('/auth/me')
  return data
}
