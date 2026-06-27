import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { COLLECTIONS } from '../utils/constants'
import { mergeAndSortEvents } from '../utils/eventAccess'
import { notifyUsers } from './notificationService'
import { getUsersByRole } from './userService'

/**
 * @param {import('../types').Event[]} lists
 * @returns {import('../types').Event[]}
 */
function mergeEventLists(...lists) {
  return mergeAndSortEvents(lists.flat())
}

/**
 * Subscribe to events visible for regular users:
 * - what they created
 * - what host/admin created on the calendar
 * @param {import('../types').User} user
 * @param {(events: import('../types').Event[]) => void} callback
 * @returns {() => void}
 */
function subscribeToUserVisibleEvents(user, callback) {
  const creatorQuery = query(
    collection(db, COLLECTIONS.EVENTS),
    where('creatorId', '==', user.id)
  )
  const createdByQuery = query(
    collection(db, COLLECTIONS.EVENTS),
    where('createdById', '==', user.id)
  )
  const leadershipQuery = query(
    collection(db, COLLECTIONS.EVENTS),
    where('createdByRole', 'in', ['host', 'admin'])
  )

  const buckets = {
    creator: [],
    createdBy: [],
    leadership: [],
  }
  const ready = {
    creator: false,
    createdBy: false,
    leadership: false,
  }

  const emit = () => {
    if (!ready.creator || !ready.createdBy || !ready.leadership) return
    callback(mergeEventLists(buckets.creator, buckets.createdBy, buckets.leadership))
  }

  const listen = (q, key, isOptional = false) =>
    onSnapshot(
      q,
      (snapshot) => {
        buckets[key] = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
        ready[key] = true
        emit()
      },
      (error) => {
        if (isOptional) {
          console.warn(`${key} events listener:`, error.code)
        } else {
          console.error(`${key} events listener:`, error.code, error.message)
        }
        buckets[key] = []
        ready[key] = true
        emit()
      }
    )

  const unsubCreator = listen(creatorQuery, 'creator')
  const unsubCreatedBy = listen(createdByQuery, 'createdBy')
  const unsubLeadership = listen(leadershipQuery, 'leadership', true)

  return () => {
    unsubCreator()
    unsubCreatedBy()
    unsubLeadership()
  }
}

/**
 * Admin sees every event. Host sees all events for management.
 * User sees own events + host/admin events.
 * @param {import('../types').User} user
 * @param {(events: import('../types').Event[]) => void} callback
 * @returns {() => void}
 */
export function subscribeToEvents(user, callback) {
  const isAdmin = user.role === 'admin'
  const isHost = user.role === 'host'

  if (isAdmin || isHost) {
    return onSnapshot(
      collection(db, COLLECTIONS.EVENTS),
      (snapshot) => {
        callback(
          mergeAndSortEvents(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
        )
      },
      (error) => {
        console.error('All events listener:', error.code, error.message)
        callback([])
      }
    )
  }

  return subscribeToUserVisibleEvents(user, callback)
}

/**
 * @param {string} eventId
 * @returns {Promise<import('../types').Event | null>}
 */
export async function getEvent(eventId) {
  const eventDoc = await getDoc(doc(db, COLLECTIONS.EVENTS, eventId))
  if (!eventDoc.exists()) return null
  return { id: eventDoc.id, ...eventDoc.data() }
}

/**
 * @param {import('../types').EventFormData & { creatorId: string, creatorName: string, supervisorName?: string, supervisionType?: string }} data
 * @param {import('../types').User} currentUser
 * @returns {Promise<string>}
 */
export async function createEvent(data, currentUser) {
  const eventData = {
    title: data.title,
    area: data.area,
    church: data.church,
    activityCode: data.activityCode,
    activityName: data.activityName,
    details: data.details,
    startDate: data.startDate,
    startTime: data.startTime,
    endTime: data.endTime,
    creatorId: data.creatorId || currentUser.id,
    creatorName: data.creatorName || currentUser.name,
    createdById: currentUser.id,
    createdByName: currentUser.name,
    createdByRole: currentUser.role,
    supervisorId: data.supervisorId || '',
    supervisorName: data.supervisorName || '',
    supervisionType: data.supervisionType || 'none',
    createdAt: serverTimestamp(),
  }

  const docRef = await addDoc(collection(db, COLLECTIONS.EVENTS), eventData)

  try {
    if (eventData.creatorId !== currentUser.id) {
      await notifyUsers([eventData.creatorId], {
        title: 'New Event Created',
        message: `${currentUser.name} created an event "${eventData.title}" for you.`,
      })
    }

    if (currentUser.role === 'user') {
      const [admins, hosts] = await Promise.all([
        getUsersByRole('admin'),
        getUsersByRole('host'),
      ])
      const privilegedIds = [...admins, ...hosts]
        .filter((u) => !u.disabled && u.approved && u.id !== currentUser.id)
        .map((u) => u.id)

      if (privilegedIds.length) {
        await notifyUsers(privilegedIds, {
          title: 'New Event',
          message: `${currentUser.name} created a new event: "${eventData.title}"`,
        })
      }
    }
  } catch (notifyError) {
    console.error('Notification failed after event create:', notifyError?.code || notifyError)
  }

  return docRef.id
}

/**
 * @param {string} eventId
 * @param {Partial<import('../types').Event>} data
 */
export async function updateEvent(eventId, data) {
  const {
    createdById,
    createdByName,
    createdByRole,
    createdAt,
    id,
    ...safeData
  } = data
  await updateDoc(doc(db, COLLECTIONS.EVENTS, eventId), safeData)
}

/**
 * @param {string} eventId
 */
export async function deleteEvent(eventId) {
  await deleteDoc(doc(db, COLLECTIONS.EVENTS, eventId))
}

/**
 * @param {import('../types').Event[]} events
 * @param {{ person?: string, area?: string, church?: string, activityCode?: string, date?: string }} filters
 * @returns {import('../types').Event[]}
 */
export function filterEvents(events, filters) {
  return events.filter((event) => {
    if (filters.person && !event.creatorName.toLowerCase().includes(filters.person.toLowerCase())) {
      return false
    }
    if (filters.area && !event.area.toLowerCase().includes(filters.area.toLowerCase())) return false
    if (filters.church && !event.church.toLowerCase().includes(filters.church.toLowerCase())) return false
    if (filters.activityCode && event.activityCode !== filters.activityCode) return false
    if (filters.date && event.startDate !== filters.date) return false
    return true
  })
}
