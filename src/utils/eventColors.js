import { EVENT_COLORS } from './constants'
import { inferSupervisionType } from './supervision'

/**
 * @param {string | undefined | null} supervisorId
 * @returns {boolean}
 */
export function hasSupervisor(supervisorId) {
  return Boolean(supervisorId && String(supervisorId).trim())
}

/**
 * @param {import('../types').Event} event
 * @param {string} currentUserId
 * @returns {string}
 */
export function getEventColor(event, currentUserId) {
  const type = inferSupervisionType(event, currentUserId)

  if (type === 'none') return EVENT_COLORS.noSupervisor
  if (type === 'my_supervision') return EVENT_COLORS.mySupervision
  return EVENT_COLORS.volunteerSupervision
}

/**
 * @param {import('../types').Event} event
 * @param {string} currentUserId
 */
export function getEventStyle(event, currentUserId) {
  const color = getEventColor(event, currentUserId)
  return {
    backgroundColor: color,
    borderColor: color,
    textColor: '#ffffff',
  }
}

export const EVENT_COLOR_LEGEND = [
  {
    color: EVENT_COLORS.mySupervision,
    labelAr: 'تحت إشرافي الشخصي',
    labelEn: 'My supervision',
  },
  {
    color: EVENT_COLORS.volunteerSupervision,
    labelAr: 'تحت إشراف متطوع',
    labelEn: 'Volunteer supervision',
  },
  {
    color: EVENT_COLORS.noSupervisor,
    labelAr: 'لا يوجد مشرف',
    labelEn: 'No supervisor',
  },
]
