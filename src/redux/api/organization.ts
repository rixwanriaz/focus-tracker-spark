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
  user: {
    id: string;
    email: string;
    full_name?: string;
  };
  role: string;
}

export interface CreateOrganizationResponse {
  organization: Organization;
  message: string;
}

export interface GetOrganizationMembersResponse {
  members: OrganizationMember[];
  total: number;
}

// Invitation types
export interface OrganizationInvite {
  id: string;
  organization_id: string;
  invited_by_user_id: string;
  email: string;
  role: string;
  expires_at: string;
  created_at: string;
  accepted_at?: string;
  declined_at?: string;
  revoked_at?: string;
}

export interface CreateInviteRequest {
  email: string;
  role: string;
  ttl_hours?: number;
}

export interface CreateInviteResponse {
  invite: OrganizationInvite;
  message: string;
}

export interface AcceptInviteWithPasswordRequest {
  token: string;
  password: string;
}

export interface AcceptInviteWithPasswordResponse {
  user: any;
  membership: any;
  message: string;
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
  ): Promise<OrganizationMember[]> => {
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

  // Invitation management
  // Create invitation
  createInvite: async (
    orgId: string,
    data: CreateInviteRequest
  ): Promise<OrganizationInvite> => {
    const response = await organizationApi.post(
      `/organizations/${orgId}/invites`,
      data
    );
    return response.data;
  },

  // Get organization invitations
  getOrganizationInvites: async (
    orgId: string
  ): Promise<OrganizationInvite[]> => {
    const response = await organizationApi.get(
      `/organizations/${orgId}/invites`
    );
    return response.data;
  },

  // Revoke invitation
  revokeInvite: async (orgId: string, inviteId: string): Promise<void> => {
    await organizationApi.post(
      `/organizations/${orgId}/invites/${inviteId}/revoke`
    );
  },

  // Resend invitation
  resendInvite: async (
    orgId: string,
    inviteId: string,
    ttl_hours?: number
  ): Promise<OrganizationInvite> => {
    const response = await organizationApi.post(
      `/organizations/${orgId}/invites/${inviteId}/resend`
    );
    return response.data;
  },

  // Accept invitation with password (for new users)
  acceptInviteWithPassword: async (
    orgId: string,
    data: AcceptInviteWithPasswordRequest
  ): Promise<AcceptInviteWithPasswordResponse> => {
    const response = await organizationApi.post(
      `/organizations/${orgId}/invites/accept-with-password`,
      data
    );
    return response.data;
  },

  // Accept invitation (for existing users)
  acceptInvite: async (orgId: string, token: string): Promise<any> => {
    const response = await organizationApi.post(
      `/organizations/${orgId}/invites/accept`,
      { token }
    );
    return response.data;
  },

  // Decline invitation
  declineInvite: async (orgId: string, token: string): Promise<any> => {
    const response = await organizationApi.post(
      `/organizations/${orgId}/invites/decline`,
      { token }
    );
    return response.data;
  },
};
