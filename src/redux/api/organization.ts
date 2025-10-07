import axios from "axios";
import { API_CONFIG } from "@/config/api.config";
import { store } from "../store";

// Types for organization API
export interface Organization {
  name: string;
  slug: string;
  account_type: "team" | "individual";
  created_at: string;
  updated_at: string;
}

export interface CreateOrganizationRequest {
  name: string;
  slug: string;
  account_type: "team";
}

export interface OrganizationMember {
  id: string;
  user_id: string;
  organization_id: string;
  role: string;
  joined_at: string;
  user: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

export interface CreateOrganizationResponse {
  organization: Organization;
  message: string;
}

export interface GetOrganizationMembersResponse {
  members: OrganizationMember[];
  total: number;
}

// Create axios instance with base configuration
const organizationApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
organizationApi.interceptors.request.use(
  (config) => {
    // Get token from Redux state instead of localStorage
    const state = store.getState();
    const token = state.auth?.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Organization API functions
export const organizationApiService = {
  // Create organization
  createOrganization: async (
    data: CreateOrganizationRequest,
    token?: string
  ): Promise<CreateOrganizationResponse> => {
    // Use provided token or fall back to Redux state
    const authToken = token || store.getState().auth?.accessToken;

    if (!authToken) {
      throw new Error("No authentication token available");
    }

    const response = await axios.post(
      `${API_CONFIG.BASE_URL}/organizations`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    return response.data;
  },

  // Get organization by ID
  getOrganization: async (orgId: string): Promise<Organization> => {
    const response = await organizationApi.get(`/organizations/${orgId}`);
    return response.data;
  },

  // Get organization members
  getOrganizationMembers: async (
    orgId: string
  ): Promise<GetOrganizationMembersResponse> => {
    const response = await organizationApi.get(
      `/organizations/${orgId}/members`
    );
    return response.data;
  },

  // Update organization
  updateOrganization: async (
    orgId: string,
    data: Partial<CreateOrganizationRequest>
  ): Promise<Organization> => {
    const response = await organizationApi.put(`/organizations/${orgId}`, data);
    return response.data;
  },

  // Delete organization
  deleteOrganization: async (orgId: string): Promise<void> => {
    await organizationApi.delete(`/organizations/${orgId}`);
  },
};
