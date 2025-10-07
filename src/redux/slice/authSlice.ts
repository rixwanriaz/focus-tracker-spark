// src/redux/slice/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authApiService } from "../api/auth";
import type { RegisterRequest, LoginRequest, AuthResponse } from "../api/auth";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  tokenType: string;
  expiresIn: number | null;
  loading: boolean;
  error: string | null;
  user?: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    organization_id?: string;
  };
}

const initialState: AuthState = {
  accessToken: localStorage.getItem("access_token"),
  refreshToken: localStorage.getItem("refresh_token"),
  isAuthenticated: !!localStorage.getItem("access_token"),
  tokenType: "bearer",
  expiresIn: null,
  loading: false,
  error: null,
};

// Helper function to extract error messages
const getErrorMessage = (err: any): string => {
  console.log("API Error Response:", err);

  let errorMessage = "Operation failed";

  // Handle RTK Query error structure
  if (err?.data?.detail) {
    if (typeof err.data.detail === "string") {
      errorMessage = err.data.detail;
    } else if (Array.isArray(err.data.detail)) {
      errorMessage = err.data.detail
        .map((e: any) => e.msg || e.message || e)
        .join(", ");
    }
  } else if (err?.data?.message) {
    errorMessage = err.data.message;
  } else if (err?.data?.error) {
    errorMessage = err.data.error;
  } else if (err?.message) {
    errorMessage = err.message;
  }

  // Handle specific HTTP status codes
  if (err?.status === 400) {
    if (errorMessage === "Operation failed") {
      errorMessage = "Invalid request. Please check your information.";
    }
  } else if (err?.status === 401) {
    if (errorMessage === "Operation failed") {
      errorMessage = "Invalid email or password.";
    }
  } else if (err?.status === 409) {
    if (errorMessage === "Operation failed") {
      errorMessage = "User already exists with this email.";
    }
  } else if (err?.status === 422) {
    if (errorMessage === "Operation failed") {
      errorMessage = "Validation failed. Please check your information.";
    }
  } else if (err?.status === 500) {
    if (errorMessage === "Operation failed") {
      errorMessage = "Server error. Please try again later.";
    }
  } else if (err?.status === "FETCH_ERROR") {
    errorMessage =
      "Cannot connect to server. Please check if the backend is running.";
  }

  return errorMessage.replace(/<[^>]*>/g, "").trim();
};

// Async Thunks using Axios
export const registerUser = createAsyncThunk<
  AuthResponse,
  RegisterRequest,
  { rejectValue: string }
>("auth/register", async (credentials, { rejectWithValue }) => {
  try {
    // Use Axios API service
    const result = await authApiService.register(credentials);
    return result;
  } catch (err: any) {
    const errorMessage = getErrorMessage(err);
    return rejectWithValue(errorMessage);
  }
});

export const loginUser = createAsyncThunk<
  AuthResponse,
  LoginRequest,
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const result = await authApiService.login(credentials);
    return result;
  } catch (err: any) {
    const errorMessage = getErrorMessage(err);
    return rejectWithValue(errorMessage);
  }
});

export const refreshAuthToken = createAsyncThunk<
  AuthResponse,
  string,
  { rejectValue: string }
>("auth/refresh", async (refreshToken, { rejectWithValue }) => {
  try {
    const result = await authApiService.refreshToken({
      refresh_token: refreshToken,
    });
    return result;
  } catch (err: any) {
    const errorMessage = getErrorMessage(err);
    return rejectWithValue(errorMessage);
  }
});

export const logoutUser = createAsyncThunk<
  void,
  string,
  { rejectValue: string }
>("auth/logout", async (refreshToken, { rejectWithValue }) => {
  try {
    await authApiService.logout({ refresh_token: refreshToken });
  } catch (err: any) {
    const errorMessage = getErrorMessage(err);
    return rejectWithValue(errorMessage);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.expiresIn = null;
      state.loading = false;
      state.error = null;

      // Clear from localStorage
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register User
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        registerUser.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.loading = false;
          state.accessToken = action.payload.access_token;
          state.refreshToken = action.payload.refresh_token;
          state.tokenType = action.payload.token_type;
          state.expiresIn = action.payload.expires_in;
          state.isAuthenticated = true;
          state.error = null;

          // Persist to localStorage
          localStorage.setItem("access_token", action.payload.access_token);
          localStorage.setItem("refresh_token", action.payload.refresh_token);
        }
      )
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Registration failed";
        state.isAuthenticated = false;
      })

      // Login User
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.loading = false;
          state.accessToken = action.payload.access_token;
          state.refreshToken = action.payload.refresh_token;
          state.tokenType = action.payload.token_type;
          state.expiresIn = action.payload.expires_in;
          state.isAuthenticated = true;
          state.error = null;

          // Persist to localStorage
          localStorage.setItem("access_token", action.payload.access_token);
          localStorage.setItem("refresh_token", action.payload.refresh_token);
        }
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
        state.isAuthenticated = false;
      })

      // Refresh Token
      .addCase(refreshAuthToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        refreshAuthToken.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.loading = false;
          state.accessToken = action.payload.access_token;
          state.refreshToken = action.payload.refresh_token;
          state.tokenType = action.payload.token_type;
          state.expiresIn = action.payload.expires_in;
          state.error = null;

          // Persist to localStorage
          localStorage.setItem("access_token", action.payload.access_token);
          localStorage.setItem("refresh_token", action.payload.refresh_token);
        }
      )
      .addCase(refreshAuthToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Token refresh failed";
        state.isAuthenticated = false;
        state.accessToken = null;
        state.refreshToken = null;

        // Clear from localStorage
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      })

      // Logout User
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.expiresIn = null;
        state.error = null;

        // Clear from localStorage
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Logout failed";

        // Still clear credentials even if logout fails
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.expiresIn = null;

        // Clear from localStorage
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
