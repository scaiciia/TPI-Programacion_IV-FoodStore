import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export function MainLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="page-container">
        <Outlet />
      </main>
    </div>
  )
}
