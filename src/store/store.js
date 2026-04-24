import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import userReducer from "./slices/userSlice.js";
import appReducer from "./slices/appSlice.js";

const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    app: appReducer,
  },
});

export default store;
