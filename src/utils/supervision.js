/** @typedef {'my_supervision' | 'volunteer' | 'none'} SupervisionType */

export const SUPERVISION_TYPES = [
  {
    value: 'my_supervision',
    labelAr: 'تحت إشرافي الشخصي',
    color: '#1a73e8',
  },
  {
    value: 'volunteer',
    labelAr: 'تحت إشراف متطوع',
    color: '#34a853',
  },
  {
    value: 'none',
    labelAr: 'لا يوجد مشرف',
    color: '#9aa0a6',
  },
]

/**
 * @param {SupervisionType} supervisionType
 * @param {{ id: string, name: string }} user
 * @returns {{ supervisionType: SupervisionType, supervisorId: string, supervisorName: string }}
 */
export function resolveSupervisionFields(supervisionType, user) {
  switch (supervisionType) {
    case 'my_supervision':
      return {
        supervisionType,
        supervisorId: user.id,
        supervisorName: user.name,
      }
    case 'volunteer':
      return {
        supervisionType,
        supervisorId: 'volunteer',
        supervisorName: 'متطوع',
      }
    case 'none':
    default:
      return {
        supervisionType: 'none',
        supervisorId: '',
        supervisorName: '',
      }
  }
}

/**
 * @param {import('../types').Event} event
 * @param {string} userId
 * @returns {SupervisionType}
 */
export function inferSupervisionType(event, userId) {
  if (event.supervisionType) return event.supervisionType
  if (!event.supervisorId || !String(event.supervisorId).trim()) return 'none'
  if (event.supervisorId === userId) return 'my_supervision'
  if (event.supervisorId === 'volunteer') return 'volunteer'
  return 'volunteer'
}

/**
 * @param {SupervisionType | string} supervisionType
 * @returns {string}
 */
export function getSupervisionLabel(supervisionType) {
  const found = SUPERVISION_TYPES.find((t) => t.value === supervisionType)
  return found?.labelAr || 'لا يوجد مشرف'
}
