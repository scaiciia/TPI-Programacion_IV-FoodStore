import type { ColumnDef } from '@tanstack/react-table'
import { useAuth } from '@/features/auth'
import { Button, Card, DataTable } from '@/shared'
import { leerMensajeError } from '@/shared/api/handleApiError'
import { useUsuarios } from '../hooks/useUsuarios'
import type { UsuarioAdmin } from '../types/usuario.types'

export function AdminUsuariosPage() {
  const { user } = useAuth()
  const { usuarios, isLoading, error, refetch, activar, desactivar } = useUsuarios()
  const fallo = activar.error ?? desactivar.error

  const columnas: ColumnDef<UsuarioAdmin>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'username', header: 'Usuario' },
    { accessorKey: 'full_name', header: 'Nombre' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'role', header: 'Rol' },
    {
      accessorKey: 'disabled',
      header: 'Estado',
      cell: (info) => (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${info.getValue() ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
          {info.getValue() ? 'Desactivado' : 'Activo'}
        </span>
      ),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: (info) => {
        const usuario = info.row.original
        return (
          <div className="flex flex-wrap gap-2">
            {usuario.disabled ? (
              <Button
                variant="outline"
                disabled={activar.isPending}
                onClick={() => activar.mutate(usuario.id)}
              >
                Activar
              </Button>
            ) : (
              usuario.id !== user?.id && (
                <Button
                  variant="danger"
                  disabled={desactivar.isPending}
                  onClick={() => {
                    if (window.confirm(`¿Desactivar a ${usuario.username}?`)) {
                      desactivar.mutate(usuario.id)
                    }
                  }}
                >
                  Desactivar
                </Button>
              )
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <Card title="Gestión de usuarios" subtitle="Activá o desactivá cuentas; un admin no puede desactivarse a sí mismo.">
        {Boolean(fallo) && (
          <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {leerMensajeError(fallo, 'No se pudo actualizar el usuario')}
          </div>
        )}
        <DataTable
          columns={columnas}
          data={usuarios}
          isLoading={isLoading}
          error={error}
          onRetry={() => void refetch()}
          emptyMessage="No hay usuarios registrados."
          searchPlaceholder="Buscar usuario..."
        />
      </Card>
    </div>
  )
}
