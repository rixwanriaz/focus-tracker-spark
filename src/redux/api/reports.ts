import { api } from "../../service/api";
import { API_CONFIG } from "../../config/api.config";

// Types
export type GroupByDimension = "user" | "project" | "task" | "client";

export interface TimeReportQuery {
  from_date?: string; // ISO date YYYY-MM-DD
  to_date?: string; // ISO date YYYY-MM-DD
  group_by?: GroupByDimension | `${GroupByDimension},${GroupByDimension}`;
  limit?: number;
  offset?: number;
  sort_by?: string;
}

export interface TimeReportRow {
  user_id?: string | null;
  project_id?: string | null;
  task_id?: string | null;
  total_hours: number;
  billable_hours?: number | null;
  billable_value?: number | null;
}

export interface TimeReportResponse {
  rows: TimeReportRow[];
  total_count: number;
}

export interface LeaderboardItem {
  project_id: string;
  project_name: string;
  revenue: number;
  cost: number;
  profit: number;
  margin: number; // percentage number 0-100
  billable_hours: number;
}

export interface LeaderboardResponse {
  items: LeaderboardItem[];
  total_count: number;
}

export interface CapacityItem {
  user_id: string;
  available_hours: number;
  booked_hours: number;
  actual_hours: number;
  utilization: number; // 0..1
  booking_load: number; // 0..1
  status: "underbooked" | "balanced" | "overbooked";
}

export interface CapacityResponse {
  items: CapacityItem[];
  total_count: number;
}

export interface ExportJobSummary {
  id: string;
  type: string;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  completed_at?: string | null;
  download_url?: string | null;
}

export interface ForecastComputeRequest {
  lookback_days?: number; // default 30
  confidence?: number; // e.g. 0.95
}

export interface ForecastResponse {
  project_id: string;
  method: string;
  computed_at: string;
  predicted_budget_exhausted_date: string;
  confidence_band?: { low_date: string; high_date: string };
  series?: Array<{ date: string; cumulative_spend: number }>;
  explanation?: string;
}

export interface DailyTeamTimeItem {
  user_id: string;
  user_email: string;
  total_hours: number;
  billable_hours: number;
}

export interface DailyTeamTimeDateItem {
  date: string;
  team_members: DailyTeamTimeItem[];
}

export interface DailyProjectTimeItem {
  project_id: string;
  project_name: string;
  dates: DailyTeamTimeDateItem[];
}

export interface DailyTeamTimeResponse {
  from_date: string;
  to_date: string;
  projects: DailyProjectTimeItem[];
}

export interface DailyTeamTimeQuery {
  from_date: string; // ISO date YYYY-MM-DD
  to_date: string; // ISO date YYYY-MM-DD
  project_id?: string; // Optional project UUID to filter results
}

// Service
export const reportsApi = {
  getTimeReport: async (query: TimeReportQuery): Promise<TimeReportResponse> => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") params.append(k, String(v));
    });
    const { data } = await api.get(`${API_CONFIG.ENDPOINTS.REPORTS.TIME_GET}?${params.toString()}`);
    return data;
  },

  postTimeReport: async (payload: TimeReportQuery): Promise<TimeReportResponse> => {
    const { data } = await api.post(API_CONFIG.ENDPOINTS.REPORTS.TIME_POST, payload);
    return data;
  },

  downloadTimeCsv: async (query: TimeReportQuery): Promise<Blob> => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") params.append(k, String(v));
    });
    const { data } = await api.get(
      `${API_CONFIG.ENDPOINTS.REPORTS.TIME_CSV}?${params.toString()}`,
      { responseType: "blob" }
    );
    return data as Blob;
  },

  getLeaderboard: async (query?: { sort_by?: string; limit?: number; offset?: number }): Promise<LeaderboardResponse> => {
    const params = new URLSearchParams();
    if (query) Object.entries(query).forEach(([k, v]) => v !== undefined && params.append(k, String(v)));
    const { data } = await api.get(`${API_CONFIG.ENDPOINTS.REPORTS.LEADERBOARD}?${params.toString()}`);
    return data;
  },

  getCapacity: async (query?: { from_date?: string; to_date?: string; limit?: number; offset?: number }): Promise<CapacityResponse> => {
    const params = new URLSearchParams();
    if (query) Object.entries(query).forEach(([k, v]) => v !== undefined && params.append(k, String(v)));
    const { data } = await api.get(`${API_CONFIG.ENDPOINTS.REPORTS.CAPACITY}?${params.toString()}`);
    return data;
  },

  listExports: async (): Promise<ExportJobSummary[]> => {
    const { data } = await api.get(API_CONFIG.ENDPOINTS.REPORTS.EXPORTS);
    return data;
  },

  getExportStatus: async (exportId: string): Promise<ExportJobSummary> => {
    const { data } = await api.get(API_CONFIG.ENDPOINTS.REPORTS.EXPORT_BY_ID(exportId));
    return data;
  },

  computeForecast: async (projectId: string, body: ForecastComputeRequest = {}): Promise<ForecastResponse> => {
    const { data } = await api.post(API_CONFIG.ENDPOINTS.FORECAST.BY_PROJECT_POST(projectId), body);
    return data;
  },

  getForecast: async (projectId: string): Promise<ForecastResponse> => {
    const { data } = await api.get(API_CONFIG.ENDPOINTS.FORECAST.BY_PROJECT_GET(projectId));
    return data;
  },

  getDailyTeamTimeReport: async (query: DailyTeamTimeQuery): Promise<DailyTeamTimeResponse> => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") params.append(k, String(v));
    });
    const { data } = await api.get(`${API_CONFIG.ENDPOINTS.REPORTS.DAILY_TEAM_TIME}?${params.toString()}`);
    return data;
  },
};


