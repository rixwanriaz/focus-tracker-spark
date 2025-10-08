import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  timeApiService,
  TimeEntry,
  StartTimerRequest,
  StopTimerRequest,
  CreateManualEntryRequest,
  UpdateTimeEntryRequest,
  ListEntriesFilters,
  BulkAdjustRequest,
  ApplyIdleTrimRequest,
} from "../api/time";

// Time state interface
interface TimeState {
  activeTimer: TimeEntry | null;
  entries: TimeEntry[];
  currentEntry: TimeEntry | null;
  loading: boolean;
  error: string | null;
  starting: boolean;
  stopping: boolean;
  pausing: boolean;
  resuming: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  filters: ListEntriesFilters;
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

// Initial state
const initialState: TimeState = {
  activeTimer: null,
  entries: [],
  currentEntry: null,
  loading: false,
  error: null,
  starting: false,
  stopping: false,
  pausing: false,
  resuming: false,
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

// Async thunks for time operations

// Get Active Timer
export const getActiveTimer = createAsyncThunk<
  TimeEntry | null,
  void,
  { rejectValue: string }
>("time/getActive", async (_, { rejectWithValue }) => {
  try {
    const timer = await timeApiService.getActiveTimer();
    return timer;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to get active timer";
    return rejectWithValue(errorMessage);
  }
});

// Start Timer
export const startTimer = createAsyncThunk<
  TimeEntry,
  StartTimerRequest,
  { rejectValue: string }
>("time/start", async (data, { rejectWithValue }) => {
  try {
    const timer = await timeApiService.startTimer(data);
    return timer;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to start timer";
    return rejectWithValue(errorMessage);
  }
});

// Pause Timer
export const pauseTimer = createAsyncThunk<
  TimeEntry,
  string,
  { rejectValue: string }
>("time/pause", async (timeEntryId, { rejectWithValue }) => {
  try {
    const timer = await timeApiService.pauseTimer(timeEntryId);
    return timer;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to pause timer";
    return rejectWithValue(errorMessage);
  }
});

// Resume Timer
export const resumeTimer = createAsyncThunk<
  TimeEntry,
  string,
  { rejectValue: string }
>("time/resume", async (timeEntryId, { rejectWithValue }) => {
  try {
    const timer = await timeApiService.resumeTimer(timeEntryId);
    return timer;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to resume timer";
    return rejectWithValue(errorMessage);
  }
});

// Stop Timer
export const stopTimer = createAsyncThunk<
  TimeEntry,
  { timeEntryId: string; data?: Omit<StopTimerRequest, 'time_entry_id'> },
  { rejectValue: string }
>("time/stop", async ({ timeEntryId, data }, { rejectWithValue }) => {
  try {
    const timer = await timeApiService.stopTimer(timeEntryId, data);
    return timer;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to stop timer";
    return rejectWithValue(errorMessage);
  }
});

// Create Manual Entry
export const createManualEntry = createAsyncThunk<
  TimeEntry,
  CreateManualEntryRequest,
  { rejectValue: string }
>("time/createManual", async (data, { rejectWithValue }) => {
  try {
    const entry = await timeApiService.createManualEntry(data);
    return entry;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to create manual entry";
    return rejectWithValue(errorMessage);
  }
});

// List Entries
export const listEntries = createAsyncThunk<
  { entries: TimeEntry[]; total: number },
  ListEntriesFilters,
  { rejectValue: string }
>("time/list", async (filters, { rejectWithValue }) => {
  try {
    const response = await timeApiService.listEntries(filters);
    return response;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to list entries";
    return rejectWithValue(errorMessage);
  }
});

// Get Entry by ID
export const getEntry = createAsyncThunk<
  TimeEntry,
  string,
  { rejectValue: string }
>("time/getById", async (entryId, { rejectWithValue }) => {
  try {
    const entry = await timeApiService.getEntry(entryId);
    return entry;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to get entry";
    return rejectWithValue(errorMessage);
  }
});

// Update Entry
export const updateEntry = createAsyncThunk<
  TimeEntry,
  { entryId: string; data: UpdateTimeEntryRequest },
  { rejectValue: string }
>("time/update", async ({ entryId, data }, { rejectWithValue }) => {
  try {
    const entry = await timeApiService.updateEntry(entryId, data);
    return entry;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to update entry";
    return rejectWithValue(errorMessage);
  }
});

// Delete Entry
export const deleteEntry = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("time/delete", async (entryId, { rejectWithValue }) => {
  try {
    await timeApiService.deleteEntry(entryId);
    return entryId;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to delete entry";
    return rejectWithValue(errorMessage);
  }
});

// Apply Idle Trim
export const applyIdleTrim = createAsyncThunk<
  TimeEntry,
  { entryId: string; data: ApplyIdleTrimRequest },
  { rejectValue: string }
>("time/applyIdleTrim", async ({ entryId, data }, { rejectWithValue }) => {
  try {
    const entry = await timeApiService.applyIdleTrim(entryId, data);
    return entry;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to apply idle trim";
    return rejectWithValue(errorMessage);
  }
});

// Bulk Adjust
export const bulkAdjust = createAsyncThunk<
  TimeEntry[],
  BulkAdjustRequest,
  { rejectValue: string }
>("time/bulkAdjust", async (data, { rejectWithValue }) => {
  try {
    const entries = await timeApiService.bulkAdjust(data);
    return entries;
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.detail ||
      error?.message ||
      "Failed to bulk adjust";
    return rejectWithValue(errorMessage);
  }
});

// Time slice
const timeSlice = createSlice({
  name: "time",
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    // Set current entry
    setCurrentEntry: (state, action: PayloadAction<TimeEntry>) => {
      state.currentEntry = action.payload;
    },
    // Clear current entry
    clearCurrentEntry: (state) => {
      state.currentEntry = null;
    },
    // Clear all time data
    clearTimeData: (state) => {
      state.activeTimer = null;
      state.entries = [];
      state.currentEntry = null;
      state.error = null;
    },
    // Set filters
    setFilters: (state, action: PayloadAction<Partial<ListEntriesFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    // Clear filters
    clearFilters: (state) => {
      state.filters = {};
    },
    // Set pagination
    setPagination: (
      state,
      action: PayloadAction<Partial<TimeState["pagination"]>>
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Active Timer
      .addCase(getActiveTimer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getActiveTimer.fulfilled, (state, action) => {
        state.loading = false;
        state.activeTimer = action.payload;
        state.error = null;
      })
      .addCase(getActiveTimer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to get active timer";
      })

      // Start Timer
      .addCase(startTimer.pending, (state) => {
        state.starting = true;
        state.error = null;
      })
      .addCase(startTimer.fulfilled, (state, action: PayloadAction<TimeEntry>) => {
        state.starting = false;
        state.activeTimer = action.payload;
        state.error = null;
      })
      .addCase(startTimer.rejected, (state, action) => {
        state.starting = false;
        state.error = action.payload || "Failed to start timer";
      })

      // Pause Timer
      .addCase(pauseTimer.pending, (state) => {
        state.pausing = true;
        state.error = null;
      })
      .addCase(pauseTimer.fulfilled, (state, action: PayloadAction<TimeEntry>) => {
        state.pausing = false;
        state.activeTimer = action.payload;
        state.error = null;
      })
      .addCase(pauseTimer.rejected, (state, action) => {
        state.pausing = false;
        state.error = action.payload || "Failed to pause timer";
      })

      // Resume Timer
      .addCase(resumeTimer.pending, (state) => {
        state.resuming = true;
        state.error = null;
      })
      .addCase(resumeTimer.fulfilled, (state, action: PayloadAction<TimeEntry>) => {
        state.resuming = false;
        state.activeTimer = action.payload;
        state.error = null;
      })
      .addCase(resumeTimer.rejected, (state, action) => {
        state.resuming = false;
        state.error = action.payload || "Failed to resume timer";
      })

      // Stop Timer
      .addCase(stopTimer.pending, (state) => {
        state.stopping = true;
        state.error = null;
      })
      .addCase(stopTimer.fulfilled, (state, action: PayloadAction<TimeEntry>) => {
        state.stopping = false;
        state.activeTimer = null;
        state.entries.unshift(action.payload);
        state.error = null;
      })
      .addCase(stopTimer.rejected, (state, action) => {
        state.stopping = false;
        state.error = action.payload || "Failed to stop timer";
      })

      // Create Manual Entry
      .addCase(createManualEntry.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createManualEntry.fulfilled, (state, action: PayloadAction<TimeEntry>) => {
        state.creating = false;
        state.entries.unshift(action.payload);
        state.error = null;
      })
      .addCase(createManualEntry.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload || "Failed to create manual entry";
      })

      // List Entries
      .addCase(listEntries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.entries = action.payload.entries;
        state.pagination.total = action.payload.total;
        state.error = null;
      })
      .addCase(listEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to list entries";
      })

      // Get Entry by ID
      .addCase(getEntry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEntry.fulfilled, (state, action: PayloadAction<TimeEntry>) => {
        state.loading = false;
        state.currentEntry = action.payload;
        state.error = null;
      })
      .addCase(getEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to get entry";
      })

      // Update Entry
      .addCase(updateEntry.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateEntry.fulfilled, (state, action: PayloadAction<TimeEntry>) => {
        state.updating = false;
        state.currentEntry = action.payload;
        
        // Update in entries list
        const index = state.entries.findIndex(entry => entry.id === action.payload.id);
        if (index !== -1) {
          state.entries[index] = action.payload;
        }
        
        state.error = null;
      })
      .addCase(updateEntry.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload || "Failed to update entry";
      })

      // Delete Entry
      .addCase(deleteEntry.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteEntry.fulfilled, (state, action: PayloadAction<string>) => {
        state.deleting = false;
        state.entries = state.entries.filter(entry => entry.id !== action.payload);
        
        if (state.currentEntry?.id === action.payload) {
          state.currentEntry = null;
        }
        
        state.error = null;
      })
      .addCase(deleteEntry.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload || "Failed to delete entry";
      })

      // Apply Idle Trim
      .addCase(applyIdleTrim.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(applyIdleTrim.fulfilled, (state, action: PayloadAction<TimeEntry>) => {
        state.updating = false;
        
        // Update in entries list
        const index = state.entries.findIndex(entry => entry.id === action.payload.id);
        if (index !== -1) {
          state.entries[index] = action.payload;
        }
        
        if (state.currentEntry?.id === action.payload.id) {
          state.currentEntry = action.payload;
        }
        
        state.error = null;
      })
      .addCase(applyIdleTrim.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload || "Failed to apply idle trim";
      })

      // Bulk Adjust
      .addCase(bulkAdjust.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(bulkAdjust.fulfilled, (state, action: PayloadAction<TimeEntry[]>) => {
        state.updating = false;
        
        // Update all affected entries
        action.payload.forEach(updatedEntry => {
          const index = state.entries.findIndex(entry => entry.id === updatedEntry.id);
          if (index !== -1) {
            state.entries[index] = updatedEntry;
          }
        });
        
        state.error = null;
      })
      .addCase(bulkAdjust.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload || "Failed to bulk adjust";
      });
  },
});

// Export actions
export const {
  clearError,
  setCurrentEntry,
  clearCurrentEntry,
  clearTimeData,
  setFilters,
  clearFilters,
  setPagination,
} = timeSlice.actions;

// Export reducer
export default timeSlice.reducer;

