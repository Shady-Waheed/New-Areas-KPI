import { format } from 'date-fns'

/**
 * @returns {string} Today's date as YYYY-MM-DD
 */
export function getTodayString() {
  return format(new Date(), 'yyyy-MM-dd')
}

/**
 * @returns {string} Current time as HH:mm
 */
export function getCurrentTimeString() {
  return format(new Date(), 'HH:mm')
}

/**
 * Check if an event's start time has been reached (within a 1-minute window).
 * @param {import('../types').Event} event
 * @returns {boolean}
 */
export function hasEventStarted(event) {
  const start = new Date(`${event.startDate}T${event.startTime}`)
  const now = new Date()
  const diffMs = now.getTime() - start.getTime()
  return diffMs >= 0 && diffMs < 60000
}
