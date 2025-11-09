// src/types/task.ts

/**
 * Task-related types and interfaces matching the API documentation
 */

// Enums
export type TaskStatus = "not_started" | "in_progress" | "blocked" | "completed" | "cancelled";
export type TaskPriority = "low" | "medium" | "high";

// Task interface
export interface Task {
  id: string;
  project_id: string;
  parent_task_id?: string; // null for main tasks
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id?: string;
  assignee_email?: string;
  estimate_seconds?: number;
  start_date?: string;
  due_date?: string;
  completed_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  logged_seconds: number;
  assignee?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

// Comment interface
export interface Comment {
  id: string;
  task_id: string;
  author_id: string;
  body: string;
  created_at: string;
  updated_at: string;
}

// Filter interfaces for project tasks
export interface ProjectTaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: string;
  due_from?: string;
  due_to?: string;
  search?: string;
  parent_task_id?: string; // For viewing subtasks
  limit?: number;
  offset?: number;
}

// Request types for creating/updating tasks
export interface CreateTaskRequest {
  project_id: string;
  parent_task_id?: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: string;
  estimate_seconds?: number;
  start_date?: string;
  due_date?: string;
}

export interface UpdateTaskRequest {
  parent_task_id?: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: string;
  estimate_seconds?: number;
  start_date?: string;
  due_date?: string;
}

// Request for completing a task
export interface CompleteTaskRequest {
  comment?: string;
}

// Response types
export interface TaskListResponse {
  tasks: Task[];
  total?: number;
  limit?: number;
  offset?: number;
}

export interface TaskStatsResponse {
  project_id: string;
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  not_started_tasks: number;
  blocked_tasks: number;
  cancelled_tasks: number;
  overdue_tasks: number;
  progress_percentage: number;
}
