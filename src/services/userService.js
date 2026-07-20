import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { COLLECTIONS } from '../utils/constants'
import { createNotification } from './notificationService'

/**
 * @param {import('../types').User[]} users
 * @returns {import('../types').User[]}
 */
function sortUsersByCreatedAt(users) {
  return [...users].sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() ?? a.createdAt?.seconds ?? 0
    const bTime = b.createdAt?.toMillis?.() ?? b.createdAt?.seconds ?? 0
    return bTime - aTime
  })
}

/**
 * Subscribe to a single user profile (real-time updates e.g. approval).
 * @param {string} userId
 * @param {(user: import('../types').User | null) => void} callback
 * @returns {() => void}
 */
export function subscribeToUserProfile(userId, callback) {
  return onSnapshot(
    doc(db, COLLECTIONS.USERS, userId),
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(null)
        return
      }
      callback({ id: snapshot.id, ...snapshot.data() })
    },
    (error) => {
      console.error('User profile listener error:', error.code, error.message)
      callback(null)
    }
  )
}

/**
 * Subscribe to all users (admin/host) — real-time, no composite index required.
 * @param {(users: import('../types').User[]) => void} callback
 * @returns {() => void}
 */
export function subscribeToUsers(callback) {
  return onSnapshot(
    collection(db, COLLECTIONS.USERS),
    (snapshot) => {
      callback(sortUsersByCreatedAt(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))))
    },
    (error) => {
      console.error('Users listener error:', error.code, error.message)
      callback([])
    }
  )
}

/**
 * Get all users once.
 * @returns {Promise<import('../types').User[]>}
 */
export async function getAllUsers() {
  const snapshot = await getDocs(collection(db, COLLECTIONS.USERS))
  return sortUsersByCreatedAt(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
}

/**
 * Approve a user account.
 * @param {string} userId
 * @param {string} userName
 */
export async function approveUser(userId, userName) {
  await updateDoc(doc(db, COLLECTIONS.USERS, userId), { approved: true })

  try {
    await createNotification({
      userId,
      title: 'Account Approved',
      message: `Welcome ${userName}! Your account has been approved. You can now access the application.`,
      type: 'approval',
    })
  } catch (error) {
    console.error('Approval notification failed:', error)
    throw new Error('User approved but notification failed to send')
  }
}

/**
 * Change user role.
 * @param {string} userId
 * @param {import('../types').UserRole} role
 */
export async function changeUserRole(userId, role) {
  await updateDoc(doc(db, COLLECTIONS.USERS, userId), { role })
}

/**
 * Disable or enable a user.
 * @param {string} userId
 * @param {boolean} disabled
 */
export async function toggleUserDisabled(userId, disabled) {
  await updateDoc(doc(db, COLLECTIONS.USERS, userId), { disabled })
}

/**
 * Update user profile fields.
 * @param {string} userId
 * @param {Partial<import('../types').User>} data
 */
export async function updateUserProfile(userId, data) {
  await updateDoc(doc(db, COLLECTIONS.USERS, userId), data)
}

/**
 * Save FCM token for push notifications.
 * @param {string} userId
 * @param {string} token
 */
export async function saveFCMToken(userId, token) {
  await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
    fcmToken: token,
    fcmTokenUpdatedAt: serverTimestamp(),
  })
}

/**
 * Get users by role.
 * @param {import('../types').UserRole} role
 * @returns {Promise<import('../types').User[]>}
 */
export async function getUsersByRole(role) {
  const q = query(collection(db, COLLECTIONS.USERS), where('role', '==', role))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}
