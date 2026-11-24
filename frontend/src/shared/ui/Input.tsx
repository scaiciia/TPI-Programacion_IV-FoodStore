import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface CampoProps {
  etiqueta: string
  error?: string
  id: string
  obligatorio?: boolean
}

export function Input({
  etiqueta,
  error,
  id,
  obligatorio,
  className = '',
  ...props
}: CampoProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold text-slate-700">
        {etiqueta} {obligatorio && <span className="text-red-600">*</span>}
      </label>
      <input id={id} className={`input-field ${className}`.trim()} aria-invalid={Boolean(error)} {...props} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export function Textarea({
  etiqueta,
  error,
  id,
  className = '',
  ...props
}: CampoProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold text-slate-700">
        {etiqueta}
      </label>
      <textarea id={id} className={`input-field resize-none ${className}`.trim()} aria-invalid={Boolean(error)} {...props} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
