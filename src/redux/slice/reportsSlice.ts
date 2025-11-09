import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  reportsApi,
  TimeReportQuery,
  TimeReportResponse,
  LeaderboardResponse,
  CapacityResponse,
  ForecastComputeRequest,
  ForecastResponse,
  ExportJobSummary,
  DailyTeamTimeQuery,
  DailyTeamTimeResponse,
} from "../api/reports";

interface ReportsState {
  timeReport: TimeReportResponse | null;
  leaderboard: LeaderboardResponse | null;
  capacity: CapacityResponse | null;
  forecast: Record<string, ForecastResponse | undefined>; // keyed by projectId
  dailyTeamTime: Record<string, DailyTeamTimeResponse | undefined>; // keyed by date
  exports: ExportJobSummary[];
  loading: {
    time: boolean;
    leaderboard: boolean;
    capacity: boolean;
    forecast: Record<string, boolean | undefined>;
    dailyTeamTime: Record<string, boolean | undefined>;
    exports: boolean;
    csv: boolean;
  };
  error: string | null;
  lastQuery: TimeReportQuery | null;
}

const initialState: ReportsState = {
  timeReport: null,
  leaderboard: null,
  capacity: null,
  forecast: {},
  dailyTeamTime: {},
  exports: [],
  loading: {
    time: false,
    leaderboard: false,
    capacity: false,
    forecast: {},
    dailyTeamTime: {},
    exports: false,
    csv: false,
  },
  error: null,
  lastQuery: null,
};

export const fetchTimeReport = createAsyncThunk<
  TimeReportResponse,
  TimeReportQuery,
  { rejectValue: string }
>("reports/fetchTimeReport", async (query, { rejectWithValue }) => {
  try {
    // use GET by default for caching/linkability
    const data = await reportsApi.getTimeReport(query);
    return data;
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.detail || e?.message || "Failed to load time report");
  }
});

export const downloadTimeCsv = createAsyncThunk<
  Blob,
  TimeReportQuery,
  { rejectValue: string }
>("reports/downloadTimeCsv", async (query, { rejectWithValue }) => {
  try {
    const blob = await reportsApi.downloadTimeCsv(query);
    return blob;
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.detail || e?.message || "Failed to download CSV");
  }
});

export const fetchLeaderboard = createAsyncThunk<
  LeaderboardResponse,
  { sort_by?: string; limit?: number; offset?: number } | undefined,
  { rejectValue: string }
>("reports/fetchLeaderboard", async (query, { rejectWithValue }) => {
  try {
    const data = await reportsApi.getLeaderboard(query);
    return data;
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.detail || e?.message || "Failed to load leaderboard");
  }
});

export const fetchCapacity = createAsyncThunk<
  CapacityResponse,
  { from_date?: string; to_date?: string; limit?: number; offset?: number } | undefined,
  { rejectValue: string }
>("reports/fetchCapacity", async (query, { rejectWithValue }) => {
  try {
    const data = await reportsApi.getCapacity(query);
    return data;
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.detail || e?.message || "Failed to load capacity");
  }
});

export const computeForecast = createAsyncThunk<
  { projectId: string; data: ForecastResponse },
  { projectId: string; body?: ForecastComputeRequest },
  { rejectValue: string }
>("reports/computeForecast", async ({ projectId, body }, { rejectWithValue }) => {
  try {
    const data = await reportsApi.computeForecast(projectId, body);
    return { projectId, data };
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.detail || e?.message || "Failed to compute forecast");
  }
});

export const getForecast = createAsyncThunk<
  { projectId: string; data: ForecastResponse },
  { projectId: string },
  { rejectValue: string }
>("reports/getForecast", async ({ projectId }, { rejectWithValue }) => {
  try {
    const data = await reportsApi.getForecast(projectId);
    return { projectId, data };
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.detail || e?.message || "Failed to get forecast");
  }
});

export const getDailyTeamTimeReport = createAsyncThunk<
  { key: string; data: DailyTeamTimeResponse },
  DailyTeamTimeQuery,
  { rejectValue: string }
>("reports/getDailyTeamTimeReport", async (query, { rejectWithValue }) => {
  try {
    const data = await reportsApi.getDailyTeamTimeReport(query);
    const key = `${query.from_date}_${query.to_date}`;
    return { key, data };
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.detail || e?.message || "Failed to get daily team time report");
  }
});

export const listExports = createAsyncThunk<
  ExportJobSummary[],
  void,
  { rejectValue: string }
>("reports/listExports", async (_, { rejectWithValue }) => {
  try {
    const data = await reportsApi.listExports();
    return data;
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.detail || e?.message || "Failed to load exports");
  }
});

export const getExportStatus = createAsyncThunk<
  ExportJobSummary,
  string,
  { rejectValue: string }
>("reports/getExportStatus", async (exportId, { rejectWithValue }) => {
  try {
    const data = await reportsApi.getExportStatus(exportId);
    return data;
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.detail || e?.message || "Failed to get export status");
  }
});

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    clearReportsError: (state) => {
      state.error = null;
    },
    setLastTimeQuery: (state, action: PayloadAction<TimeReportQuery | null>) => {
      state.lastQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Time report
      .addCase(fetchTimeReport.pending, (state, action) => {
        state.loading.time = true;
        state.error = null;
        state.lastQuery = action.meta.arg || null;
      })
      .addCase(fetchTimeReport.fulfilled, (state, action) => {
        state.loading.time = false;
        state.timeReport = action.payload;
      })
      .addCase(fetchTimeReport.rejected, (state, action) => {
        state.loading.time = false;
        state.error = action.payload || "Failed to load time report";
      })

      // CSV
      .addCase(downloadTimeCsv.pending, (state) => {
        state.loading.csv = true;
        state.error = null;
      })
      .addCase(downloadTimeCsv.fulfilled, (state) => {
        state.loading.csv = false;
      })
      .addCase(downloadTimeCsv.rejected, (state, action) => {
        state.loading.csv = false;
        state.error = action.payload || "Failed to download CSV";
      })

      // Leaderboard
      .addCase(fetchLeaderboard.pending, (state) => {
        state.loading.leaderboard = true;
        state.error = null;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.loading.leaderboard = false;
        state.leaderboard = action.payload;
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.loading.leaderboard = false;
        state.error = action.payload || "Failed to load leaderboard";
      })

      // Capacity
      .addCase(fetchCapacity.pending, (state) => {
        state.loading.capacity = true;
        state.error = null;
      })
      .addCase(fetchCapacity.fulfilled, (state, action) => {
        state.loading.capacity = false;
        state.capacity = action.payload;
      })
      .addCase(fetchCapacity.rejected, (state, action) => {
        state.loading.capacity = false;
        state.error = action.payload || "Failed to load capacity";
      })

      // Forecast compute
      .addCase(computeForecast.pending, (state, action) => {
        const projectId = action.meta.arg.projectId;
        state.loading.forecast[projectId] = true;
        state.error = null;
      })
      .addCase(computeForecast.fulfilled, (state, action) => {
        const { projectId, data } = action.payload;
        state.loading.forecast[projectId] = false;
        state.forecast[projectId] = data;
      })
      .addCase(computeForecast.rejected, (state, action) => {
        // Project context may be missing on errors; keep generic
        state.error = action.payload || "Failed to compute forecast";
      })

      // Forecast get
      .addCase(getForecast.pending, (state, action) => {
        const projectId = action.meta.arg.projectId;
        state.loading.forecast[projectId] = true;
        state.error = null;
      })
      .addCase(getForecast.fulfilled, (state, action) => {
        const { projectId, data } = action.payload;
        state.loading.forecast[projectId] = false;
        state.forecast[projectId] = data;
      })
      .addCase(getForecast.rejected, (state, action) => {
        state.error = action.payload || "Failed to get forecast";
      })

      // Daily team time report
      .addCase(getDailyTeamTimeReport.pending, (state, action) => {
        const key = `${action.meta.arg.from_date}_${action.meta.arg.to_date}`;
        state.loading.dailyTeamTime[key] = true;
        state.error = null;
      })
      .addCase(getDailyTeamTimeReport.fulfilled, (state, action) => {
        const { key, data } = action.payload;
        state.loading.dailyTeamTime[key] = false;
        state.dailyTeamTime[key] = data;
      })
      .addCase(getDailyTeamTimeReport.rejected, (state, action) => {
        const key = `${action.meta.arg.from_date}_${action.meta.arg.to_date}`;
        state.loading.dailyTeamTime[key] = false;
        state.error = action.payload || "Failed to get daily team time report";
      })

      // Exports
      .addCase(listExports.pending, (state) => {
        state.loading.exports = true;
        state.error = null;
      })
      .addCase(listExports.fulfilled, (state, action) => {
        state.loading.exports = false;
        state.exports = action.payload;
      })
      .addCase(listExports.rejected, (state, action) => {
        state.loading.exports = false;
        state.error = action.payload || "Failed to load exports";
      })

      .addCase(getExportStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.exports.findIndex(e => e.id === updated.id);
        if (idx >= 0) state.exports[idx] = updated; else state.exports.unshift(updated);
      });
  },
});

export const { clearReportsError, setLastTimeQuery } = reportsSlice.actions;
export default reportsSlice.reducer;


