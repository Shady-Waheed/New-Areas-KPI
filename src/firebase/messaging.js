import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging'
import app from './config'

/**
 * Initialize Firebase Cloud Messaging if supported.
 * @returns {Promise<import('firebase/messaging').Messaging | null>}
 */
export async function initMessaging() {
  const supported = await isSupported()
  if (!supported) return null
  return getMessaging(app)
}

/**
 * Request notification permission and return FCM token.
 * @returns {Promise<string | null>}
 */
export async function requestFCMToken() {
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY
  if (!vapidKey) return null

  try {
    const messaging = await initMessaging()
    if (!messaging) return null

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return null

    const token = await getToken(messaging, { vapidKey })
    return token || null
  } catch {
    return null
  }
}

/**
 * Listen for foreground FCM messages.
 * @param {(payload: import('firebase/messaging').MessagePayload) => void} callback
 * @returns {Promise<(() => void) | null>}
 */
export async function onForegroundMessage(callback) {
  const messaging = await initMessaging()
  if (!messaging) return null
  return onMessage(messaging, callback)
}
