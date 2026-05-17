import React, { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Auth from './pages/Auth/Auth'
import ProtectedRoute from './Protected/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Sidebar from './layouts/Sidebar'
import Wallet from './pages/Wallet'
import Toast from './components/ui/Toast.jsx'
import { api } from './utils/api.js'
import { setAuthReady } from './store/slices/appSlice.js'
import { setUserProfile, clearUserProfile } from './store/slices/userSlice.js'
import { clearAuth } from './store/slices/authSlice.js'
import Transactions from './pages/Transactions.jsx'
import Budgets from './pages/Budgets.jsx'
import Insights from './pages/Insights.jsx'
import Alerts from './pages/Alerts.jsx'
import Profile from './pages/Profile.jsx'

const App = () => {
  const dispatch = useDispatch()
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const authReady = useSelector((state) => state.app.authReady)

  useEffect(() => {
    const initializeAuth = async () => {
      if (!isAuthenticated) {
        dispatch(setAuthReady(true))
        return
      }

      try {
        const result = await api.users.getProfile()
        const userData = result.data?.user ?? result.user ?? result.data ?? result
        dispatch(setUserProfile(userData))
      } catch (error) {
        console.error('Failed to restore auth:', error)
        dispatch(clearAuth())
        dispatch(clearUserProfile())
      } finally {
        dispatch(setAuthReady(true))
      }
    }

    initializeAuth()
  }, [dispatch]) // Only run once on mount

  if (!authReady) {
    return <div className="flex items-center justify-center min-h-screen text-ink-500">Loading...</div>
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Auth />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Sidebar />}>
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/transactions' element={<Transactions />} />
            <Route path='/budgets' element={<Budgets />} />
            <Route path='/insights' element={<Insights />} />
            <Route path='/alerts' element={<Alerts />} />
            <Route path='/wallet' element={<Wallet />} />
            <Route path='/profile' element={<Profile />} />
          </Route>
        </Route>
      </Routes>
      <Toast />
    </BrowserRouter>
  )
}

export default App
