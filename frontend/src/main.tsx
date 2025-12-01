import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { BackgroundProvider } from './context/BackgroundContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BackgroundProvider>
        <App />
      </BackgroundProvider>
    </AuthProvider>
  </StrictMode>,
)
