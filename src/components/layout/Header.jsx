import { Menu, Moon, Sun } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useThemeStore } from '../../store/themeStore'
import NotificationBell from '../notifications/NotificationBell'
import UserMenu from './UserMenu'

const PAGE_TITLES = {
  '/dashboard': 'Calendar',
  '/users': 'User Management',
  '/profile': 'Profile',
}

/**
 * @param {{ onMenuClick: () => void }} props
 */
export default function Header({ onMenuClick }) {
  const { theme, toggleTheme } = useThemeStore()
  const { pathname } = useLocation()
  const pageTitle = PAGE_TITLES[pathname] || 'Dashboard'

  return (
    <header className="app-header">
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="truncate text-base font-medium text-gray-900 sm:text-lg dark:text-gray-100">
          {pageTitle}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  )
}
