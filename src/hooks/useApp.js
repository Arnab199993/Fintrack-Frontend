import { useDispatch, useSelector } from 'react-redux'
import { setCurrentPage, showToast, clearToast, setAuthReady } from '../store/slices/appSlice.js'
import { setUserProfile, updateUserProfile as updateUserProfileAction, clearUserProfile } from '../store/slices/userSlice.js'
import { clearAuth, setToken } from '../store/slices/authSlice.js'
import { api } from '../utils/api.js'
import SessionHelper from '../utils/SessionHelper.js'
import Swal from 'sweetalert2'

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

  const confirmAction = async ({
  title = 'Are you sure?',
  text = 'This action cannot be undone.',
  icon = 'warning',
  confirmButtonText = 'Yes',
  cancelButtonText = 'Cancel',
  confirmButtonColor = '#d33',
  cancelButtonColor = '#3085d6',
}) => {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor,
    cancelButtonColor,
  })

  return result.isConfirmed
}

  const logout = async () => {
    try {
      await api.auth.logout()
    } catch (_error) {
    }
    SessionHelper.ClearSession()
    dispatch(clearAuth())
    dispatch(clearUserProfile())
    dispatch(setCurrentPage('login'))
  }

  const setUserToken = (token) => {
    dispatch(setToken(token))
  }

  const setUser = (profileData) => {
    dispatch(setUserProfile(profileData))
  }

  const updateUserProfile = (profileData) => {
    dispatch(updateUserProfileAction(profileData))
  }

  const setAuthReadyState = (ready) => {
    dispatch(setAuthReady(ready))
  }

  return {
    page: currentPage,
    navigate,
    user,
    showToast: showToastMessage,
    logout,
    updateUserProfile,
    setUser,
    setUserToken,
    isAuthenticated,
    authReady,
    setAuthReady: setAuthReadyState,
    toast,
    confirmAction
  }
}

export default useApp
