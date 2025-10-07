import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  organizationApiService,
  CreateOrganizationRequest,
  Organization,
} from "../api/organization";

// Organization state interface
interface OrganizationState {
  currentOrganization: Organization | null;
  organizations: Organization[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
}

// Initial state
const initialState: OrganizationState = {
  currentOrganization: null,
  organizations: [],
  loading: false,
  error: null,
  creating: false,
  updating: false,
  deleting: false,
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
