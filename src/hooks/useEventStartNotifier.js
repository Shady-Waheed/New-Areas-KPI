import { useEffect, useRef } from 'react'
import { hasEventStarted } from '../utils/dateHelpers'
import { createNotification } from '../services/notificationService'
import { useAuth } from './useAuth'

/**
 * Notifies admins/hosts when events reach their start time.
 * Runs client-side while the app is open; use Cloud Functions for production cron.
 * @param {import('../types').Event[]} events
 */
export function useEventStartNotifier(events) {
  const { user, isPrivileged } = useAuth()
  const notifiedRef = useRef(new Set())

  useEffect(() => {
    if (!isPrivileged || !user?.id || !events.length) return

    const interval = setInterval(() => {
      events.forEach((event) => {
        const key = `${event.id}-${event.startDate}-${event.startTime}`
        if (notifiedRef.current.has(key)) return

        if (hasEventStarted(event)) {
          notifiedRef.current.add(key)
          createNotification({
            userId: user.id,
            title: 'Event Started',
            message: `"${event.title}" has reached its start time.`,
            type: 'event_started',
            eventId: event.id,
          }).catch(console.error)
        }
      })
    }, 30000)

    return () => clearInterval(interval)
  }, [events, isPrivileged, user?.id])
}
