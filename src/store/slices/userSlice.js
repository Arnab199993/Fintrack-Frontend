import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    profile: null,
    loading: false,
    error: null,
  },
  reducers: {
    setUserProfile: (state, action) => {
      state.profile = action.payload;
    },
    updateUserProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    setUserLoading: (state, action) => {
      state.loading = action.payload;
    },
    setUserError: (state, action) => {
      state.error = action.payload;
    },
    clearUserProfile: (state) => {
      state.profile = null;
      state.error = null;
    },
  },
});

export const { setUserProfile, updateUserProfile, setUserLoading, setUserError, clearUserProfile } = userSlice.actions;
export default userSlice.reducer;
