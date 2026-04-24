import { useSelector } from 'react-redux'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import AppShell from './layouts/AppShell.jsx'
import Toast from './components/ui/Toast.jsx'
import Auth from './pages/Auth.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Transactions from './pages/Transactions.jsx'
import Budgets from './pages/Budgets.jsx'
import Insights from './pages/Insights.jsx'
import Alerts from './pages/Alerts.jsx'
import Wallet from './pages/Wallet.jsx'
import Profile from './pages/Profile.jsx'
import { setUserProfile, clearUserProfile } from './store/slices/userSlice.js'
import { setAuthReady } from './store/slices/appSlice.js'
import { api } from './utils/api.js'

const PAGE_MAP = {
  dashboard:    Dashboard,
  transactions: Transactions,
  budgets:      Budgets,
  insights:     Insights,
  alerts:       Alerts,
  wallet:       Wallet,
  profile:      Profile,
}

export default function App() {
  const dispatch = useDispatch()
  const currentPage = useSelector(state => state.app.currentPage)
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated)
  const authReady = useSelector(state => state.app.authReady)

  // Initialize auth on mount
  useEffect(() => {
    const initializeAuth = async () => {
      if (!isAuthenticated) {
        dispatch(setAuthReady(true))
        return
      }

      try {
        const result = await api.users.getProfile()
        dispatch(setUserProfile(result.data?.user))
      } catch (error) {
        console.error('Failed to restore auth:', error)
        dispatch(clearUserProfile())
      } finally {
        dispatch(setAuthReady(true))
      }
    }

    initializeAuth()
  }, [dispatch, isAuthenticated])

  if (!authReady) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!isAuthenticated) {
    return (
      <>
        <Auth />
        <Toast />
      </>
    )
  }

  const Page = PAGE_MAP[currentPage] ?? Dashboard

  return (
    <>
      <AppShell>
        <div key={currentPage} className="page-enter">
          <Page />
        </div>
      </AppShell>
      <Toast />
    </>
  )
}
