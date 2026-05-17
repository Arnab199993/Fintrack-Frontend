import { createSlice } from '@reduxjs/toolkit'
import SessionHelper from '../../utils/SessionHelper.js'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: SessionHelper.GetCustomer(),
    isAuthenticated: SessionHelper.IsAuthenticated(),
    loading: false,
    error: null,
  },
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload
      state.isAuthenticated = !!action.payload
      SessionHelper.SetCustomer(action.payload)
    },
    clearAuth: (state) => {
      state.token = null
      state.isAuthenticated = false
      state.error = null
      SessionHelper.ClearSession()
    },
    setAuthLoading: (state, action) => {
      state.loading = action.payload
    },
    setAuthError: (state, action) => {
      state.error = action.payload
    },
  },
})

export const { setToken, clearAuth, setAuthLoading, setAuthError } = authSlice.actions
export default authSlice.reducer
