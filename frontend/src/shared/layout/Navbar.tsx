import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'

const enlace = 'rounded-lg px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:text-white'

export function Navbar() {
  const { user, hasRole, logout } = useAuth()
  const navigate = useNavigate()

  const cerrarSesion = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="bg-slate-900 text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1">
          <Link to="/" className="mr-3 text-xl font-black tracking-tight text-orange-400">
            Food Store
          </Link>
          <Link to="/" className={enlace}>
            Catálogo
          </Link>
          <Link to="/carrito" className={enlace}>
            Carrito
          </Link>
          {user && (
            <Link to="/mis-pedidos" className={enlace}>
              Mis pedidos
            </Link>
          )}
          {hasRole('admin') && (
            <>
              <Link to="/admin/resumen" className={enlace}>
                Resumen
              </Link>
              <Link to="/admin/categorias" className={enlace}>
                Categorías
              </Link>
              <Link to="/admin/productos" className={enlace}>
                Productos
              </Link>
              <Link to="/admin/pedidos" className={enlace}>
                Pedidos
              </Link>
              <Link to="/admin/usuarios" className={enlace}>
                Usuarios
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <span className="hidden text-slate-300 sm:inline">
                {user.full_name} <strong className="text-orange-400">({user.role})</strong>
              </span>
              <button
                type="button"
                onClick={() => void cerrarSesion()}
                className="rounded-lg bg-slate-800 px-3 py-2 font-semibold text-white hover:bg-slate-700"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={enlace}>
                Ingresar
              </Link>
              <Link to="/register" className="btn-primary">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
