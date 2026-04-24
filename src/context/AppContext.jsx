import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../utils/api.js'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [page, setPage]   = useState('dashboard')
  const [toast, setToast] = useState(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    const restoreAuth = async () => {
      const authToken = typeof window !== 'undefined' && window.localStorage?.getItem('authToken')
      if (!authToken) {
        setAuthReady(true)
        return
      }

      try {
        const result = await api.users.getProfile()
        setUser(result.data?.user ?? result.user ?? result.data ?? result)
      } catch (error) {
        window.localStorage?.removeItem('authToken')
        window.localStorage?.removeItem('fintrackLoggedIn')
      } finally {
        setAuthReady(true)
      }
    }

    restoreAuth()
  }, [])

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() })
    setTimeout(() => setToast(null), 3500)
  }

  const navigate = (p) => setPage(p)

  const logout = async () => {
    try {
      await api.auth.logout()
    } catch (_error) {
      // ignore logout errors
    }
    window.localStorage?.removeItem('authToken')
    window.localStorage?.removeItem('fintrackLoggedIn')
    setUser(null)
    setPage('login')
  }

  return (
    <AppContext.Provider value={{ user, setUser, page, navigate, toast, showToast, authReady, logout }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
