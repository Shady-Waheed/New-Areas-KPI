/**
 * @param {import('../types').Notification} notification
 * @returns {string}
 */
export function getNotificationPath(notification) {
  if (notification.eventId) {
    return `/dashboard?event=${encodeURIComponent(notification.eventId)}`
  }

  switch (notification.type) {
    case 'approval':
      return '/dashboard'
    case 'users':
      return '/users'
    default:
      return '/dashboard'
  }
}
