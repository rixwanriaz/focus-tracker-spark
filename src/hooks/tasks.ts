// src/hooks/tasks.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksService, commentsService } from "../services/tasks";
import {
  Task,
  ProjectTaskFilters,
  CreateTaskRequest,
  UpdateTaskRequest,
  CompleteTaskRequest,
} from "../types/task";
import { toast } from "../hooks/use-toast";

/**
 * Query keys for tasks
 */
export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (filters: ProjectTaskFilters) => [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, "detail"] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  projects: () => [...taskKeys.all, "projects"] as const,
  project: (projectId: string, filters: ProjectTaskFilters) =>
    [...taskKeys.projects(), projectId, filters] as const,
  subtasks: (taskId: string) => [...taskKeys.all, "subtasks", taskId] as const,
  comments: (taskId: string) => [...taskKeys.all, "comments", taskId] as const,
};

/**
 * Hook to get tasks for a specific project
 */
export function useProjectTasks(projectId: string, filters: ProjectTaskFilters = {}) {
  return useQuery({
    queryKey: taskKeys.project(projectId, filters),
    queryFn: () => tasksService.listByProject(projectId, filters),
    staleTime: 30_000, // 30 seconds
    keepPreviousData: true,
  });
}

/**
 * Hook to get a single task by ID
 */
export function useTask(taskId: string) {
  return useQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn: () => tasksService.getById(taskId),
    enabled: !!taskId,
    staleTime: 30_000,
  });
}

/**
 * Hook to get subtasks for a parent task
 */
export function useSubtasks(taskId: string) {
  return useQuery({
    queryKey: taskKeys.subtasks(taskId),
    queryFn: () => tasksService.listSubtasks(taskId),
    enabled: !!taskId,
    staleTime: 30_000,
  });
}

/**
 * Hooks for task comments
 */
export function useTaskComments(taskId: string) {
  return useQuery({
    queryKey: taskKeys.comments(taskId),
    queryFn: () => commentsService.listByTask(taskId),
    enabled: !!taskId,
    staleTime: 10_000,
  });
}

export function useCreateComment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => commentsService.create(taskId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.comments(taskId) });
    },
  });
}

export function useUpdateComment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, body }: { commentId: string; body: string }) => commentsService.update(commentId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.comments(taskId) });
    },
  });
}

export function useDeleteComment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => commentsService.remove(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.comments(taskId) });
    },
  });
}

/**
 * Hook to create a new task
 */
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: Omit<CreateTaskRequest, "project_id"> }) =>
      tasksService.createByProject(projectId, data),
    onSuccess: (newTask) => {
      // Invalidate and refetch project tasks
      queryClient.invalidateQueries({
        queryKey: taskKeys.projects(),
      });

      toast({
        title: "Task created",
        description: `"${newTask.title}" has been created successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create task",
        description: error?.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to update a task
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskRequest }) =>
      tasksService.update(taskId, data),
    onSuccess: (updatedTask) => {
      // Update the task in cache
      queryClient.setQueryData(taskKeys.detail(updatedTask.id), updatedTask);

      // Invalidate project tasks to refetch the list
      queryClient.invalidateQueries({
        queryKey: taskKeys.projects(),
      });

      toast({
        title: "Task updated",
        description: `"${updatedTask.title}" has been updated successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update task",
        description: error?.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to delete a task
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => tasksService.remove(taskId),
    onSuccess: (_, taskId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: taskKeys.detail(taskId) });

      // Invalidate project tasks
      queryClient.invalidateQueries({
        queryKey: taskKeys.projects(),
      });

      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete task",
        description: error?.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to complete a task
 */
export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, comment }: { taskId: string; comment?: string }) =>
      tasksService.complete(taskId, { comment }),
    onSuccess: (updatedTask) => {
      // Update the task in cache
      queryClient.setQueryData(taskKeys.detail(updatedTask.id), updatedTask);

      // Invalidate project tasks
      queryClient.invalidateQueries({
        queryKey: taskKeys.projects(),
      });

      toast({
        title: "Task completed",
        description: `"${updatedTask.title}" has been marked as completed.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to complete task",
        description: error?.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to reopen a completed task
 */
export function useReopenTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => tasksService.reopen(taskId),
    onSuccess: (updatedTask) => {
      // Update the task in cache
      queryClient.setQueryData(taskKeys.detail(updatedTask.id), updatedTask);

      // Invalidate project tasks
      queryClient.invalidateQueries({
        queryKey: taskKeys.projects(),
      });

      toast({
        title: "Task reopened",
        description: `"${updatedTask.title}" has been reopened.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to reopen task",
        description: error?.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook to update task status (optimistic updates)
 */
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: Task["status"] }) =>
      tasksService.update(taskId, { status }),
    onMutate: async ({ taskId, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.detail(taskId) });
      await queryClient.cancelQueries({ queryKey: taskKeys.projects() });

      // Snapshot previous values
      const previousTask = queryClient.getQueryData<Task>(taskKeys.detail(taskId));
      const previousProjectTasks = queryClient.getQueriesData({
        queryKey: taskKeys.projects(),
      });

      // Optimistically update task status
      if (previousTask) {
        queryClient.setQueryData(taskKeys.detail(taskId), {
          ...previousTask,
          status,
          completed_at: status === "completed" ? new Date().toISOString() : null,
        });
      }

      // Update in project task lists
      previousProjectTasks.forEach(([queryKey, data]) => {
        if (Array.isArray(data)) {
          const updatedTasks = data.map((task: Task) =>
            task.id === taskId
              ? { ...task, status, completed_at: status === "completed" ? new Date().toISOString() : null }
              : task
          );
          queryClient.setQueryData(queryKey, updatedTasks);
        }
      });

      return { previousTask, previousProjectTasks };
    },
    onError: (_, __, context) => {
      // Revert optimistic updates on error
      if (context?.previousTask) {
        queryClient.setQueryData(taskKeys.detail(context.previousTask.id), context.previousTask);
      }

      if (context?.previousProjectTasks) {
        context.previousProjectTasks.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      toast({
        title: "Failed to update task status",
        description: "The task status could not be updated. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: (updatedTask) => {
      toast({
        title: "Status updated",
        description: `Task status changed to ${updatedTask.status.replace("_", " ")}.`,
      });
    },
  });
}
