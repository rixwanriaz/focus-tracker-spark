// src/redux/api/project.ts
import { api } from "../../service/api";
import { API_CONFIG } from "../../config/api.config";

// Types for Project API requests and responses
export interface Project {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  budget_amount: number;
  budget_currency: string;
  project_manager_id: string;
  client_id: string;
  created_at: string;
  updated_at: string;
  status?: string;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  budget_amount: number;
  budget_currency: string;
  project_manager_id: string;
  client_id: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  budget_amount?: number;
  budget_currency?: string;
  project_manager_id?: string;
  client_id?: string;
}

export interface ProjectMember {
  id: string;
  user_id: string;
  project_id: string;
  role: string;
  joined_at: string;
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
  getProjects: async (): Promise<Project[]> => {
    const response = await api.get(API_CONFIG.ENDPOINTS.PROJECTS.BASE);
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

  // 5. Delete Project
  deleteProject: async (projectId: string): Promise<void> => {
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

  // 12. Get Gantt Chart Data
  getGanttChart: async (projectId: string): Promise<GanttChartData> => {
    const response = await api.get(
      API_CONFIG.ENDPOINTS.PROJECTS.GANTT(projectId)
    );
    return response.data;
  },
};
