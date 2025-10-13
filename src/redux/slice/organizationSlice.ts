import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  organizationApiService,
  CreateOrganizationRequest,
  Organization,
  OrganizationMember,
  OrganizationInvite,
  CreateInviteRequest,
  AcceptInviteWithPasswordRequest,
} from "../api/organization";

// Organization state interface
interface OrganizationState {
  currentOrganization: Organization | null;
  organizations: Organization[];
  members: OrganizationMember[];
  invitations: OrganizationInvite[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  loadingMembers: boolean;
  loadingInvitations: boolean;
  creatingInvite: boolean;
  revokingInvite: boolean;
  resendingInvite: boolean;
}

// Initial state
const initialState: OrganizationState = {
  currentOrganization: null,
  organizations: [],
  members: [],
  invitations: [],
  loading: false,
  error: null,
  creating: false,
  updating: false,
  deleting: false,
  loadingMembers: false,
  loadingInvitations: false,
  creatingInvite: false,
  revokingInvite: false,
  resendingInvite: false,
};

// Async thunks for organization operations
export const createOrganization = createAsyncThunk<
  Organization,
  CreateOrganizationRequest & { token?: string },
  { rejectValue: string }
>(
  "organization/create",
  async ({ token, ...organizationData }, { rejectWithValue }) => {
    try {
      const response = await organizationApiService.createOrganization(
        organizationData,
        token
      );
      return response.organization;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.detail ||
        error?.message ||
        "Failed to create organization";
      return rejectWithValue(errorMessage);
    }
  }
);

export const getOrganization = createAsyncThunk<
  Organization,
  string,
  { rejectValue: string }
>("organization/get", async (orgId, { rejectWithValue }) => {
  try {
    const organization = await organizationApiService.getOrganization(orgId);
    return organization;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to get organization";
    return rejectWithValue(errorMessage);
  }
});

export const updateOrganization = createAsyncThunk<
  Organization,
  { orgId: string; data: Partial<CreateOrganizationRequest> },
  { rejectValue: string }
>("organization/update", async ({ orgId, data }, { rejectWithValue }) => {
  try {
    const organization = await organizationApiService.updateOrganization(
      orgId,
      data
    );
    return organization;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to update organization";
    return rejectWithValue(errorMessage);
  }
});

export const deleteOrganization = createAsyncThunk<
  void,
  string,
  { rejectValue: string }
>("organization/delete", async (orgId, { rejectWithValue }) => {
  try {
    await organizationApiService.deleteOrganization(orgId);
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to delete organization";
    return rejectWithValue(errorMessage);
  }
});

export const getOrganizationMembers = createAsyncThunk<
  OrganizationMember[],
  string,
  { rejectValue: string }
>("organization/getMembers", async (orgId, { rejectWithValue }) => {
  try {
    const members = await organizationApiService.getOrganizationMembers(orgId);
    return members;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to get organization members";
    return rejectWithValue(errorMessage);
  }
});

// Invitation async thunks
export const createInvite = createAsyncThunk<
  OrganizationInvite,
  { orgId: string; data: CreateInviteRequest },
  { rejectValue: string }
>("organization/createInvite", async ({ orgId, data }, { rejectWithValue }) => {
  try {
    const response = await organizationApiService.createInvite(orgId, data);
    // Backend returns the invitation directly, not wrapped in an object
    return response;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to create invitation";
    return rejectWithValue(errorMessage);
  }
});

export const getOrganizationInvites = createAsyncThunk<
  OrganizationInvite[],
  string,
  { rejectValue: string }
>("organization/getInvites", async (orgId, { rejectWithValue }) => {
  try {
    const invitations = await organizationApiService.getOrganizationInvites(
      orgId
    );
    return invitations;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to get organization invitations";
    return rejectWithValue(errorMessage);
  }
});

export const revokeInvite = createAsyncThunk<
  string,
  { orgId: string; inviteId: string },
  { rejectValue: string }
>(
  "organization/revokeInvite",
  async ({ orgId, inviteId }, { rejectWithValue }) => {
    try {
      await organizationApiService.revokeInvite(orgId, inviteId);
      return inviteId;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.detail ||
        error?.message ||
        "Failed to revoke invitation";
      return rejectWithValue(errorMessage);
    }
  }
);

export const resendInvite = createAsyncThunk<
  OrganizationInvite,
  { orgId: string; inviteId: string; ttl_hours?: number },
  { rejectValue: string }
>(
  "organization/resendInvite",
  async ({ orgId, inviteId, ttl_hours }, { rejectWithValue }) => {
    try {
      const response = await organizationApiService.resendInvite(
        orgId,
        inviteId,
        ttl_hours
      );
      return response;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.detail ||
        error?.message ||
        "Failed to resend invitation";
      return rejectWithValue(errorMessage);
    }
  }
);

// Organization slice
const organizationSlice = createSlice({
  name: "organization",
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    // Set current organization
    setCurrentOrganization: (state, action: PayloadAction<Organization>) => {
      state.currentOrganization = action.payload;
    },
    // Clear current organization
    clearCurrentOrganization: (state) => {
      state.currentOrganization = null;
    },
    // Clear all organization data
    clearOrganizationData: (state) => {
      state.currentOrganization = null;
      state.organizations = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Organization
      .addCase(createOrganization.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(
        createOrganization.fulfilled,
        (state, action: PayloadAction<Organization>) => {
          state.creating = false;
          state.currentOrganization = action.payload;
          state.error = null;
          // Add to organizations list if not already present
          const exists = state.organizations.find(
            (org) => org.slug === action.payload.slug
          );
          if (!exists) {
            state.organizations.push(action.payload);
          }
        }
      )
      .addCase(createOrganization.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload || "Failed to create organization";
      })

      // Get Organization
      .addCase(getOrganization.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getOrganization.fulfilled,
        (state, action: PayloadAction<Organization>) => {
          state.loading = false;
          state.currentOrganization = action.payload;
          state.error = null;
        }
      )
      .addCase(getOrganization.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to get organization";
      })

      // Update Organization
      .addCase(updateOrganization.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(
        updateOrganization.fulfilled,
        (state, action: PayloadAction<Organization>) => {
          state.updating = false;
          state.currentOrganization = action.payload;
          state.error = null;
          // Update in organizations list
          const index = state.organizations.findIndex(
            (org) => org.slug === action.payload.slug
          );
          if (index !== -1) {
            state.organizations[index] = action.payload;
          }
        }
      )
      .addCase(updateOrganization.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload || "Failed to update organization";
      })

      // Delete Organization
      .addCase(deleteOrganization.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteOrganization.fulfilled, (state, action) => {
        state.deleting = false;
        state.currentOrganization = null;
        state.error = null;
        // Remove from organizations list
        state.organizations = state.organizations.filter(
          (org) => org.slug !== action.meta.arg
        );
      })
      .addCase(deleteOrganization.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload || "Failed to delete organization";
      })

      // Get Organization Members
      .addCase(getOrganizationMembers.pending, (state) => {
        state.loadingMembers = true;
        state.error = null;
      })
      .addCase(
        getOrganizationMembers.fulfilled,
        (state, action: PayloadAction<OrganizationMember[]>) => {
          state.loadingMembers = false;
          state.members = action.payload;
          state.error = null;
        }
      )
      .addCase(getOrganizationMembers.rejected, (state, action) => {
        state.loadingMembers = false;
        state.error = action.payload || "Failed to get organization members";
      })

      // Create Invite
      .addCase(createInvite.pending, (state) => {
        state.creatingInvite = true;
        state.error = null;
      })
      .addCase(
        createInvite.fulfilled,
        (state, action: PayloadAction<OrganizationInvite>) => {
          state.creatingInvite = false;
          state.invitations.unshift(action.payload);
          state.error = null;
        }
      )
      .addCase(createInvite.rejected, (state, action) => {
        state.creatingInvite = false;
        state.error = action.payload || "Failed to create invitation";
      })

      // Get Organization Invites
      .addCase(getOrganizationInvites.pending, (state) => {
        state.loadingInvitations = true;
        state.error = null;
      })
      .addCase(
        getOrganizationInvites.fulfilled,
        (state, action: PayloadAction<OrganizationInvite[]>) => {
          state.loadingInvitations = false;
          state.invitations = action.payload;
          state.error = null;
        }
      )
      .addCase(getOrganizationInvites.rejected, (state, action) => {
        state.loadingInvitations = false;
        state.error =
          action.payload || "Failed to get organization invitations";
      })

      // Revoke Invite
      .addCase(revokeInvite.pending, (state) => {
        state.revokingInvite = true;
        state.error = null;
      })
      .addCase(
        revokeInvite.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.revokingInvite = false;
          state.invitations = state.invitations.filter(
            (invite) => invite.id !== action.payload
          );
          state.error = null;
        }
      )
      .addCase(revokeInvite.rejected, (state, action) => {
        state.revokingInvite = false;
        state.error = action.payload || "Failed to revoke invitation";
      })

      // Resend Invite
      .addCase(resendInvite.pending, (state) => {
        state.resendingInvite = true;
        state.error = null;
      })
      .addCase(
        resendInvite.fulfilled,
        (state, action: PayloadAction<OrganizationInvite>) => {
          state.resendingInvite = false;
          const index = state.invitations.findIndex(
            (invite) => invite.id === action.payload.id
          );
          if (index !== -1) {
            state.invitations[index] = action.payload;
          }
          state.error = null;
        }
      )
      .addCase(resendInvite.rejected, (state, action) => {
        state.resendingInvite = false;
        state.error = action.payload || "Failed to resend invitation";
      });
  },
});

// Export actions
export const {
  clearError,
  setCurrentOrganization,
  clearCurrentOrganization,
  clearOrganizationData,
} = organizationSlice.actions;

// Export reducer
export default organizationSlice.reducer;
