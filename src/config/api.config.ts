// src/config/api.config.ts

/**
 * API Configuration
 * Centralized configuration for all API-related settings
 */

export const API_CONFIG = {
  // Base URL for all API requests
  BASE_URL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://joeltimetracking-cahjhyguh4fcd0hn.canadacentral-01.azurewebsites.net/api/v1",
  // "https:localhost:8000/api/v1",

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
      PROFILE: "/users/me",
      UPDATE: "/users/me",
      PERMISSIONS: "/users/me/permissions",
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
    TASKS: {
      BASE: "/tasks",
      BY_ID: (id: string) => `/tasks/${id}`,
      BY_PROJECT: (projectId: string) => `/projects/${projectId}/tasks`,
      COMPLETE: (id: string) => `/tasks/${id}/complete`,
      REOPEN: (id: string) => `/tasks/${id}/reopen`,
    },
    ORGANIZATIONS: {
      BASE: "/organizations",
      BY_ID: (id: string) => `/organizations/${id}`,
      MEMBERS: (id: string) => `/organizations/${id}/members`,
    },
    TIME: {
      BASE: "/time",
      ENTRIES: "/time/entries",
      ENTRY_BY_ID: (id: string) => `/time/entries/${id}`,
      START_TIMER: "/time/timers/start",
      PAUSE_TIMER: "/time/timers/pause",
      RESUME_TIMER: "/time/timers/resume",
      STOP_TIMER: "/time/timers/stop",
      ACTIVE_TIMER: "/time/timers/active",
      APPLY_IDLE_TRIM: "/time/timers/apply-idle-trim",
      BULK_ADJUST: "/time/entries/bulk-adjust",
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
