import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  taskApiService,
  CreateTaskRequest,
  UpdateTaskRequest,
  Task,
  TaskFilters,
  TaskStatus,
  TaskPriority,
} from "../api/project";

// Task state interface
interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  projectTasks: { [projectId: string]: Task[] };
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  filters: TaskFilters;
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

// Initial state
const initialState: TaskState = {
  tasks: [],
  currentTask: null,
  projectTasks: {},
  loading: false,
  error: null,
  creating: false,
  updating: false,
  deleting: false,
  filters: {},
  pagination: {
    total: 0,
    limit: 100,
    offset: 0,
  },
};

// Async thunks for task operations
export const createTask = createAsyncThunk<
  Task,
  { projectId: string; data: CreateTaskRequest },
  { rejectValue: string }
>("task/create", async ({ projectId, data }, { rejectWithValue }) => {
  try {
    const task = await taskApiService.createTask(projectId, data);
    return task;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to create task";
    return rejectWithValue(errorMessage);
  }
});

export const getTask = createAsyncThunk<
  Task,
  string,
  { rejectValue: string }
>("task/getById", async (taskId, { rejectWithValue }) => {
  try {
    const task = await taskApiService.getTask(taskId);
    return task;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to get task";
    return rejectWithValue(errorMessage);
  }
});

export const updateTask = createAsyncThunk<
  Task,
  { taskId: string; data: UpdateTaskRequest },
  { rejectValue: string }
>("task/update", async ({ taskId, data }, { rejectWithValue }) => {
  try {
    const task = await taskApiService.updateTask(taskId, data);
    return task;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to update task";
    return rejectWithValue(errorMessage);
  }
});

export const getProjectTasks = createAsyncThunk<
  Task[],
  { projectId: string; filters?: TaskFilters },
  { rejectValue: string }
>("task/getProjectTasks", async ({ projectId, filters = {} }, { rejectWithValue }) => {
  try {
    const tasks = await taskApiService.getProjectTasks(projectId, filters);
    return tasks;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to get project tasks";
    return rejectWithValue(errorMessage);
  }
});

export const listTasks = createAsyncThunk<
  { tasks: Task[]; total: number },
  TaskFilters & { limit?: number; offset?: number },
  { rejectValue: string }
>("task/list", async (filters, { rejectWithValue }) => {
  try {
    const response = await taskApiService.listTasks(filters);
    return { tasks: response.tasks, total: response.total };
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to list tasks";
    return rejectWithValue(errorMessage);
  }
});

export const completeTask = createAsyncThunk<
  Task,
  string,
  { rejectValue: string }
>("task/complete", async (taskId, { rejectWithValue }) => {
  try {
    const task = await taskApiService.completeTask(taskId);
    return task;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to complete task";
    return rejectWithValue(errorMessage);
  }
});

export const updateTaskStatus = createAsyncThunk<
  Task,
  { taskId: string; status: TaskStatus },
  { rejectValue: string }
>("task/updateStatus", async ({ taskId, status }, { rejectWithValue }) => {
  try {
    const task = await taskApiService.updateTask(taskId, { status });
    return task;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to update task status";
    return rejectWithValue(errorMessage);
  }
});

export const reopenTask = createAsyncThunk<
  Task,
  string,
  { rejectValue: string }
>("task/reopen", async (taskId, { rejectWithValue }) => {
  try {
    const task = await taskApiService.reopenTask(taskId);
    return task;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to reopen task";
    return rejectWithValue(errorMessage);
  }
});

export const deleteTask = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("task/delete", async (taskId, { rejectWithValue }) => {
  try {
    await taskApiService.deleteTask(taskId);
    return taskId;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to delete task";
    return rejectWithValue(errorMessage);
  }
});

// Task slice
const taskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    // Set current task
    setCurrentTask: (state, action: PayloadAction<Task>) => {
      state.currentTask = action.payload;
    },
    // Clear current task
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
    // Clear all task data
    clearTaskData: (state) => {
      state.tasks = [];
      state.currentTask = null;
      state.projectTasks = {};
      state.error = null;
    },
    // Set filters
    setFilters: (state, action: PayloadAction<Partial<TaskFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    // Clear filters
    clearFilters: (state) => {
      state.filters = {};
    },
    // Set pagination
    setPagination: (state, action: PayloadAction<Partial<TaskState["pagination"]>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Task
      .addCase(createTask.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.creating = false;
        state.tasks.push(action.payload);
        state.error = null;
        
        // Add to project tasks
        const projectId = action.payload.project_id;
        if (!state.projectTasks[projectId]) {
          state.projectTasks[projectId] = [];
        }
        state.projectTasks[projectId].push(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload || "Failed to create task";
      })

      // Get Task by ID
      .addCase(getTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.loading = false;
        state.currentTask = action.payload;
        state.error = null;
      })
      .addCase(getTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to get task";
      })

      // Update Task
      .addCase(updateTask.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.updating = false;
        state.currentTask = action.payload;
        state.error = null;
        
        // Update in tasks list
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        
        // Update in project tasks
        const projectId = action.payload.project_id;
        if (state.projectTasks[projectId]) {
          const projectIndex = state.projectTasks[projectId].findIndex(
            task => task.id === action.payload.id
          );
          if (projectIndex !== -1) {
            state.projectTasks[projectId][projectIndex] = action.payload;
          }
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload || "Failed to update task";
      })

      // Get Project Tasks
      .addCase(getProjectTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProjectTasks.fulfilled, (state, action) => {
        state.loading = false;
        const projectId = action.meta.arg.projectId;
        state.projectTasks[projectId] = action.payload;
        state.error = null;
      })
      .addCase(getProjectTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to get project tasks";
      })

      // List Tasks
      .addCase(listTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.tasks;
        state.pagination.total = action.payload.total;
        state.error = null;
      })
      .addCase(listTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to list tasks";
      })

      // Complete Task
      .addCase(completeTask.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(completeTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.updating = false;
        state.error = null;
        
        // Update task in lists
        const updateTaskInList = (tasks: Task[]) => {
          const index = tasks.findIndex(task => task.id === action.payload.id);
          if (index !== -1) {
            tasks[index] = action.payload;
          }
        };
        
        updateTaskInList(state.tasks);
        
        const projectId = action.payload.project_id;
        if (state.projectTasks[projectId]) {
          updateTaskInList(state.projectTasks[projectId]);
        }
        
        if (state.currentTask?.id === action.payload.id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(completeTask.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload || "Failed to complete task";
      })

      // Update Task Status
      .addCase(updateTaskStatus.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateTaskStatus.fulfilled, (state, action: PayloadAction<Task>) => {
        state.updating = false;
        state.error = null;
        
        // Update task in lists
        const updateTaskInList = (tasks: Task[]) => {
          const index = tasks.findIndex(task => task.id === action.payload.id);
          if (index !== -1) {
            tasks[index] = action.payload;
          }
        };
        
        updateTaskInList(state.tasks);
        
        const projectId = action.payload.project_id;
        if (state.projectTasks[projectId]) {
          updateTaskInList(state.projectTasks[projectId]);
        }
        
        if (state.currentTask?.id === action.payload.id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload || "Failed to update task status";
      })

      // Reopen Task
      .addCase(reopenTask.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(reopenTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.updating = false;
        state.error = null;
        
        // Update task in lists
        const updateTaskInList = (tasks: Task[]) => {
          const index = tasks.findIndex(task => task.id === action.payload.id);
          if (index !== -1) {
            tasks[index] = action.payload;
          }
        };
        
        updateTaskInList(state.tasks);
        
        const projectId = action.payload.project_id;
        if (state.projectTasks[projectId]) {
          updateTaskInList(state.projectTasks[projectId]);
        }
        
        if (state.currentTask?.id === action.payload.id) {
          state.currentTask = action.payload;
        }
      })
      .addCase(reopenTask.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload || "Failed to reopen task";
      })

      // Delete Task
      .addCase(deleteTask.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action: PayloadAction<string>) => {
        state.deleting = false;
        state.error = null;
        
        // Remove task from lists
        state.tasks = state.tasks.filter(task => task.id !== action.payload);
        
        // Remove from project tasks
        Object.keys(state.projectTasks).forEach(projectId => {
          state.projectTasks[projectId] = state.projectTasks[projectId].filter(
            task => task.id !== action.payload
          );
        });
        
        if (state.currentTask?.id === action.payload) {
          state.currentTask = null;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload || "Failed to delete task";
      });
  },
});

// Export actions
export const {
  clearError,
  setCurrentTask,
  clearCurrentTask,
  clearTaskData,
  setFilters,
  clearFilters,
  setPagination,
} = taskSlice.actions;

// Export reducer
export default taskSlice.reducer;
