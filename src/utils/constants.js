/** @type {import('../types').UserRole[]} */
export const ROLES = ['user', 'host', 'admin']

export const ROLE_LABELS = {
  user: 'User',
  host: 'Host',
  admin: 'Admin',
}

/** @type {{ code: string, labelAr: string }[]} */
export const ACTIVITY_CODES = [
  { code: 'Egt625', labelAr: 'الحضور' },
  { code: 'Egy549', labelAr: 'البناء' },
  { code: 'Egt553', labelAr: 'السنتر' },
  { code: 'Egs605', labelAr: 'الدعم' },
  { code: 'Egt586', labelAr: 'الخروج' },
]

/**
 * @returns {{ value: string, label: string }[]}
 */
export function getActivityCodeOptions() {
  return ACTIVITY_CODES.map(({ code, labelAr }) => ({
    value: code,
    label: `${code} — ${labelAr}`,
  }))
}

/**
 * @param {string} code
 * @returns {string}
 */
export function getActivityCodeLabel(code) {
  const found = ACTIVITY_CODES.find((item) => item.code === code)
  return found ? `${found.code} — ${found.labelAr}` : code
}

export const ACTIVITY_NUMBER_MIN = 1
export const ACTIVITY_NUMBER_MAX = 15

/**
 * @returns {{ value: string, label: string }[]}
 */
export function getActivityNumberOptions() {
  return Array.from({ length: ACTIVITY_NUMBER_MAX }, (_, index) => {
    const value = String(index + ACTIVITY_NUMBER_MIN)
    return { value, label: value }
  })
}

/**
 * @param {string | number} value
 * @returns {true | string}
 */
export function validateActivityNumber(value) {
  const num = Number(value)
  if (
    !Number.isInteger(num) ||
    num < ACTIVITY_NUMBER_MIN ||
    num > ACTIVITY_NUMBER_MAX
  ) {
    return `النشاط يجب أن يكون رقماً من ${ACTIVITY_NUMBER_MIN} إلى ${ACTIVITY_NUMBER_MAX}`
  }
  return true
}

export const AREAS = [
  'North Area',
  'South Area',
  'East Area',
  'West Area',
  'Central Area',
]

export const CHURCHES = [
  'Grace Community Church',
  'Hope Fellowship',
  'New Life Assembly',
  'River of Life Church',
  'St. Mark Parish',
  'Victory Chapel',
]

export const EVENT_COLORS = {
  mySupervision: '#1a73e8',
  volunteerSupervision: '#34a853',
  noSupervisor: '#9aa0a6',
}

export const COLLECTIONS = {
  USERS: 'users',
  EVENTS: 'events',
  COMMENTS: 'comments',
  NOTIFICATIONS: 'notifications',
}
