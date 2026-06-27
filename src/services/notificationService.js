import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { COLLECTIONS } from '../utils/constants'

/**
 * @param {import('../types').Notification[]} notifications
 * @returns {import('../types').Notification[]}
 */
function sortNotifications(notifications) {
  return [...notifications].sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() ?? a.createdAt?.seconds ?? 0
    const bTime = b.createdAt?.toMillis?.() ?? b.createdAt?.seconds ?? 0
    return bTime - aTime
  })
}

/**
 * Create a notification.
 * @param {{ userId: string, title: string, message: string }} data
 */
export async function createNotification(data) {
  if (!data.userId) throw new Error('Notification userId is required')

  await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
    userId: data.userId,
    title: data.title,
    message: data.message,
    read: false,
    createdAt: serverTimestamp(),
  })
}

/**
 * Notify multiple users.
 * @param {string[]} userIds
 * @param {{ title: string, message: string }} notification
 */
export async function notifyUsers(userIds, notification) {
  const uniqueIds = [...new Set(userIds)].filter(Boolean)
  const results = await Promise.allSettled(
    uniqueIds.map((userId) => createNotification({ userId, ...notification }))
  )

  const failed = results.filter((r) => r.status === 'rejected')
  if (failed.length) {
    console.error('Some notifications failed:', failed)
    throw failed[0].reason
  }
}

/**
 * Subscribe to user notifications (no composite index required).
 * @param {string} userId
 * @param {(notifications: import('../types').Notification[]) => void} callback
 * @returns {() => void}
 */
export function subscribeToNotifications(userId, callback) {
  const q = query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    where('userId', '==', userId)
  )

  return onSnapshot(
    q,
    (snapshot) => {
      const notifications = sortNotifications(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      )
      callback(notifications)
    },
    (error) => {
      console.error('Notifications listener error:', error.code, error.message)
      callback([])
    }
  )
}

/**
 * Mark notification as read.
 * @param {string} notificationId
 */
export async function markNotificationRead(notificationId) {
  await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notificationId), { read: true })
}

/**
 * Mark all notifications as read for a user.
 * @param {string} userId
 */
export async function markAllNotificationsRead(userId) {
  const q = query(
    collection(db, COLLECTIONS.NOTIFICATIONS),
    where('userId', '==', userId)
  )
  const snapshot = await getDocs(q)
  const unread = snapshot.docs.filter((d) => !d.data().read)
  if (!unread.length) return

  const batch = writeBatch(db)
  unread.forEach((d) => batch.update(d.ref, { read: true }))
  await batch.commit()
}
