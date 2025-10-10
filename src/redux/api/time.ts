// src/redux/api/time.ts
import { api } from "../../service/api";
import { API_CONFIG } from "../../config/api.config";

export type TimeEntrySource = "timer" | "manual" | "calendar" | "import";

// Types for Time Entry API requests and responses
export interface TimeEntry {
  id: string;
  organization_id: string;
  user_id: string;
  project_id?: string;
  task_id?: string;
  description?: string;
  start_ts: string;
  end_ts?: string;
  duration_seconds?: number;
  billable: boolean;
  paused_intervals?: Array<{
    start: string;
    end?: string;
  }>;
  idle_suggestion?: {
    idle_seconds: number;
    idle_percent: number;
    suggested_trim_seconds: number;
  };
  idle_trim_applied_seconds?: number;
  source: TimeEntrySource;
  created_at: string;
  updated_at: string;
  project?: {
    id: string;
    name: string;
  };
  task?: {
    id: string;
    title: string;
  };
}

export interface StartTimerRequest {
  project_id: string;
  task_id: string;
  billable?: boolean;
  notes?: string;
  source?: TimeEntrySource;
  idempotency_key?: string;
}

export interface PauseTimerRequest {
  time_entry_id: string;
}

export interface ResumeTimerRequest {
  time_entry_id: string;
}

export interface StopTimerRequest {
  time_entry_id: string;
  client_idle_intervals?: Array<{
    start: string;
    end: string;
  }>;
  accept_server_idle_trim?: boolean;
}

export interface CreateManualEntryRequest {
  start_ts: string;
  end_ts: string;
  project_id: string;
  task_id: string;
  billable?: boolean;
  notes?: string;
  allow_overlap?: boolean;
  source?: TimeEntrySource;
}

export interface UpdateTimeEntryRequest {
  start_ts?: string;
  end_ts?: string;
  project_id?: string;
  task_id?: string;
  billable?: boolean;
  notes?: string;
  allow_overlap?: boolean;
}

export interface ListEntriesFilters {
  start?: string;
  end?: string;
  project_id?: string;
  task_id?: string;
  limit?: number;
  offset?: number;
}

export interface ListEntriesResponse {
  entries: TimeEntry[];
  total: number;
}

export interface BulkAdjustRequest {
  entry_ids: string[];
  adjustment: {
    type: "set_duration" | "multiply" | "add_seconds";
    value: number;
  };
  reason?: string;
}

export interface ApplyIdleTrimRequest {
  time_entry_id: string;
  trim_seconds: number;
}

// Time Entry API service functions
export const timeApiService = {
  // 1. Get Active Timer
  getActiveTimer: async (): Promise<TimeEntry | null> => {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.TIME.ACTIVE_TIMER);
      return response.data;
    } catch (error: any) {
      // 404 is expected if no active timer exists
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // 2. Start Timer
  startTimer: async (data: StartTimerRequest): Promise<TimeEntry> => {
    const response = await api.post(API_CONFIG.ENDPOINTS.TIME.START_TIMER, {
      ...data,
      source: data.source || "timer",
    });
    return response.data;
  },

  // 3. Pause Timer
  pauseTimer: async (timeEntryId: string): Promise<TimeEntry> => {
    const response = await api.post(API_CONFIG.ENDPOINTS.TIME.PAUSE_TIMER, {
      time_entry_id: timeEntryId,
    });
    return response.data;
  },

  // 4. Resume Timer
  resumeTimer: async (timeEntryId: string): Promise<TimeEntry> => {
    const response = await api.post(API_CONFIG.ENDPOINTS.TIME.RESUME_TIMER, {
      time_entry_id: timeEntryId,
    });
    return response.data;
  },

  // 5. Stop Timer
  stopTimer: async (
    timeEntryId: string,
    data?: Omit<StopTimerRequest, "time_entry_id">
  ): Promise<TimeEntry> => {
    const response = await api.post(API_CONFIG.ENDPOINTS.TIME.STOP_TIMER, {
      time_entry_id: timeEntryId,
      ...data,
    });
    return response.data;
  },

  // 6. Create Manual Entry
  createManualEntry: async (
    data: CreateManualEntryRequest
  ): Promise<TimeEntry> => {
    const response = await api.post(API_CONFIG.ENDPOINTS.TIME.ENTRIES, {
      ...data,
      source: data.source || "manual",
    });
    return response.data;
  },

  // 7. List Time Entries
  listEntries: async (
    filters: ListEntriesFilters = {}
  ): Promise<ListEntriesResponse> => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(
      `${API_CONFIG.ENDPOINTS.TIME.ENTRIES}?${params.toString()}`
    );

    const data = response.data;

    // Handle different response formats from the backend
    if (Array.isArray(data)) {
      // If backend returns array directly
      return {
        entries: data,
        total: data.length,
      };
    } else if (data && typeof data === "object" && "entries" in data) {
      // If backend returns { entries: [], total: number }
      return {
        entries: Array.isArray(data.entries) ? data.entries : [],
        total: typeof data.total === "number" ? data.total : 0,
      };
    }

    // Fallback for unexpected response format
    console.warn("Unexpected time entries response format:", data);
    return {
      entries: [],
      total: 0,
    };
  },

  // 8. Get Time Entry by ID
  getEntry: async (entryId: string): Promise<TimeEntry> => {
    const response = await api.get(
      API_CONFIG.ENDPOINTS.TIME.ENTRY_BY_ID(entryId)
    );
    return response.data;
  },

  // 9. Update Time Entry
  updateEntry: async (
    entryId: string,
    data: UpdateTimeEntryRequest
  ): Promise<TimeEntry> => {
    const response = await api.patch(
      API_CONFIG.ENDPOINTS.TIME.ENTRY_BY_ID(entryId),
      data
    );
    return response.data;
  },

  // 10. Delete Time Entry
  deleteEntry: async (entryId: string): Promise<void> => {
    await api.delete(API_CONFIG.ENDPOINTS.TIME.ENTRY_BY_ID(entryId));
  },

  // 11. Apply Idle Trim
  applyIdleTrim: async (
    entryId: string,
    data: Omit<ApplyIdleTrimRequest, "time_entry_id">
  ): Promise<TimeEntry> => {
    const response = await api.post(API_CONFIG.ENDPOINTS.TIME.APPLY_IDLE_TRIM, {
      time_entry_id: entryId,
      ...data,
    });
    return response.data;
  },

  // 12. Bulk Adjust
  bulkAdjust: async (data: BulkAdjustRequest): Promise<TimeEntry[]> => {
    const response = await api.post(
      API_CONFIG.ENDPOINTS.TIME.BULK_ADJUST,
      data
    );
    return response.data;
  },
};
