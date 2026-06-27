import { create } from 'zustand'

/**
 * @typedef {Object} AuthState
 * @property {import('../types').User | null} user
 * @property {boolean} loading
 * @property {boolean} initialized
 * @property {(user: import('../types').User | null) => void} setUser
 * @property {(loading: boolean) => void} setLoading
 * @property {(initialized: boolean) => void} setInitialized
 * @property {() => void} clearUser
 */

/** @type {import('zustand').UseBoundStore<import('zustand').StoreApi<AuthState>>} */
export const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  initialized: false,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),
  clearUser: () => set({ user: null, loading: false }),
}))
