// src/services/tasks.ts
import { api } from "../service/api";
import { API_CONFIG } from "../config/api.config";
import {
  Task,
  Comment,
  ProjectTaskFilters,
  CreateTaskRequest,
  UpdateTaskRequest,
  CompleteTaskRequest,
  TaskListResponse,
  TaskStatsResponse,
} from "../types/task";

/**
 * Tasks API service
 * Provides methods to interact with the tasks API endpoints
 */

export const tasksService = {
  /**
   * Create a new task directly
   */
  createDirect: async (taskData: CreateTaskRequest): Promise<Task> => {
    const response = await api.post(API_CONFIG.ENDPOINTS.TASKS.BASE, taskData);
    return response.data;
  },

  /**
   * Create a new task for a specific project
   */
  createByProject: async (projectId: string, taskData: Omit<CreateTaskRequest, "project_id">): Promise<Task> => {
    const response = await api.post(API_CONFIG.ENDPOINTS.TASKS.BY_PROJECT(projectId), taskData);
    return response.data;
  },

  /**
   * List tasks with optional filters (organization-wide)
   */
  list: async (filters: ProjectTaskFilters = {}): Promise<TaskListResponse> => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(
      `${API_CONFIG.ENDPOINTS.TASKS.BASE}?${params.toString()}`
    );
    return response.data;
  },

  /**
   * List tasks for a specific project with filters
   */
  listByProject: async (projectId: string, filters: ProjectTaskFilters = {}): Promise<Task[]> => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(
      `${API_CONFIG.ENDPOINTS.TASKS.BY_PROJECT(projectId)}?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get a specific task by ID
   */
  getById: async (taskId: string): Promise<Task> => {
    const response = await api.get(API_CONFIG.ENDPOINTS.TASKS.BY_ID(taskId));
    return response.data;
  },

  /**
   * Update a task
   */
  update: async (taskId: string, updates: UpdateTaskRequest): Promise<Task> => {
    const response = await api.patch(API_CONFIG.ENDPOINTS.TASKS.BY_ID(taskId), updates);
    return response.data;
  },

  /**
   * Complete a task
   */
  complete: async (taskId: string, request: CompleteTaskRequest = {}): Promise<Task> => {
    const response = await api.post(API_CONFIG.ENDPOINTS.TASKS.COMPLETE(taskId), request);
    return response.data;
  },

  /**
   * Reopen a completed task
   */
  reopen: async (taskId: string): Promise<Task> => {
    const response = await api.post(API_CONFIG.ENDPOINTS.TASKS.REOPEN(taskId), {});
    return response.data;
  },

  /**
   * Delete a task
   */
  remove: async (taskId: string): Promise<void> => {
    await api.delete(API_CONFIG.ENDPOINTS.TASKS.BY_ID(taskId));
  },

  /**
   * List subtasks for a parent task
   */
  listSubtasks: async (taskId: string): Promise<Task[]> => {
    const response = await api.get(API_CONFIG.ENDPOINTS.TASKS.SUBTASKS(taskId));
    return response.data;
  },

  /**
   * Get project task statistics
   */
  getProjectStats: async (projectId: string): Promise<TaskStatsResponse> => {
    const response = await api.get(API_CONFIG.ENDPOINTS.TASKS.STATS(projectId));
    return response.data;
  },
};

/**
 * Comments API service
 */
export const commentsService = {
  /**
   * List comments for a task
   */
  listByTask: async (taskId: string): Promise<Comment[]> => {
    const response = await api.get(API_CONFIG.ENDPOINTS.TASKS.COMMENTS(taskId));
    return response.data;
  },

  /**
   * Create a comment on a task
   */
  create: async (taskId: string, body: string): Promise<Comment> => {
    const response = await api.post(API_CONFIG.ENDPOINTS.TASKS.COMMENTS(taskId), { body });
    return response.data;
  },

  /**
   * Update a comment
   */
  update: async (commentId: string, body: string): Promise<Comment> => {
    const response = await api.patch(API_CONFIG.ENDPOINTS.COMMENTS.BY_ID(commentId), { body });
    return response.data;
  },

  /**
   * Delete a comment
   */
  remove: async (commentId: string): Promise<void> => {
    await api.delete(API_CONFIG.ENDPOINTS.COMMENTS.BY_ID(commentId));
  },
};
