import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}

export function Card({ title, subtitle, actions, children, className = '' }: CardProps) {
  return (
    <section className={`card ${className}`.trim()}>
      {(title || actions) && (
        <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title && <h2 className="text-lg font-bold text-slate-900">{title}</h2>}
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  )
}
