import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * @typedef {Object} ThemeState
 * @property {'light' | 'dark'} theme
 * @property {() => void} toggleTheme
 * @property {(theme: 'light' | 'dark') => void} setTheme
 */

/** @type {import('zustand').UseBoundStore<import('zustand').StoreApi<ThemeState>>} */
export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light',
      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light'
        set({ theme: next })
        applyTheme(next)
      },
      setTheme: (theme) => {
        set({ theme })
        applyTheme(theme)
      },
    }),
    {
      name: 'new-areas-kpi-theme',
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme)
      },
    }
  )
)

/**
 * @param {'light' | 'dark'} theme
 */
function applyTheme(theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}
