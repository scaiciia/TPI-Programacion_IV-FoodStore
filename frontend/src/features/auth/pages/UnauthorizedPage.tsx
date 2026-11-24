import { Link } from 'react-router-dom'
import { Card } from '@/shared'

export function UnauthorizedPage() {
  return (
    <Card className="mx-auto max-w-lg text-center">
      <p className="text-5xl font-black text-orange-500">403</p>
      <h1 className="mt-3 text-2xl font-bold text-slate-900">Sin permisos</h1>
      <p className="mt-2 text-sm text-slate-600">
        No tenés un rol con acceso a esta sección.
      </p>
      <Link to="/" className="btn-primary mt-6 inline-flex">
        Volver al catálogo
      </Link>
    </Card>
  )
}
