import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { queryClient } from '@/shared/api/queryClient'
import { configurarInterceptores } from '@/shared/api/setupInterceptors'
import './index.css'

configurarInterceptores()

const root = document.getElementById('root')
if (!root) throw new Error('No se encontró el elemento #root')

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
