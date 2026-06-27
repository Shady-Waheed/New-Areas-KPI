import { Outlet, Link } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '../store/themeStore'
import { useAuth } from '../hooks/useAuth'
import NotificationBell from '../components/notifications/NotificationBell'

export default function AuthLayout() {
  const { theme, toggleTheme } = useThemeStore()
  const { user } = useAuth()

  return (
    <div className="flex min-h-full flex-col bg-gray-50 dark:bg-gray-950">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
            K
          </div>
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            New Areas KPI
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {user && <NotificationBell />}
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-12">
        <Outlet />
      </div>
    </div>
  )
}
