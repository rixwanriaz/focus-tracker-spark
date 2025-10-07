// src/config/api.config.ts

/**
 * API Configuration
 * Centralized configuration for all API-related settings
 */

export const API_CONFIG = {
  // Base URL for all API requests
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1",

  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      REGISTER: "/auth/register",
      LOGIN: "/auth/login",
      LOGOUT: "/auth/logout",
      REFRESH: "/auth/refresh",
      VERIFY_EMAIL: "/auth/verify",
      PASSWORD_RESET_REQUEST: "/auth/password-reset/request",
      PASSWORD_RESET_CONFIRM: "/auth/password-reset/confirm",
    },
    USER: {
      PROFILE: "/user/profile",
      UPDATE: "/user/update",
    },
    PROJECTS: {
      BASE: "/projects",
      BY_ID: (id: string) => `/projects/${id}`,
      MEMBERS: (id: string) => `/projects/${id}/members`,
      MEMBER_BY_ID: (projectId: string, memberId: string) =>
        `/projects/${projectId}/members/${memberId}`,
      BUDGET: (id: string) => `/projects/${id}/budget`,
      BUDGET_ADJUST: (id: string) => `/projects/${id}/budget/adjust`,
      OVERVIEW: (id: string) => `/projects/${id}/overview`,
      GANTT: (id: string) => `/projects/${id}/gantt`,
    },
    ORGANIZATIONS: {
      BASE: "/organizations",
      BY_ID: (id: string) => `/organizations/${id}`,
      MEMBERS: (id: string) => `/organizations/${id}/members`,
    },
    // Add more endpoints as needed
  },

  // Timeout settings
  TIMEOUT: 30000, // 30 seconds
} as const;

/**
 * Helper function to build full URL
 */
export const buildUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
