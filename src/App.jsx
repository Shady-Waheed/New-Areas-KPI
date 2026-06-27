import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthInit } from './hooks/useAuth'
import { useNotifications } from './hooks/useNotifications'
import { useThemeStore } from './store/themeStore'
import { useEffect } from 'react'
import AppRoutes from './routes/AppRoutes'

function AppInitializer() {
  useAuthInit()
  useNotifications()

  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return <AppRoutes />
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInitializer />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'dark:!bg-gray-800 dark:!text-gray-100',
        }}
      />
    </BrowserRouter>
  )
}
