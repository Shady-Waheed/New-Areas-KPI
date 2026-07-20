import { format } from 'date-fns'

/**
 * @returns {string} Today's date as YYYY-MM-DD
 */
export function getTodayString() {
  return format(new Date(), 'yyyy-MM-dd')
}

/**
 * @param {string} dateStr YYYY-MM-DD
 * @returns {boolean}
 */
export function isDateBeforeToday(dateStr) {
  return dateStr < getTodayString()
}

/**
 * @param {string} dateStr
 * @param {{ allowDate?: string }} [options]
 * @returns {true | string}
 */
export function validateEventStartDate(dateStr, options = {}) {
  if (!dateStr) return 'Start date is required'
  if (!isDateBeforeToday(dateStr)) return true
  if (options.allowDate && dateStr === options.allowDate) return true
  return 'لا يمكن إضافة حدث قبل اليوم الحالي'
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
