// src/redux/api/auth.ts
import { api } from "../../service/api";
import { API_CONFIG } from "../../config/api.config";

// Types for API requests and responses
export interface RegisterRequest {
  email: string;
  password: string;
  account_type: "team" | "individual";
  org_name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user?: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    organization_id?: string;
  };
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface LogoutRequest {
  refresh_token: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  new_password: string;
}

export interface EmailVerificationRequest {
  token: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  email_verified: boolean;
  is_superuser: boolean;
  organization_id?: string;
  preferred_locale?: string;
  profile_picture_url?: string;
}

export interface UpdateUserProfileRequest {
  full_name?: string;
  preferred_locale?: string;
  profile_picture_url?: string;
}

export interface UserPermissions {
  permissions: string[];
}

// Auth API service functions
export const authApiService = {
  // 1. Register
  register: async (credentials: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post(
      API_CONFIG.ENDPOINTS.AUTH.REGISTER,
      credentials
    );
    return response.data;
  },

  // 2. Login
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    return response.data;
  },

  // 3. Refresh Token
  refreshToken: async (body: RefreshTokenRequest): Promise<AuthResponse> => {
    const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH, body);
    return response.data;
  },

  // 4. Logout
  logout: async (body: LogoutRequest): Promise<void> => {
    await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, body);
  },

  // 5. Password Reset Request
  requestPasswordReset: async (body: PasswordResetRequest): Promise<void> => {
    await api.post(API_CONFIG.ENDPOINTS.AUTH.PASSWORD_RESET_REQUEST, body);
  },

  // 6. Password Reset Confirm
  confirmPasswordReset: async (
    body: PasswordResetConfirmRequest
  ): Promise<void> => {
    await api.post(API_CONFIG.ENDPOINTS.AUTH.PASSWORD_RESET_CONFIRM, body);
  },

  // 7. Email Verification
  verifyEmail: async (token: string): Promise<void> => {
    await api.get(`${API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL}?token=${token}`);
  },

  // 8. Get User Profile
  getUserProfile: async (): Promise<UserProfile> => {
    const response = await api.get(API_CONFIG.ENDPOINTS.USER.PROFILE);
    return response.data;
  },

  // 9. Update User Profile
  updateUserProfile: async (data: UpdateUserProfileRequest): Promise<UserProfile> => {
    const response = await api.patch(API_CONFIG.ENDPOINTS.USER.UPDATE, data);
    return response.data;
  },

  // 10. Get User Permissions
  getUserPermissions: async (): Promise<UserPermissions> => {
    const response = await api.get(API_CONFIG.ENDPOINTS.USER.PERMISSIONS);
    return response.data;
  },
};
