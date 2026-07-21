/**
 * @param {import('../types').Event} event
 * @param {string} userId
 * @returns {boolean}
 */
export function isUserOwnEvent(event, userId) {
  return event.creatorId === userId || event.createdById === userId;
}

/**
 * @param {import('../types').Event} event
 * @returns {boolean}
 */
export function isLeadershipEvent(event) {
  return (
    event.createdByRole === "host" ||
    event.createdByRole === "admin" ||
    event.createdByRole === "admin_readonly"
  );
}

/**
 * Regular users can view their events + events created by host/admin.
 * @param {import('../types').Event} event
 * @param {string} userId
 * @returns {boolean}
 */
export function canUserViewEvent(event, userId) {
  if (!event || !userId) return false;
  if (isUserOwnEvent(event, userId)) return true;
  if (event.audienceType === "everyone") return true;
  if (
    event.audienceType === "selected" &&
    Array.isArray(event.audienceUserIds)
  ) {
    return event.audienceUserIds.includes(userId);
  }
  return false;
}

/**
 * @param {import('../types').Event} event
 * @param {string} userId
 * @param {boolean} isPrivileged
 * @returns {boolean}
 */
export function canUserReadEventComments(event, userId, isPrivileged) {
  if (isPrivileged) return true;
  return canUserViewEvent(event, userId);
}

/**
 * @param {import('../types').Event[]} events
 * @returns {import('../types').Event[]}
 */
export function mergeAndSortEvents(events) {
  const map = new Map();
  events.forEach((event) => map.set(event.id, event));
  return [...map.values()].sort((a, b) => {
    const aKey = `${a.startDate}T${a.startTime}`;
    const bKey = `${b.startDate}T${b.startTime}`;
    return aKey.localeCompare(bKey);
  });
}
