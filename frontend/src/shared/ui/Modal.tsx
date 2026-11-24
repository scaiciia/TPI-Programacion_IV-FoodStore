import { useEffect, type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  title: string
  eyebrow?: string
  onClose: () => void
  children: ReactNode
}

export function Modal({ open, title, eyebrow, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const manejarTecla = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', manejarTecla)
    return () => window.removeEventListener('keydown', manejarTecla)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal"
        className="my-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            {eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-600">
                {eyebrow}
              </p>
            )}
            <h2 id="titulo-modal" className="mt-1 text-2xl font-bold text-slate-900">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="rounded-lg px-2 py-1 text-2xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ×
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  )
}
