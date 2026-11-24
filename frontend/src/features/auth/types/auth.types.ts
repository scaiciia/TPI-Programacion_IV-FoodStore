export type Role = 'user' | 'admin'

export interface UsuarioAuth {
  id: number
  username: string
  full_name: string
  email: string
  role: Role
  disabled: boolean
  created_at: string
}

export interface RegisterPayload {
  username: string
  full_name: string
  email: string
  password: string
}
