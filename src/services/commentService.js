import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { COLLECTIONS } from '../utils/constants'
import { createNotification } from './notificationService'

/**
 * @param {import('../types').Comment[]} comments
 * @returns {import('../types').Comment[]}
 */
function sortComments(comments) {
  return [...comments].sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() ?? a.createdAt?.seconds ?? 0
    const bTime = b.createdAt?.toMillis?.() ?? b.createdAt?.seconds ?? 0
    return aTime - bTime
  })
}

/**
 * Subscribe to comments for an event (real-time, no composite index required).
 * @param {string} eventId
 * @param {(comments: import('../types').Comment[]) => void} callback
 * @returns {() => void}
 */
export function subscribeToComments(eventId, callback) {
  const q = query(
    collection(db, COLLECTIONS.COMMENTS),
    where('eventId', '==', eventId)
  )

  return onSnapshot(
    q,
    (snapshot) => {
      const comments = sortComments(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      )
      callback(comments)
    },
    (error) => {
      console.error('Comments listener error:', error.code, error.message)
      callback([])
    }
  )
}

/**
 * Add a comment to an event and notify the event creator.
 * @param {{ eventId: string, userId: string, userName: string, text: string, creatorId: string, eventTitle: string }} data
 */
export async function addComment(data) {
  await addDoc(collection(db, COLLECTIONS.COMMENTS), {
    eventId: data.eventId,
    userId: data.userId,
    userName: data.userName,
    text: data.text,
    createdAt: serverTimestamp(),
  })

  if (data.creatorId !== data.userId) {
    try {
      await createNotification({
        userId: data.creatorId,
        title: 'New Comment',
        message: `${data.userName} commented on "${data.eventTitle}"`,
        type: 'comment',
        eventId: data.eventId,
      })
    } catch (error) {
      console.warn('Comment notification failed:', error)
    }
  }
}
