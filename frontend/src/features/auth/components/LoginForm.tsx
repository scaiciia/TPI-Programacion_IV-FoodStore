import { useForm } from '@tanstack/react-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button, Card } from '@/shared'
import { useAuth } from '../hooks/useAuth'

function textoDeErrores(errores: unknown[]): string {
  return errores.map((error) => String(error)).filter(Boolean).join('. ')
}

export function LoginForm() {
  const { login, error, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const destino = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/'

  const form = useForm({
    defaultValues: { username: '', password: '' },
    validators: {
      onSubmit: ({ value }) => {
        const campos: Record<string, string> = {}
        if (!value.username.trim()) campos.username = 'Ingresá tu usuario'
        if (!value.password) campos.password = 'Ingresá tu contraseña'
        return Object.keys(campos).length > 0 ? { fields: campos } : undefined
      },
    },
    onSubmit: async ({ value }) => {
      try {
        await login(value.username.trim(), value.password)
        navigate(destino, { replace: true })
      } catch {
        // El mensaje lo muestra el authStore.
      }
    },
  })

  return (
    <Card title="Iniciar sesión" subtitle="Ingresá con tu usuario y contraseña." className="mx-auto w-full max-w-md">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <form.Field
          name="username"
          validators={{ onChange: ({ value }) => (value.trim() ? undefined : 'El usuario es obligatorio') }}
        >
          {(field) => {
            const mensaje = textoDeErrores(field.state.meta.errors)
            return (
              <div>
                <label htmlFor="login-usuario" className="mb-1 block text-sm font-semibold text-slate-700">
                  Usuario
                </label>
                <input
                  id="login-usuario"
                  className="input-field"
                  autoComplete="username"
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

        <form.Field
          name="password"
          validators={{ onChange: ({ value }) => (value ? undefined : 'La contraseña es obligatoria') }}
        >
          {(field) => {
            const mensaje = textoDeErrores(field.state.meta.errors)
            return (
              <div>
                <label htmlFor="login-password" className="mb-1 block text-sm font-semibold text-slate-700">
                  Contraseña
                </label>
                <input
                  id="login-password"
                  type="password"
                  className="input-field"
                  autoComplete="current-password"
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

        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <form.Subscribe selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}>
          {({ canSubmit, isSubmitting }) => (
            <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting || isLoading}>
              {isSubmitting || isLoading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600">
        ¿No tenés cuenta?{' '}
        <Link to="/register" className="font-semibold text-orange-700 hover:underline">
          Registrate
        </Link>
      </p>
    </Card>
  )
}
