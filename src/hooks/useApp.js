import { useDispatch, useSelector } from 'react-redux'
import { setCurrentPage, showToast, clearToast } from '../store/slices/appSlice.js'
import { setUserProfile, clearUserProfile, updateUserProfile } from '../store/slices/userSlice.js'
import { clearAuth, setToken } from '../store/slices/authSlice.js'
import { api } from '../utils/api.js'
import SessionHelper from '../utils/SessionHelper.js'

export function useApp() {
  const dispatch = useDispatch()
  const currentPage = useSelector(state => state.app.currentPage)
  const toast = useSelector(state => state.app.toast)
  const user = useSelector(state => state.user.profile)
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated)
  const authReady = useSelector(state => state.app.authReady)

  const navigate = (page) => {
    dispatch(setCurrentPage(page))
  }

  const showToastMessage = (message, type = 'success') => {
    dispatch(showToast({ message, type }))
    setTimeout(() => {
      dispatch(clearToast())
    }, 3500)
  }

  const logout = async () => {
    try {
      await api.auth.logout()
    } catch (_error) {
      // ignore logout errors
    }
    SessionHelper.ClearSession()
    dispatch(clearAuth())
    dispatch(clearUserProfile())
    dispatch(setCurrentPage('login'))
  }

  const setUserToken = (token) => {
    dispatch(setToken(token))
  }

  const setUser = (updater) => {
    if (typeof updater === 'function') {
      const updated = updater(user)
      dispatch(setUserProfile(updated))
    } else {
      dispatch(setUserProfile(updater))
    }
  }

  const setUserProfile = (profileData) => {
    dispatch(updateUserProfile(profileData))
  }

  return {
    page: currentPage,
    navigate,
    user,
    showToast: showToastMessage,
    logout,
    updateUserProfile: setUserProfile,
    setUser,
    setUserToken,
    isAuthenticated,
    authReady,
    toast,
  }
}

export default useApp
