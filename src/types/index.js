/**
 * @typedef {'user' | 'host' | 'admin'} UserRole
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {UserRole} role
 * @property {boolean} approved
 * @property {boolean} disabled
 * @property {string} [photoURL]
 * @property {string} [fcmToken]
 * @property {import('firebase/firestore').Timestamp} createdAt
 */

/**
 * @typedef {Object} Event
 * @property {string} id
 * @property {string} title
 * @property {string} area
 * @property {string} church
 * @property {string} activityCode
 * @property {string} activityName
 * @property {string} details
 * @property {string} startDate
 * @property {string} startTime
 * @property {string} endTime
 * @property {string} creatorId
 * @property {string} creatorName
 * @property {string} createdById
 * @property {string} createdByName
 * @property {UserRole} createdByRole
 * @property {string} supervisorId
 * @property {string} supervisorName
 * @property {'my_supervision' | 'volunteer' | 'none'} [supervisionType]
 * @property {import('firebase/firestore').Timestamp} createdAt
 */

/**
 * @typedef {Object} Comment
 * @property {string} id
 * @property {string} eventId
 * @property {string} userId
 * @property {string} userName
 * @property {string} text
 * @property {import('firebase/firestore').Timestamp} createdAt
 */

/**
 * @typedef {Object} Notification
 * @property {string} id
 * @property {string} userId
 * @property {string} title
 * @property {string} message
 * @property {boolean} read
 * @property {'event' | 'comment' | 'approval' | 'event_started' | 'users'} [type]
 * @property {string} [eventId]
 * @property {import('firebase/firestore').Timestamp} createdAt
 */

/**
 * @typedef {Object} EventFormData
 * @property {string} title
 * @property {string} area
 * @property {string} church
 * @property {string} activityCode
 * @property {string} activityName
 * @property {string} details
 * @property {string} startDate
 * @property {string} startTime
 * @property {string} endTime
 * @property {string} [creatorId]
 * @property {'my_supervision' | 'volunteer' | 'none'} supervisionType
 */

export {}
