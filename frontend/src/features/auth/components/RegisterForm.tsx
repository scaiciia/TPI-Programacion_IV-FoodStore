import { useForm } from '@tanstack/react-form'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Card } from '@/shared'
import { useAuth } from '../hooks/useAuth'

function textoDeErrores(errores: unknown[]): string {
  return errores.map((error) => String(error)).filter(Boolean).join('. ')
}

export function RegisterForm() {
  const { register, error, isLoading } = useAuth()
  const navigate = useNavigate()

  const form = useForm({
    defaultValues: {
      username: '',
      full_name: '',
      email: '',
      password: '',
      confirmacion: '',
    },
    validators: {
      onSubmit: ({ value }) => {
        const campos: Record<string, string> = {}
        if (value.username.trim().length < 3) campos.username = 'Mínimo 3 caracteres'
        if (!value.full_name.trim()) campos.full_name = 'Ingresá tu nombre'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) campos.email = 'Email inválido'
        if (value.password.length < 8) campos.password = 'Mínimo 8 caracteres'
        if (value.password !== value.confirmacion) campos.confirmacion = 'Las contraseñas no coinciden'
        return Object.keys(campos).length > 0 ? { fields: campos } : undefined
      },
    },
    onSubmit: async ({ value }) => {
      try {
        await register({
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        })
        navigate('/login', { replace: true })
      } catch {
        // El mensaje lo muestra el authStore.
      }
    },
  })

  const campo = (nombre: 'username' | 'full_name' | 'email' | 'password' | 'confirmacion') => (
    <form.Field name={nombre}>
      {(field) => {
        const mensaje = textoDeErrores(field.state.meta.errors)
        const tipo = nombre === 'email' ? 'email' : nombre.includes('password') || nombre === 'confirmacion' ? 'password' : 'text'
        return (
          <div>
            <label htmlFor={`reg-${nombre}`} className="mb-1 block text-sm font-semibold text-slate-700 capitalize">
              {nombre.replace('_', ' ')}
            </label>
            <input
              id={`reg-${nombre}`}
              type={tipo}
              className="input-field"
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
  )

  return (
    <Card title="Crear cuenta" subtitle="El registro crea usuarios con rol cliente." className="mx-auto w-full max-w-lg">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
      >
        {campo('username')}
        {campo('full_name')}
        {campo('email')}
        <div className="grid gap-4 sm:grid-cols-2">
          {campo('password')}
          {campo('confirmacion')}
        </div>

        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <form.Subscribe selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}>
          {({ canSubmit, isSubmitting }) => (
            <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting || isLoading}>
              {isSubmitting || isLoading ? 'Registrando...' : 'Registrarme'}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" className="font-semibold text-orange-700 hover:underline">
          Ingresá
        </Link>
      </p>
    </Card>
  )
}
