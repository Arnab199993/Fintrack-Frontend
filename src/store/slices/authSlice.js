import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: typeof window !== "undefined" ? window.localStorage?.getItem("authToken") || null : null,
    isAuthenticated: typeof window !== "undefined" ? !!window.localStorage?.getItem("authToken") : false,
    loading: false,
    error: null,
  },
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = !!action.payload;
      if (typeof window !== "undefined") {
        if (action.payload) {
          window.localStorage?.setItem("authToken", action.payload);
        } else {
          window.localStorage?.removeItem("authToken");
        }
      }
    },
    clearAuth: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      if (typeof window !== "undefined") {
        window.localStorage?.removeItem("authToken");
        window.localStorage?.removeItem("fintrackLoggedIn");
      }
    },
    setAuthLoading: (state, action) => {
      state.loading = action.payload;
    },
    setAuthError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setToken, clearAuth, setAuthLoading, setAuthError } = authSlice.actions;
export default authSlice.reducer;
