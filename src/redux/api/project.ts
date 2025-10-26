// src/redux/api/project.ts
import { api } from "../../service/api";
import { API_CONFIG } from "../../config/api.config";

// Types for Project API requests and responses
export interface Project {
  id: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  budget_amount?: number;
  budget_currency?: string;
  project_manager_id?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  status?: string;
  is_active?: boolean;
  settings?: Record<string, any>;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  budget_amount?: number;
  budget_currency?: string;
  project_manager_id?: string;
  settings?: Record<string, any>;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  budget_amount?: number;
  budget_currency?: string;
  project_manager_id?: string;
}

export interface ProjectMember {
  id: string;
  user_id: string;
  project_id: string;
  user_email: string;
  role: string;
  hourly_rate_override?: number;
  created_at: string;
  joined_at?: string; // Add joined_at field for display
  user?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface AddMemberRequest {
  user_id: string;
  role: string;
}

export interface ProjectBudget {
  id: string;
  project_id: string;
  total_budget: number;
  currency: string;
  spent_amount: number;
  remaining_amount: number;
  last_adjusted_at: string;
}

export interface AdjustBudgetRequest {
  amount: number;
  currency: string;
  reason?: string;
}

export interface ProjectOverview {
  project: Project;
  total_members: number;
  total_tasks: number;
  completed_tasks: number;
  budget_status: {
    total_budget: number;
    spent_amount: number;
    remaining_amount: number;
    currency: string;
  };
  timeline_status: {
    start_date: string;
    end_date: string;
    progress_percentage: number;
  };
}

export interface GanttChartData {
  project_id: string;
  tasks: Array<{
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    progress: number;
    dependencies: string[];
    assignee_id?: string;
  }>;
  milestones: Array<{
    id: string;
    name: string;
    date: string;
  }>;
}

// Timeline insight/marker types
export interface TimelineMarkers {
  today: string;
  project_start?: string;
  project_end?: string;
  budget_percent_used?: number;
  forecast_date?: string;
  forecast_confidence_band?: { low_date: string; high_date: string };
}

export interface TimelineRiskItem {
  id: string;
  title: string;
  type: "overdue" | "unassigned" | "estimate_overrun" | "unscheduled";
  severity: "low" | "medium" | "high";
  details: Record<string, any>;
}

export interface TimelineCapacityItem {
  user_id: string;
  user_email?: string;
  available_hours: number;
  booked_hours: number;
  actual_hours: number;
  utilization: number;
  booking_load: number;
  status: string;
}

export interface TimelineSummary {
  project?: { start_date?: string; end_date?: string };
  tasks?: { total: number; with_dates: number; overdue: number; unassigned: number };
}

export interface TimelineBaseline {
  id: string;
  name: string;
  created_at: string;
  tasks: Array<{ id: string; title: string; start_date?: string; end_date?: string; estimate_seconds?: number }>; 
}

export interface TimelineAnnotation {
  id: string;
  date: string;
  text: string;
  type: string;
  task_id: string | null;
  created_by: string;
  created_at: string;
}

export interface TimelineInsights {
  critical_path_task_ids?: string[];
  task_slack_days?: Record<string, number>;
  earned_value?: { cpi?: number; spi?: number; planned_value?: number; earned_value?: number; actual_cost?: number };
  throughput?: { avg_tasks_per_week?: number };
  forecast?: { confidence_band?: { p50?: string; p90?: string } };
}

// Task-related interfaces
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  project_id: string;
  assignee_id?: string;
  estimate_seconds?: number;
  start_date?: string;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  assignee?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export type TaskStatus = "not_started" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface CreateTaskRequest {
  title: string;
  description?: string;
  assignee_id?: string;
  estimate_seconds?: number;
  start_date?: string;
  due_date?: string;
  priority?: TaskPriority;
  project_id: string;
  status?: TaskStatus;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  assignee_id?: string;
  estimate_seconds?: number;
  start_date?: string;
  due_date?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: string;
  due_from?: string;
  due_to?: string;
}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
  limit: number;
  offset: number;
}

// Project API service functions
export const projectApiService = {
  // 1. Create Project
  createProject: async (
    projectData: CreateProjectRequest
  ): Promise<Project> => {
    const response = await api.post(
      API_CONFIG.ENDPOINTS.PROJECTS.BASE,
      projectData
    );
    return response.data;
  },

  // 2. Get All Projects
  getProjects: async (status?: string, search?: string): Promise<Project[]> => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (search) params.append("search", search);

    const response = await api.get(
      `${API_CONFIG.ENDPOINTS.PROJECTS.BASE}?${params.toString()}`
    );
    return response.data;
  },

  // 3. Get Project by ID
  getProjectById: async (projectId: string): Promise<Project> => {
    const response = await api.get(
      API_CONFIG.ENDPOINTS.PROJECTS.BY_ID(projectId)
    );
    return response.data;
  },

  // 4. Update Project
  updateProject: async (
    projectId: string,
    data: UpdateProjectRequest
  ): Promise<Project> => {
    const response = await api.patch(
      API_CONFIG.ENDPOINTS.PROJECTS.BY_ID(projectId),
      data
    );
    return response.data;
  },

  // 5. Archive Project (Soft Delete)
  archiveProject: async (projectId: string): Promise<void> => {
    await api.delete(API_CONFIG.ENDPOINTS.PROJECTS.BY_ID(projectId));
  },

  // 6. Add Member to Project
  addProjectMember: async (
    projectId: string,
    data: AddMemberRequest
  ): Promise<ProjectMember> => {
    const response = await api.post(
      API_CONFIG.ENDPOINTS.PROJECTS.MEMBERS(projectId),
      data
    );
    return response.data;
  },

  // 7. Get Project Members
  getProjectMembers: async (projectId: string): Promise<ProjectMember[]> => {
    const response = await api.get(
      API_CONFIG.ENDPOINTS.PROJECTS.MEMBERS(projectId)
    );
    return response.data;
  },

  // 8. Remove Member from Project
  removeProjectMember: async (
    projectId: string,
    memberId: string
  ): Promise<void> => {
    await api.delete(
      API_CONFIG.ENDPOINTS.PROJECTS.MEMBER_BY_ID(projectId, memberId)
    );
  },

  // 9. Get Project Budget
  getProjectBudget: async (projectId: string): Promise<ProjectBudget> => {
    const response = await api.get(
      API_CONFIG.ENDPOINTS.PROJECTS.BUDGET(projectId)
    );
    return response.data;
  },

  // 10. Adjust Project Budget
  adjustProjectBudget: async (
    projectId: string,
    data: AdjustBudgetRequest
  ): Promise<ProjectBudget> => {
    const response = await api.post(
      API_CONFIG.ENDPOINTS.PROJECTS.BUDGET_ADJUST(projectId),
      data
    );
    return response.data;
  },

  // 11. Get Project Overview
  getProjectOverview: async (projectId: string): Promise<ProjectOverview> => {
    const response = await api.get(
      API_CONFIG.ENDPOINTS.PROJECTS.OVERVIEW(projectId)
    );
    return response.data;
  },

  // 11a. Set my rate for a project (per frontend readme)
  setMyRate: async (
    projectId: string,
    hourly_rate: number
  ): Promise<void> => {
    await api.post(`/projects/${projectId}/my-rate`, { hourly_rate });
  },

  // 12. Get Gantt Chart Data
  getGanttChart: async (projectId: string): Promise<GanttChartData> => {
    const response = await api.get(
      API_CONFIG.ENDPOINTS.PROJECTS.GANTT(projectId)
    );

    // Transform the API response to match GanttChartData structure
    const apiTasks = Array.isArray(response.data) ? response.data : [];
    const today = new Date().toISOString().split("T")[0];

    const transformedData: GanttChartData = {
      project_id: projectId,
      tasks: apiTasks
        .filter((task: any) => task.start_date || task.end_date) // Include tasks with at least one date
        .map((task: any) => {
          // If start_date is missing, use end_date minus 7 days, or today
          let startDate = task.start_date;
          if (!startDate && task.end_date) {
            const endDate = new Date(task.end_date);
            endDate.setDate(endDate.getDate() - 7);
            startDate = endDate.toISOString().split("T")[0];
          } else if (!startDate) {
            startDate = today;
          }

          // If end_date is missing, use start_date plus 7 days, or today
          let endDate = task.end_date;
          if (!endDate && task.start_date) {
            const start = new Date(task.start_date);
            start.setDate(start.getDate() + 7);
            endDate = start.toISOString().split("T")[0];
          } else if (!endDate) {
            endDate = today;
          }

          return {
            id: task.id,
            name: task.title,
            start_date: startDate,
            end_date: endDate,
            progress: task.progress_percent || 0,
            dependencies: task.dependencies || [],
            assignee_id: task.assignees?.[0] || undefined,
          };
        }),
      milestones: [], // API doesn't provide milestones yet
    };

    return transformedData;
  },

  // Timeline: markers
  getTimelineMarkers: async (projectId: string): Promise<TimelineMarkers> => {
    const res = await api.get(API_CONFIG.ENDPOINTS.PROJECTS.TIMELINE.MARKERS(projectId));
    return res.data;
  },

  // Timeline: risks
  getTimelineRisks: async (projectId: string): Promise<TimelineRiskItem[]> => {
    const res = await api.get(API_CONFIG.ENDPOINTS.PROJECTS.TIMELINE.RISKS(projectId));
    return res.data;
  },

  // Timeline: capacity
  getTimelineCapacity: async (
    projectId: string,
    params: { from?: string; to?: string }
  ): Promise<TimelineCapacityItem[]> => {
    const search = new URLSearchParams();
    if (params.from) search.append("from", params.from);
    if (params.to) search.append("to", params.to);
    const res = await api.get(
      `${API_CONFIG.ENDPOINTS.PROJECTS.TIMELINE.CAPACITY(projectId)}?${search.toString()}`
    );
    return res.data;
  },

  // Timeline: summary
  getTimelineSummary: async (projectId: string): Promise<TimelineSummary> => {
    const res = await api.get(API_CONFIG.ENDPOINTS.PROJECTS.TIMELINE.SUMMARY(projectId));
    return res.data;
  },

  // Timeline: baselines
  listBaselines: async (projectId: string): Promise<TimelineBaseline[]> => {
    const res = await api.get(API_CONFIG.ENDPOINTS.PROJECTS.TIMELINE.BASELINES(projectId));
    return res.data;
  },
  createBaseline: async (projectId: string, name: string): Promise<TimelineBaseline> => {
    const res = await api.post(API_CONFIG.ENDPOINTS.PROJECTS.TIMELINE.BASELINES(projectId), { name });
    return res.data;
  },
  deleteBaseline: async (projectId: string, baselineId: string): Promise<void> => {
    await api.delete(API_CONFIG.ENDPOINTS.PROJECTS.TIMELINE.BASELINE_BY_ID(projectId, baselineId));
  },

  // Timeline: annotations
  listAnnotations: async (projectId: string): Promise<TimelineAnnotation[]> => {
    const res = await api.get(API_CONFIG.ENDPOINTS.PROJECTS.TIMELINE.ANNOTATIONS(projectId));
    return res.data;
  },
  addAnnotation: async (
    projectId: string,
    payload: { date: string; text: string; type?: string; task_id?: string | null }
  ): Promise<TimelineAnnotation> => {
    const res = await api.post(API_CONFIG.ENDPOINTS.PROJECTS.TIMELINE.ANNOTATIONS(projectId), payload);
    return res.data;
  },
  deleteAnnotation: async (projectId: string, annotationId: string): Promise<void> => {
    await api.delete(API_CONFIG.ENDPOINTS.PROJECTS.TIMELINE.ANNOTATION_BY_ID(projectId, annotationId));
  },

  // Timeline: insights
  getTimelineInsights: async (projectId: string): Promise<TimelineInsights> => {
    const res = await api.get(API_CONFIG.ENDPOINTS.PROJECTS.TIMELINE.INSIGHTS(projectId));
    return res.data;
  },

  // Timeline: holidays
  getTimelineHolidays: async (
    projectId: string,
    params: { from?: string; to?: string }
  ): Promise<Array<{ date: string; label: string; scope: string }>> => {
    const search = new URLSearchParams();
    if (params.from) search.append("from", params.from);
    if (params.to) search.append("to", params.to);
    const res = await api.get(
      `${API_CONFIG.ENDPOINTS.PROJECTS.TIMELINE.HOLIDAYS(projectId)}?${search.toString()}`
    );
    return res.data;
  },

  // Timeline: prefs
  getTimelinePrefs: async (
    projectId: string
  ): Promise<{ zoom?: string; show_weekends?: boolean; compact_rows?: boolean; compare_baseline_id?: string | null }> => {
    const res = await api.get(API_CONFIG.ENDPOINTS.PROJECTS.TIMELINE.PREFS(projectId));
    return res.data;
  },
  updateTimelinePrefs: async (
    projectId: string,
    prefs: { zoom?: string; show_weekends?: boolean; compact_rows?: boolean; compare_baseline_id?: string | null }
  ): Promise<void> => {
    await api.put(API_CONFIG.ENDPOINTS.PROJECTS.TIMELINE.PREFS(projectId), prefs);
  },
};

// Task API service functions
export const taskApiService = {
  // 1. Create Task
  createTask: async (
    projectId: string,
    taskData: CreateTaskRequest
  ): Promise<Task> => {
    const response = await api.post(
      API_CONFIG.ENDPOINTS.TASKS.BY_PROJECT(projectId),
      {
        ...taskData,
        project_id: projectId,
        status: taskData.status || "not_started",
      }
    );
    return response.data;
  },

  // 2. Get Task by ID
  getTask: async (taskId: string): Promise<Task> => {
    const response = await api.get(API_CONFIG.ENDPOINTS.TASKS.BY_ID(taskId));
    return response.data;
  },

  // 3. Update Task
  updateTask: async (
    taskId: string,
    data: UpdateTaskRequest
  ): Promise<Task> => {
    const response = await api.patch(
      API_CONFIG.ENDPOINTS.TASKS.BY_ID(taskId),
      data
    );
    return response.data;
  },

  // 4. List Tasks
  listTasks: async (
    filters: TaskFilters & {
      project_id?: string;
      organization_id?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<TaskListResponse> => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(
      `${API_CONFIG.ENDPOINTS.TASKS.BASE}?${params.toString()}`
    );
    return response.data;
  },

  // 5. Get Tasks by Project
  getProjectTasks: async (
    projectId: string,
    filters: TaskFilters = {}
  ): Promise<Task[]> => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(
      `${API_CONFIG.ENDPOINTS.TASKS.BY_PROJECT(projectId)}?${params.toString()}`
    );
    return response.data;
  },

  // 6. Complete Task
  completeTask: async (taskId: string): Promise<Task> => {
    const response = await api.post(
      API_CONFIG.ENDPOINTS.TASKS.COMPLETE(taskId),
      {}
    );
    return response.data;
  },

  // 7. Reopen Task
  reopenTask: async (taskId: string): Promise<Task> => {
    const response = await api.post(
      API_CONFIG.ENDPOINTS.TASKS.REOPEN(taskId),
      {}
    );
    return response.data;
  },

  // 8. Delete Task
  deleteTask: async (taskId: string): Promise<void> => {
    await api.delete(API_CONFIG.ENDPOINTS.TASKS.BY_ID(taskId));
  },
};
