import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children: ReactNode
}

const CLASES: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'btn-outline',
  danger: 'btn-danger',
}

export function Button({
  variant = 'primary',
  type = 'button',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={`${CLASES[variant]} ${className}`.trim()} {...props}>
      {children}
    </button>
  )
}
