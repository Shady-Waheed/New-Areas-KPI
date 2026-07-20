import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'
import { useNotifications } from '../../hooks/useNotifications'
import { useNotificationStore } from '../../store/notificationStore'
import { markNotificationRead, markAllNotificationsRead } from '../../services/notificationService'
import { getNotificationPath } from '../../utils/notificationNavigation'
import { useAuth } from '../../hooks/useAuth'
import { formatRelativeTime } from '../../utils/formatters'

export default function NotificationPanel() {
  const ref = useRef(null)
  const navigate = useNavigate()
  const { notifications } = useNotifications()
  const { setPanelOpen } = useNotificationStore()
  const { user } = useAuth()

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setPanelOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [setPanelOpen])

  const handleMarkAllRead = async () => {
    if (user?.id) await markAllNotificationsRead(user.id)
  }

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markNotificationRead(notification.id)
    }

    setPanelOpen(false)
    navigate(getNotificationPath(notification))
  }

  return (
    <div
      ref={ref}
      className="absolute end-0 z-50 mt-2 w-[min(24rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900"
    >
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            <CheckCheck size={14} />
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Bell size={32} className="mb-2 opacity-50" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={() => handleNotificationClick(notification)}
              className={`w-full border-b border-gray-100 px-4 py-3 text-right transition-colors last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800 ${
                !notification.read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
              } cursor-pointer`}
            >
              <div className="flex items-start gap-2">
                {!notification.read && (
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-600" />
                )}
                <div className={`min-w-0 flex-1 ${!notification.read ? '' : 'ms-4'}`}>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {notification.title}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                    {notification.message}
                  </p>
                  <p className="mt-1 text-[10px] text-gray-400">
                    {formatRelativeTime(notification.createdAt)}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
