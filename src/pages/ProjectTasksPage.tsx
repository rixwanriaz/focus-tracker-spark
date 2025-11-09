// src/pages/ProjectTasksPage.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Plus, BarChart3, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Import our new task components
import { TasksFiltersBar } from "@/features/tasks/components/TasksFiltersBar";
import { TasksTable } from "@/features/tasks/components/TasksTable";
import { TaskFormDialog } from "@/features/tasks/components/TaskFormDialog";
import { ConfirmDeleteDialog } from "@/features/tasks/components/ConfirmDeleteDialog";
import { TaskDetailDrawer } from "@/features/tasks/components/TaskDetailDrawer";

// Import our new hooks
import { useProjectTasks, useCreateTask, useUpdateTask, useDeleteTask, useCompleteTask, useReopenTask, useUpdateTaskStatus } from "@/hooks/tasks";

// Import project data hooks (using existing Redux)
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { getProjectMembers } from "@/redux/slice/projectSlice";

// Types
import { ProjectTaskFilters, Task, CreateTaskRequest, UpdateTaskRequest } from "@/types/task";

interface ProjectMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

const ProjectTasksPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  // Get project info from Redux store
  const { currentProject, projectMembers: rawProjectMembers, loading: projectLoading } = useSelector(
    (state: RootState) => state.project
  );

  // Transform project members data for components
  const projectMembers = React.useMemo(() => {
    return rawProjectMembers.map(member => ({
      id: member.user_id,
      first_name: member.user?.first_name || '',
      last_name: member.user?.last_name || '',
      email: member.user_email,
    }));
  }, [rawProjectMembers]);

  // Parse filters from URL search params
  const [filters, setFilters] = useState<ProjectTaskFilters>(() => {
    const status = searchParams.get("status") as Task["status"] || undefined;
    const priority = searchParams.get("priority") as Task["priority"] || undefined;
    const assignee_id = searchParams.get("assignee_id") || undefined;
    const due_from = searchParams.get("due_from") || undefined;
    const due_to = searchParams.get("due_to") || undefined;
    const search = searchParams.get("search") || undefined;
    const parent_task_id = searchParams.get("parent_task_id") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    return {
      status,
      priority,
      assignee_id,
      due_from,
      due_to,
      search,
      parent_task_id,
      limit,
      offset,
    };
  });

  // Local state for UI
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [creatingSubtaskFor, setCreatingSubtaskFor] = useState<Task | null>(null);
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const detailOpen = !!detailTaskId;

  // React Query hooks
  const { data: tasks = [], isLoading: tasksLoading, error: tasksError } = useProjectTasks(
    projectId!,
    filters
  );

  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const completeTaskMutation = useCompleteTask();
  const reopenTaskMutation = useReopenTask();
  const updateStatusMutation = useUpdateTaskStatus();

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "" && !(key === "limit" && value === 50) && !(key === "offset" && value === 0)) {
        params.set(key, value.toString());
      }
    });

    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  // Load project data
  useEffect(() => {
    if (projectId) {
      dispatch(getProjectMembers(projectId)).catch((error) => {
        console.error("Failed to load project members:", error);
      });
    }
  }, [dispatch, projectId]);

  // Open detail drawer from URL (?taskId=...)
  useEffect(() => {
    const tid = searchParams.get("taskId");
    if (tid) setDetailTaskId(tid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redirect if no projectId
  if (!projectId) {
    navigate("/projects");
    return null;
  }

  // Handle filter changes
  const handleFiltersChange = (newFilters: Partial<ProjectTaskFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      offset: 0, // Reset pagination when filters change
    }));
  };

  // Handle create task
  const handleCreateTask = async (data: Omit<CreateTaskRequest, "project_id">) => {
    await createTaskMutation.mutateAsync({ projectId, data });
    setShowCreateDialog(false);
  };

  // Handle update task
  const handleUpdateTask = async (taskId: string, data: UpdateTaskRequest) => {
    await updateTaskMutation.mutateAsync({ taskId, data });
    setEditingTask(null);
  };

  // Handle delete task
  const handleDeleteTask = async (taskId: string) => {
    await deleteTaskMutation.mutateAsync(taskId);
    setDeletingTask(null);
  };

  // Handle status change
  const handleStatusChange = async (taskId: string, status: Task["status"]) => {
    await updateStatusMutation.mutateAsync({ taskId, status });
  };

  // Handle complete/reopen
  const handleCompleteTask = async (taskId: string) => {
    await completeTaskMutation.mutateAsync({ taskId });
  };

  const handleReopenTask = async (taskId: string) => {
    await reopenTaskMutation.mutateAsync(taskId);
  };

  // Handle subtask creation
  const handleCreateSubtask = (parentTask: Task) => {
    setCreatingSubtaskFor(parentTask);
  };

  // Handle viewing subtasks
  const handleViewSubtasks = (taskId: string) => {
    // Navigate to show only subtasks of this task
    handleFiltersChange({ parent_task_id: taskId });
  };

  // Loading state
  if (projectLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </MainLayout>
    );
  }

  // Project not found
  if (!currentProject) {
    return (
      <MainLayout>
        <Alert>
          <AlertDescription>
            Project not found. <Button variant="link" onClick={() => navigate("/projects")}>Go back to projects</Button>
          </AlertDescription>
        </Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/projects/${projectId}`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Project
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">{currentProject.name}</h1>
                {filters.parent_task_id && (
                  <Badge variant="secondary" className="text-xs">
                    Subtasks
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-gray-400">Tasks</p>
                {filters.parent_task_id && (
                  <>
                    <span className="text-gray-500">•</span>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => handleFiltersChange({ parent_task_id: undefined })}
                      className="h-auto p-0 text-xs text-blue-400 hover:text-blue-300"
                    >
                      View all tasks
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="flex items-center gap-2">
              <BarChart3 className="h-3 w-3" />
              {tasks.length} tasks
            </Badge>
            <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </div>
        </div>

        {/* Filters */}
        <TasksFiltersBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={() => setFilters({ limit: 50, offset: 0 })}
          projectMembers={projectMembers}
        />

        {/* Tasks Table */}
        {tasksError ? (
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load tasks. Please try again.
            </AlertDescription>
          </Alert>
        ) : (
          <TasksTable
            tasks={tasks}
            loading={tasksLoading}
            projectMembers={projectMembers}
            onUpdateTask={handleUpdateTask}
            onStatusChange={handleStatusChange}
            onAssigneeChange={async (taskId, assigneeId) => {
              await updateTaskMutation.mutateAsync({
                taskId,
                data: { assignee_id: assigneeId || undefined }
              });
            }}
            onPriorityChange={async (taskId, priority) => {
              await updateTaskMutation.mutateAsync({
                taskId,
                data: { priority }
              });
            }}
            onDeleteTask={(task) => setDeletingTask(task)}
            onCompleteTask={handleCompleteTask}
            onReopenTask={handleReopenTask}
            onEditTask={(t) => setDetailTaskId(t.id)}
            onCreateSubtask={handleCreateSubtask}
            onViewSubtasks={handleViewSubtasks}
            onOpenDetail={(t) => setDetailTaskId(t.id)}
          />
        )}

        {/* Create Task Dialog */}
        <TaskFormDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSubmit={handleCreateTask}
          loading={createTaskMutation.isLoading}
          projectId={projectId}
          projectMembers={projectMembers}
        />

        {/* Task Detail Drawer */}
        <TaskDetailDrawer
          open={detailOpen}
          onOpenChange={(open) => {
            if (!open) {
              setDetailTaskId(null);
              const params = new URLSearchParams(searchParams);
              params.delete("taskId");
              setSearchParams(params, { replace: true });
            }
          }}
          taskId={detailTaskId}
          projectId={projectId}
          projectMembers={projectMembers}
        />

        {/* Create Subtask Dialog */}
        {creatingSubtaskFor && (
          <TaskFormDialog
            open={!!creatingSubtaskFor}
            onOpenChange={(open) => !open && setCreatingSubtaskFor(null)}
            onSubmit={async (data) => {
              await createTaskMutation.mutateAsync({
                projectId,
                data: { ...data, parent_task_id: creatingSubtaskFor.id, project_id: projectId } as CreateTaskRequest
              });
              setCreatingSubtaskFor(null);
            }}
            loading={createTaskMutation.isLoading}
            projectId={projectId}
            projectMembers={projectMembers}
            parentTask={creatingSubtaskFor}
            mode="create"
          />
        )}

        {/* Delete Confirmation Dialog */}
        {deletingTask && (
          <ConfirmDeleteDialog
            open={!!deletingTask}
            onOpenChange={(open) => !open && setDeletingTask(null)}
            onConfirm={() => handleDeleteTask(deletingTask.id)}
            loading={deleteTaskMutation.isLoading}
            task={deletingTask}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default ProjectTasksPage;
