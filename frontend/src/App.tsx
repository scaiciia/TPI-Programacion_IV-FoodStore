import { useEffect } from 'react'
import { useAuth } from '@/features/auth'
import { AppRouter } from '@/routes/AppRouter'

export default function App() {
  const { checkSession } = useAuth()

  useEffect(() => {
    void checkSession()
  }, [checkSession])

  return <AppRouter />
}
