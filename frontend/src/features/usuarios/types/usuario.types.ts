import type { Role } from '@/features/auth/types/auth.types'

export interface UsuarioAdmin {
  id: number
  username: string
  full_name: string
  email: string
  role: Role
  disabled: boolean
  created_at: string
}
