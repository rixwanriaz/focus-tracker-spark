// src/redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice";
import projectReducer from "./slice/projectSlice";
import organizationReducer from "./slice/organizationSlice";
import taskReducer from "./slice/taskSlice";
import timeReducer from "./slice/timeSlice";
import financeReducer from "./slice/financeSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    project: projectReducer,
    organization: organizationReducer,
    task: taskReducer,
    time: timeReducer,
    finance: financeReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
