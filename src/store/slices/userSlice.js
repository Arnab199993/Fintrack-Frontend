import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const initializeAuth = createAsyncThunk(
  "user/initializeAuth",
  async (_, { rejectWithValue }) => {
    try {
      const result = await api.users.getProfile()
      return result.data?.user ?? result.user ?? result.data ?? result
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

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
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.loading = false;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.profile = null;
        state.loading = false;
      });
  },
});

export const { setUserProfile, updateUserProfile, setUserLoading, setUserError, clearUserProfile } = userSlice.actions;
export default userSlice.reducer;
