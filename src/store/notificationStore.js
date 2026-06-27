import { create } from 'zustand'

/**
 * @typedef {Object} NotificationState
 * @property {import('../types').Notification[]} notifications
 * @property {boolean} panelOpen
 * @property {(notifications: import('../types').Notification[]) => void} setNotifications
 * @property {(open: boolean) => void} setPanelOpen
 * @property {() => void} togglePanel
 */

/** @type {import('zustand').UseBoundStore<import('zustand').StoreApi<NotificationState>>} */
export const useNotificationStore = create((set) => ({
  notifications: [],
  panelOpen: false,
  setNotifications: (notifications) => set({ notifications }),
  setPanelOpen: (panelOpen) => set({ panelOpen }),
  togglePanel: () => set((state) => ({ panelOpen: !state.panelOpen })),
}))
