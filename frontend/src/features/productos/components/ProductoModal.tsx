import { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'
import { Button, Modal, Textarea } from '@/shared'
import { leerMensajeError } from '@/shared/api/handleApiError'
import type { Categoria } from '@/features/categorias'
import type { Producto, ProductoPayload } from '../types/producto.types'

interface ProductoModalProps {
  open: boolean
  producto: Producto | null
  categorias: Categoria[]
  guardando: boolean
  error: unknown
  onClose: () => void
  onSubmit: (data: ProductoPayload) => Promise<void>
}

interface ProductoFormValues {
  nombre: string
  descripcion: string
  precio_base: number
  imagen_url: string
  stock: number
  disponible: boolean
  categoria_id: number
}

function textoDeErrores(errores: unknown[]): string {
  return errores.map((error) => String(error)).filter(Boolean).join('. ')
}

export function ProductoModal({
  open,
  producto,
  categorias,
  guardando,
  error,
  onClose,
  onSubmit,
}: ProductoModalProps) {
  const form = useForm({
    defaultValues: {
      nombre: '',
      descripcion: '',
      precio_base: 0,
      imagen_url: '',
      stock: 0,
      disponible: true as boolean,
      categoria_id: 0,
    } satisfies ProductoFormValues,
    validators: {
      onSubmit: ({ value }) => {
        const campos: Record<string, string> = {}
        if (!value.nombre.trim()) campos.nombre = 'El nombre es obligatorio'
        if (!Number.isFinite(value.precio_base) || value.precio_base < 0) campos.precio_base = 'Precio inválido'
        if (!Number.isInteger(value.stock) || value.stock < 0) campos.stock = 'Stock inválido'
        if (!value.categoria_id) campos.categoria_id = 'Elegí una categoría'
        return Object.keys(campos).length > 0 ? { fields: campos } : undefined
      },
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim(),
        precio_base: value.precio_base,
        imagen_url: value.imagen_url.trim() || null,
        stock: value.stock,
        disponible: value.disponible,
        categoria_id: value.categoria_id,
      })
    },
  })

  useEffect(() => {
    if (!open) return
    form.reset({
      nombre: producto?.nombre ?? '',
      descripcion: producto?.descripcion ?? '',
      precio_base: producto?.precio_base ?? 0,
      imagen_url: producto?.imagen_url ?? '',
      stock: producto?.stock ?? 0,
      disponible: producto?.disponible ?? true,
      categoria_id: producto?.categoria_id ?? categorias[0]?.id ?? 0,
    })
  }, [open, producto, categorias, form])

  return (
    <Modal
      open={open}
      eyebrow="Producto"
      title={producto ? 'Editar producto' : 'Nuevo producto'}
      onClose={onClose}
    >
      {Boolean(error) && (
        <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {leerMensajeError(error, 'No se pudo guardar el producto')}
        </div>
      )}

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          void form.handleSubmit()
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <form.Field
            name="nombre"
            validators={{ onChange: ({ value }) => (value.trim() ? undefined : 'Obligatorio') }}
          >
            {(field) => {
              const mensaje = textoDeErrores(field.state.meta.errors)
              return (
                <div>
                  <label htmlFor="prod-nombre" className="mb-1 block text-sm font-semibold text-slate-700">Nombre</label>
                  <input
                    id="prod-nombre"
                    className="input-field"
                    maxLength={150}
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

          <form.Field name="categoria_id">
            {(field) => {
              const mensaje = textoDeErrores(field.state.meta.errors)
              return (
                <div>
                  <label htmlFor="prod-categoria" className="mb-1 block text-sm font-semibold text-slate-700">Categoría</label>
                  <select
                    id="prod-categoria"
                    className="input-field"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(Number(event.target.value))}
                    aria-invalid={Boolean(mensaje)}
                  >
                    <option value={0}>Seleccionar...</option>
                    {categorias.map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
                    ))}
                  </select>
                  {mensaje && <p className="mt-1 text-xs text-red-600">{mensaje}</p>}
                </div>
              )
            }}
          </form.Field>

          <form.Field
            name="precio_base"
            validators={{ onChange: ({ value }) => (Number.isFinite(value) && value >= 0 ? undefined : 'Precio inválido') }}
          >
            {(field) => {
              const mensaje = textoDeErrores(field.state.meta.errors)
              return (
                <div>
                  <label htmlFor="prod-precio" className="mb-1 block text-sm font-semibold text-slate-700">Precio base</label>
                  <input
                    id="prod-precio"
                    type="number"
                    min={0}
                    step="0.01"
                    className="input-field"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(Number(event.target.value))}
                    aria-invalid={Boolean(mensaje)}
                  />
                  {mensaje && <p className="mt-1 text-xs text-red-600">{mensaje}</p>}
                </div>
              )
            }}
          </form.Field>

          <form.Field
            name="stock"
            validators={{ onChange: ({ value }) => (Number.isInteger(value) && value >= 0 ? undefined : 'Stock inválido') }}
          >
            {(field) => {
              const mensaje = textoDeErrores(field.state.meta.errors)
              return (
                <div>
                  <label htmlFor="prod-stock" className="mb-1 block text-sm font-semibold text-slate-700">Stock</label>
                  <input
                    id="prod-stock"
                    type="number"
                    min={0}
                    step="1"
                    className="input-field"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(Number(event.target.value))}
                    aria-invalid={Boolean(mensaje)}
                  />
                  {mensaje && <p className="mt-1 text-xs text-red-600">{mensaje}</p>}
                </div>
              )
            }}
          </form.Field>
        </div>

        <form.Field name="descripcion">
          {(field) => (
            <Textarea
              id="prod-descripcion"
              etiqueta="Descripción"
              rows={2}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          )}
        </form.Field>

        <form.Field name="imagen_url">
          {(field) => (
            <div>
              <label htmlFor="prod-imagen" className="mb-1 block text-sm font-semibold text-slate-700">URL de imagen</label>
              <input
                id="prod-imagen"
                type="url"
                className="input-field"
                placeholder="https://..."
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="disponible">
          {(field) => (
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(event) => field.handleChange(event.target.checked)}
              />
              Disponible para la venta
            </label>
          )}
        </form.Field>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={guardando}>Cancelar</Button>
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
