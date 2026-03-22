import { createContext, useContext, useState } from 'react'
import { MOCK_USER } from '../utils/constants.js'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser]   = useState(MOCK_USER)
  const [page, setPage]   = useState('dashboard')
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() })
    setTimeout(() => setToast(null), 3500)
  }

  const navigate = (p) => setPage(p)

  return (
    <AppContext.Provider value={{ user, setUser, page, navigate, toast, showToast }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
