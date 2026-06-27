/**
 * @param {import('../types').Event} event
 * @param {string} userId
 * @returns {boolean}
 */
export function isUserOwnEvent(event, userId) {
  return event.creatorId === userId || event.createdById === userId
}

/**
 * @param {import('../types').Event} event
 * @returns {boolean}
 */
export function isLeadershipEvent(event) {
  return event.createdByRole === 'host' || event.createdByRole === 'admin'
}

/**
 * Regular users can view their events + events created by host/admin.
 * @param {import('../types').Event} event
 * @param {string} userId
 * @returns {boolean}
 */
export function canUserViewEvent(event, userId) {
  return isUserOwnEvent(event, userId) || isLeadershipEvent(event)
}

/**
 * @param {import('../types').Event} event
 * @param {string} userId
 * @param {boolean} isPrivileged
 * @returns {boolean}
 */
export function canUserReadEventComments(event, userId, isPrivileged) {
  if (isPrivileged) return true
  return canUserViewEvent(event, userId)
}

/**
 * @param {import('../types').Event[]} events
 * @returns {import('../types').Event[]}
 */
export function mergeAndSortEvents(events) {
  const map = new Map()
  events.forEach((event) => map.set(event.id, event))
  return [...map.values()].sort((a, b) => {
    const aKey = `${a.startDate}T${a.startTime}`
    const bKey = `${b.startDate}T${b.startTime}`
    return aKey.localeCompare(bKey)
  })
}
