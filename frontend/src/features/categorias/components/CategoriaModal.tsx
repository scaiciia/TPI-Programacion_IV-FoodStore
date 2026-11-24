import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Button, Modal, Textarea } from '@/shared'
import { leerMensajeError } from '@/shared/api/handleApiError'
import type { Categoria, CategoriaPayload } from '../types/categoria.types'

interface CategoriaModalProps {
  open: boolean
  categoria: Categoria | null
  guardando: boolean
  error: unknown
  onClose: () => void
  onSubmit: (data: CategoriaPayload) => Promise<void>
}

function textoDeErrores(errores: unknown[]): string {
  return errores.map((error) => String(error)).filter(Boolean).join('. ')
}

export function CategoriaModal({ open, categoria, guardando, error, onClose, onSubmit }: CategoriaModalProps) {
  const form = useForm({
    defaultValues: { nombre: '', descripcion: '' },
    validators: {
      onSubmit: ({ value }) => {
        const campos: Record<string, string> = {}
        if (value.nombre.trim().length < 2) campos.nombre = 'El nombre debe tener entre 2 y 100 caracteres'
        return Object.keys(campos).length > 0 ? { fields: campos } : undefined
      },
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim(),
      })
    },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      nombre: categoria?.nombre ?? '',
      descripcion: categoria?.descripcion ?? '',
    })
  }, [open, categoria, form])

  return (
    <Modal
      open={open}
      eyebrow="Categoría"
      title={categoria ? 'Editar categoría' : 'Nueva categoría'}
      onClose={onClose}
    >
      {Boolean(error) && (
        <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {leerMensajeError(error, 'No se pudo guardar la categoría')}
        </div>
      )}

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          void form.handleSubmit()
        }}
      >
        <form.Field
          name="nombre"
          validators={{ onChange: ({ value }) => (value.trim().length >= 2 ? undefined : 'Mínimo 2 caracteres') }}
        >
          {(field) => {
            const mensaje = textoDeErrores(field.state.meta.errors)
            return (
              <div>
                <label htmlFor="cat-nombre" className="mb-1 block text-sm font-semibold text-slate-700">
                  Nombre
                </label>
                <input
                  id="cat-nombre"
                  className="input-field"
                  maxLength={100}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={Boolean(mensaje)}
                />
                {mensaje && <p className="mt-1 text-xs text-red-600">{mensaje}</p>}
              </div>
            )
          }}
        </form.Field>

        <form.Field name="descripcion">
          {(field) => (
            <Textarea
              id="cat-descripcion"
              etiqueta="Descripción"
              rows={3}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          )}
        </form.Field>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
          <form.Subscribe selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}>
            {({ canSubmit, isSubmitting }) => (
              <Button type="submit" disabled={!canSubmit || isSubmitting || guardando}>
                {isSubmitting || guardando ? 'Guardando...' : 'Guardar'}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </Modal>
  )
}
