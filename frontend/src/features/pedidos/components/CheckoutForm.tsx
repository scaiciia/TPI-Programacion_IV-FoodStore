import { useForm } from '@tanstack/react-form'
import { Button, Card, Textarea } from '@/shared'
import { leerMensajeError } from '@/shared/api/handleApiError'
import type { CarritoItem } from '@/store/cartStore'
import type { FormaPago, PedidoCreate } from '../types/pedido.types'

interface CheckoutFormProps {
  items: CarritoItem[]
  total: number
  guardando: boolean
  error: unknown
  onCancelar: () => void
  onSubmit: (data: PedidoCreate) => Promise<void>
}

function textoDeErrores(errores: unknown[]): string {
  return errores.map((error) => String(error)).filter(Boolean).join('. ')
}

export function CheckoutForm({ items, total, guardando, error, onCancelar, onSubmit }: CheckoutFormProps) {
  const form = useForm({
    defaultValues: {
      direccion_entrega: '',
      forma_pago: 'EFECTIVO' as FormaPago,
      notas: '',
    },
    validators: {
      onSubmit: ({ value }) => {
        const campos: Record<string, string> = {}
        if (value.direccion_entrega.trim().length < 5) campos.direccion_entrega = 'La dirección debe tener entre 5 y 200 caracteres'
        if (value.direccion_entrega.length > 200) campos.direccion_entrega = 'Máximo 200 caracteres'
        if (value.forma_pago !== 'EFECTIVO' && value.forma_pago !== 'TRANSFERENCIA') campos.forma_pago = 'Forma de pago inválida'
        return Object.keys(campos).length > 0 ? { fields: campos } : undefined
      },
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        items: items.map((item) => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
        })),
        forma_pago: value.forma_pago,
        direccion_entrega: value.direccion_entrega.trim(),
        notas: value.notas.trim() || null,
      })
    },
  })

  return (
    <Card title="Confirmar pedido" subtitle="Revisá el resumen y completá la entrega.">
      <div className="mb-6 rounded-xl bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Resumen del carrito</p>
        <ul className="mt-2 divide-y divide-slate-200 text-sm">
          {items.map((item) => (
            <li key={item.producto_id} className="flex justify-between py-2">
              <span>{item.nombre} × {item.cantidad}</span>
              <span className="font-semibold">${(item.precio_unitario * item.cantidad).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-right text-lg font-black">Total: ${total.toFixed(2)}</p>
      </div>

      {Boolean(error) && (
        <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {leerMensajeError(error, 'No se pudo crear el pedido')}
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
          name="direccion_entrega"
          validators={{ onChange: ({ value }) => (value.trim().length >= 5 ? undefined : 'Mínimo 5 caracteres') }}
        >
          {(field) => {
            const mensaje = textoDeErrores(field.state.meta.errors)
            return (
              <div>
                <label htmlFor="checkout-direccion" className="mb-1 block text-sm font-semibold text-slate-700">
                  Dirección de entrega
                </label>
                <input
                  id="checkout-direccion"
                  className="input-field"
                  maxLength={200}
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

        <form.Field name="forma_pago">
          {(field) => (
            <div>
              <label htmlFor="checkout-pago" className="mb-1 block text-sm font-semibold text-slate-700">
                Forma de pago
              </label>
              <select
                id="checkout-pago"
                className="input-field"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value as FormaPago)}
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </select>
            </div>
          )}
        </form.Field>

        <form.Field name="notas">
          {(field) => (
            <Textarea
              id="checkout-notas"
              etiqueta="Notas (opcional)"
              rows={3}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          )}
        </form.Field>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onCancelar} disabled={guardando}>Volver al carrito</Button>
          <form.Subscribe selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}>
            {({ canSubmit, isSubmitting }) => (
              <Button type="submit" disabled={!canSubmit || isSubmitting || guardando}>
                {isSubmitting || guardando ? 'Confirmando...' : 'Confirmar pedido'}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </Card>
  )
}
