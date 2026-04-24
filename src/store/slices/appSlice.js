import { createSlice } from "@reduxjs/toolkit";

const appSlice = createSlice({
  name: "app",
  initialState: {
    currentPage: "dashboard",
    toast: null,
    authReady: false,
    loading: false,
  },
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    showToast: (state, action) => {
      const { message, type = "success" } = action.payload;
      state.toast = {
        message,
        type,
        id: Date.now(),
      };
    },
    clearToast: (state) => {
      state.toast = null;
    },
    setAuthReady: (state, action) => {
      state.authReady = action.payload;
    },
    setAppLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setCurrentPage, showToast, clearToast, setAuthReady, setAppLoading } = appSlice.actions;
export default appSlice.reducer;
