// src/redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice";
import projectReducer from "./slice/projectSlice";
import organizationReducer from "./slice/organizationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    project: projectReducer,
    organization: organizationReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
