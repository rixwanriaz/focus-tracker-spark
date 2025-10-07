import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  projectApiService,
  CreateProjectRequest,
  UpdateProjectRequest,
  Project,
  ProjectMember,
  AddMemberRequest,
  ProjectBudget,
  AdjustBudgetRequest,
  ProjectOverview,
  GanttChartData,
} from "../api/project";

// Project state interface
interface ProjectState {
  currentProject: Project | null;
  projects: Project[];
  projectMembers: ProjectMember[];
  projectBudget: ProjectBudget | null;
  projectOverview: ProjectOverview | null;
  ganttChartData: GanttChartData | null;
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  loadingMembers: boolean;
  loadingBudget: boolean;
  loadingOverview: boolean;
  loadingGantt: boolean;
  currentView: "list" | "detail" | "members" | "budget" | "overview" | "gantt";
  filters: {
    status?: string;
    client_id?: string;
    project_manager_id?: string;
  };
}

// Initial state
const initialState: ProjectState = {
  currentProject: null,
  projects: [],
  projectMembers: [],
  projectBudget: null,
  projectOverview: null,
  ganttChartData: null,
  loading: false,
  error: null,
  creating: false,
  updating: false,
  deleting: false,
  loadingMembers: false,
  loadingBudget: false,
  loadingOverview: false,
  loadingGantt: false,
  currentView: "list",
  filters: {},
};

// Async thunks for project operations
export const createProject = createAsyncThunk<
  Project,
  CreateProjectRequest,
  { rejectValue: string }
>("project/create", async (projectData, { rejectWithValue }) => {
  try {
    const project = await projectApiService.createProject(projectData);
    return project;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to create project";
    return rejectWithValue(errorMessage);
  }
});

export const getProjects = createAsyncThunk<
  Project[],
  void,
  { rejectValue: string }
>("project/getAll", async (_, { rejectWithValue }) => {
  try {
    const projects = await projectApiService.getProjects();
    return projects;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to get projects";
    return rejectWithValue(errorMessage);
  }
});

export const getProjectById = createAsyncThunk<
  Project,
  string,
  { rejectValue: string }
>("project/getById", async (projectId, { rejectWithValue }) => {
  try {
    const project = await projectApiService.getProjectById(projectId);
    return project;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to get project";
    return rejectWithValue(errorMessage);
  }
});

export const updateProject = createAsyncThunk<
  Project,
  { projectId: string; data: UpdateProjectRequest },
  { rejectValue: string }
>("project/update", async ({ projectId, data }, { rejectWithValue }) => {
  try {
    const project = await projectApiService.updateProject(projectId, data);
    return project;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to update project";
    return rejectWithValue(errorMessage);
  }
});

export const deleteProject = createAsyncThunk<
  void,
  string,
  { rejectValue: string }
>("project/delete", async (projectId, { rejectWithValue }) => {
  try {
    await projectApiService.deleteProject(projectId);
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to delete project";
    return rejectWithValue(errorMessage);
  }
});

// Project members async thunks
export const addProjectMember = createAsyncThunk<
  ProjectMember,
  { projectId: string; data: AddMemberRequest },
  { rejectValue: string }
>("project/addMember", async ({ projectId, data }, { rejectWithValue }) => {
  try {
    const member = await projectApiService.addProjectMember(projectId, data);
    return member;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to add project member";
    return rejectWithValue(errorMessage);
  }
});

export const getProjectMembers = createAsyncThunk<
  ProjectMember[],
  string,
  { rejectValue: string }
>("project/getMembers", async (projectId, { rejectWithValue }) => {
  try {
    const members = await projectApiService.getProjectMembers(projectId);
    return members;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to get project members";
    return rejectWithValue(errorMessage);
  }
});

export const removeProjectMember = createAsyncThunk<
  void,
  { projectId: string; memberId: string },
  { rejectValue: string }
>(
  "project/removeMember",
  async ({ projectId, memberId }, { rejectWithValue }) => {
    try {
      await projectApiService.removeProjectMember(projectId, memberId);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.detail ||
        error?.message ||
        "Failed to remove project member";
      return rejectWithValue(errorMessage);
    }
  }
);

// Project budget async thunks
export const getProjectBudget = createAsyncThunk<
  ProjectBudget,
  string,
  { rejectValue: string }
>("project/getBudget", async (projectId, { rejectWithValue }) => {
  try {
    const budget = await projectApiService.getProjectBudget(projectId);
    return budget;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to get project budget";
    return rejectWithValue(errorMessage);
  }
});

export const adjustProjectBudget = createAsyncThunk<
  ProjectBudget,
  { projectId: string; data: AdjustBudgetRequest },
  { rejectValue: string }
>("project/adjustBudget", async ({ projectId, data }, { rejectWithValue }) => {
  try {
    const budget = await projectApiService.adjustProjectBudget(projectId, data);
    return budget;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to adjust project budget";
    return rejectWithValue(errorMessage);
  }
});

// Project overview async thunk
export const getProjectOverview = createAsyncThunk<
  ProjectOverview,
  string,
  { rejectValue: string }
>("project/getOverview", async (projectId, { rejectWithValue }) => {
  try {
    const overview = await projectApiService.getProjectOverview(projectId);
    return overview;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to get project overview";
    return rejectWithValue(errorMessage);
  }
});

// Gantt chart async thunk
export const getGanttChart = createAsyncThunk<
  GanttChartData,
  string,
  { rejectValue: string }
>("project/getGanttChart", async (projectId, { rejectWithValue }) => {
  try {
    const ganttData = await projectApiService.getGanttChart(projectId);
    return ganttData;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to get Gantt chart data";
    return rejectWithValue(errorMessage);
  }
});

// Project slice
const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    // Set current project
    setCurrentProject: (state, action: PayloadAction<Project>) => {
      state.currentProject = action.payload;
    },
    // Clear current project
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
    // Clear all project data
    clearProjectData: (state) => {
      state.currentProject = null;
      state.projects = [];
      state.projectMembers = [];
      state.projectBudget = null;
      state.projectOverview = null;
      state.ganttChartData = null;
      state.error = null;
    },
    // Set current view
    setCurrentView: (
      state,
      action: PayloadAction<ProjectState["currentView"]>
    ) => {
      state.currentView = action.payload;
    },
    // Set filters
    setFilters: (
      state,
      action: PayloadAction<Partial<ProjectState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    // Clear filters
    clearFilters: (state) => {
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Project
      .addCase(createProject.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(
        createProject.fulfilled,
        (state, action: PayloadAction<Project>) => {
          state.creating = false;
          state.currentProject = action.payload;
          state.error = null;
          // Add to projects list if not already present
          const exists = state.projects.find(
            (project) => project.id === action.payload.id
          );
          if (!exists) {
            state.projects.push(action.payload);
          }
        }
      )
      .addCase(createProject.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload || "Failed to create project";
      })

      // Get All Projects
      .addCase(getProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getProjects.fulfilled,
        (state, action: PayloadAction<Project[]>) => {
          state.loading = false;
          state.projects = action.payload;
          state.error = null;
        }
      )
      .addCase(getProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to get projects";
      })

      // Get Project by ID
      .addCase(getProjectById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getProjectById.fulfilled,
        (state, action: PayloadAction<Project>) => {
          state.loading = false;
          state.currentProject = action.payload;
          state.error = null;
        }
      )
      .addCase(getProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to get project";
      })

      // Update Project
      .addCase(updateProject.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(
        updateProject.fulfilled,
        (state, action: PayloadAction<Project>) => {
          state.updating = false;
          state.currentProject = action.payload;
          state.error = null;
          // Update in projects list
          const index = state.projects.findIndex(
            (project) => project.id === action.payload.id
          );
          if (index !== -1) {
            state.projects[index] = action.payload;
          }
        }
      )
      .addCase(updateProject.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload || "Failed to update project";
      })

      // Delete Project
      .addCase(deleteProject.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.deleting = false;
        state.currentProject = null;
        state.error = null;
        // Remove from projects list
        state.projects = state.projects.filter(
          (project) => project.id !== action.meta.arg
        );
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload || "Failed to delete project";
      })

      // Add Project Member
      .addCase(addProjectMember.pending, (state) => {
        state.loadingMembers = true;
        state.error = null;
      })
      .addCase(
        addProjectMember.fulfilled,
        (state, action: PayloadAction<ProjectMember>) => {
          state.loadingMembers = false;
          state.projectMembers.push(action.payload);
          state.error = null;
        }
      )
      .addCase(addProjectMember.rejected, (state, action) => {
        state.loadingMembers = false;
        state.error = action.payload || "Failed to add project member";
      })

      // Get Project Members
      .addCase(getProjectMembers.pending, (state) => {
        state.loadingMembers = true;
        state.error = null;
      })
      .addCase(
        getProjectMembers.fulfilled,
        (state, action: PayloadAction<ProjectMember[]>) => {
          state.loadingMembers = false;
          state.projectMembers = action.payload;
          state.error = null;
        }
      )
      .addCase(getProjectMembers.rejected, (state, action) => {
        state.loadingMembers = false;
        state.error = action.payload || "Failed to get project members";
      })

      // Remove Project Member
      .addCase(removeProjectMember.pending, (state) => {
        state.loadingMembers = true;
        state.error = null;
      })
      .addCase(removeProjectMember.fulfilled, (state, action) => {
        state.loadingMembers = false;
        state.projectMembers = state.projectMembers.filter(
          (member) => member.id !== action.meta.arg.memberId
        );
        state.error = null;
      })
      .addCase(removeProjectMember.rejected, (state, action) => {
        state.loadingMembers = false;
        state.error = action.payload || "Failed to remove project member";
      })

      // Get Project Budget
      .addCase(getProjectBudget.pending, (state) => {
        state.loadingBudget = true;
        state.error = null;
      })
      .addCase(
        getProjectBudget.fulfilled,
        (state, action: PayloadAction<ProjectBudget>) => {
          state.loadingBudget = false;
          state.projectBudget = action.payload;
          state.error = null;
        }
      )
      .addCase(getProjectBudget.rejected, (state, action) => {
        state.loadingBudget = false;
        state.error = action.payload || "Failed to get project budget";
      })

      // Adjust Project Budget
      .addCase(adjustProjectBudget.pending, (state) => {
        state.loadingBudget = true;
        state.error = null;
      })
      .addCase(
        adjustProjectBudget.fulfilled,
        (state, action: PayloadAction<ProjectBudget>) => {
          state.loadingBudget = false;
          state.projectBudget = action.payload;
          state.error = null;
        }
      )
      .addCase(adjustProjectBudget.rejected, (state, action) => {
        state.loadingBudget = false;
        state.error = action.payload || "Failed to adjust project budget";
      })

      // Get Project Overview
      .addCase(getProjectOverview.pending, (state) => {
        state.loadingOverview = true;
        state.error = null;
      })
      .addCase(
        getProjectOverview.fulfilled,
        (state, action: PayloadAction<ProjectOverview>) => {
          state.loadingOverview = false;
          state.projectOverview = action.payload;
          state.error = null;
        }
      )
      .addCase(getProjectOverview.rejected, (state, action) => {
        state.loadingOverview = false;
        state.error = action.payload || "Failed to get project overview";
      })

      // Get Gantt Chart
      .addCase(getGanttChart.pending, (state) => {
        state.loadingGantt = true;
        state.error = null;
      })
      .addCase(
        getGanttChart.fulfilled,
        (state, action: PayloadAction<GanttChartData>) => {
          state.loadingGantt = false;
          state.ganttChartData = action.payload;
          state.error = null;
        }
      )
      .addCase(getGanttChart.rejected, (state, action) => {
        state.loadingGantt = false;
        state.error = action.payload || "Failed to get Gantt chart data";
      });
  },
});

// Export actions
export const {
  clearError,
  setCurrentProject,
  clearCurrentProject,
  clearProjectData,
  setCurrentView,
  setFilters,
  clearFilters,
} = projectSlice.actions;

// Export reducer
export default projectSlice.reducer;
