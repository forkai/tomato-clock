import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AppRouter } from './router'
import { DatabaseProvider } from './hooks/useDatabase'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DatabaseProvider>
      <AppRouter />
    </DatabaseProvider>
  </StrictMode>
)
