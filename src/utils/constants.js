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
