import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

const ProtectedRoute = () => {
  const authReady = useSelector(state => state.app.authReady)
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated)

  if (!authReady) {
    return <div className="flex items-center justify-center min-h-screen text-ink-500">Loading...</div>
  }

  return isAuthenticated ? <Outlet /> : <Navigate to='/' replace />
}

export default ProtectedRoute
