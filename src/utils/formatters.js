import { format, formatDistanceToNow } from 'date-fns'

/**
 * @param {import('firebase/firestore').Timestamp | Date | null | undefined} timestamp
 * @returns {string}
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : timestamp
  return format(date, 'MMM d, yyyy h:mm a')
}

/**
 * @param {import('firebase/firestore').Timestamp | Date | null | undefined} timestamp
 * @returns {string}
 */
export function formatRelativeTime(timestamp) {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : timestamp
  return formatDistanceToNow(date, { addSuffix: true })
}

/**
 * @param {string} date - YYYY-MM-DD
 * @param {string} time - HH:mm
 * @returns {Date}
 */
export function combineDateAndTime(date, time) {
  return new Date(`${date}T${time}`)
}

/**
 * @param {string} date - YYYY-MM-DD
 * @param {string} time - HH:mm
 * @returns {string} ISO string for FullCalendar
 */
export function toISODateTime(date, time) {
  return `${date}T${time}:00`
}
