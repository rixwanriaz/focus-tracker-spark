import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ArrowLeft, Users, Calendar, DollarSign, BarChart3, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/Layout";
import { TaskList, NewTaskDialog, TaskFiltersComponent } from "@/components/Tasks";
import { RootState, AppDispatch } from "@/redux/store";
import {
  getProjectById,
  getProjectMembers,
  getProjectOverview,
  getGanttChart,
} from "@/redux/slice/projectSlice";
import {
  getProjectTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  setFilters,
  clearFilters,
} from "@/redux/slice/taskSlice";
import { Task, TaskFilters, CreateTaskRequest, UpdateTaskRequest, TaskStatus } from "@/redux/api/project";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const { currentProject, projectMembers, projectOverview, loading: projectLoading } = useSelector(
    (state: RootState) => state.project
  );
  const { projectTasks, loading: tasksLoading, creating, updating, filters } = useSelector(
    (state: RootState) => state.task
  );

  // Local state
  const [activeTab, setActiveTab] = useState("tasks");
  const [taskFilters, setTaskFilters] = useState<TaskFilters>({});

  // Load project data
  useEffect(() => {
    if (projectId) {
      dispatch(getProjectById(projectId));
      dispatch(getProjectMembers(projectId));
      dispatch(getProjectOverview(projectId));
      dispatch(getProjectTasks({ projectId }));
    }
  }, [dispatch, projectId]);

  // Task handlers
  const handleCreateTask = async (projectId: string, taskData: CreateTaskRequest) => {
    try {
      await dispatch(createTask({ projectId, data: taskData })).unwrap();
      toast.success("Task created successfully!");
    } catch (error) {
      toast.error("Failed to create task");
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const updateData: UpdateTaskRequest = {
        title: updates.title,
        description: updates.description,
        priority: updates.priority,
        due_date: updates.due_date,
        assignee_id: updates.assignee_id,
        estimate_seconds: updates.estimate_seconds,
      };
      await dispatch(updateTask({ taskId, data: updateData })).unwrap();
      toast.success("Task updated successfully!");
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      await dispatch(updateTaskStatus({ taskId, status })).unwrap();
      toast.success(`Task status updated to ${status}!`);
    } catch (error) {
      toast.error("Failed to update task status");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await dispatch(deleteTask(taskId)).unwrap();
      toast.success("Task deleted!");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  const handleFiltersChange = (newFilters: Partial<TaskFilters>) => {
    const updatedFilters = { ...taskFilters, ...newFilters };
    setTaskFilters(updatedFilters);
    dispatch(setFilters(updatedFilters));
    
    // Reload tasks with new filters
    if (projectId) {
      dispatch(getProjectTasks({ projectId, filters: updatedFilters }));
    }
  };

  const handleClearFilters = () => {
    setTaskFilters({});
    dispatch(clearFilters());
    if (projectId) {
      dispatch(getProjectTasks({ projectId }));
    }
  };

  // Get filtered tasks
  const filteredTasks = projectTasks[projectId || ""] || [];
  const todoTasks = filteredTasks.filter(task => task.status === "not_started");
  const inProgressTasks = filteredTasks.filter(task => task.status === "in_progress");
  const completedTasks = filteredTasks.filter(task => task.status === "completed");

  // Format project members for task assignment
  const assignees = projectMembers.map(member => ({
    id: member.user_id,
    first_name: member.user?.first_name || "",
    last_name: member.user?.last_name || "",
  }));

  if (projectLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-400">Loading project...</div>
        </div>
      </MainLayout>
    );
  }

  if (!currentProject) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Project not found</h2>
            <Button onClick={() => navigate("/projects")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/projects")}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Projects
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{currentProject.name}</h1>
                  {currentProject.description && (
                    <p className="text-gray-600 mt-1">{currentProject.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {currentProject.status || "Active"}
                </Badge>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Project Stats */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Team Members</p>
                    <p className="text-lg font-semibold">{projectMembers.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Tasks</p>
                    <p className="text-lg font-semibold">{filteredTasks.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600">Due Date</p>
                    <p className="text-lg font-semibold">
                      {currentProject.end_date 
                        ? new Date(currentProject.end_date).toLocaleDateString()
                        : "No due date"
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-600">Budget</p>
                    <p className="text-lg font-semibold">
                      {currentProject.budget_amount 
                        ? `${currentProject.budget_currency} ${currentProject.budget_amount.toLocaleString()}`
                        : "No budget"
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 pb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="mt-6">
              <div className="space-y-6">
                {/* Task Filters */}
                <Card>
                  <CardContent className="p-4">
                    <TaskFiltersComponent
                      filters={taskFilters}
                      onFiltersChange={handleFiltersChange}
                      onClearFilters={handleClearFilters}
                      assignees={assignees}
                    />
                  </CardContent>
                </Card>

                {/* Task Creation */}
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
                  <NewTaskDialog
                    projectId={projectId!}
                    onCreateTask={handleCreateTask}
                    assignees={assignees}
                    loading={creating}
                  />
                </div>

                {/* Task Lists */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* To Do */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                        To Do ({todoTasks.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <TaskList
                        tasks={todoTasks}
                        onUpdate={handleUpdateTask}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDeleteTask}
                        emptyMessage="No tasks to do"
                      />
                    </CardContent>
                  </Card>

                  {/* In Progress */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                        In Progress ({inProgressTasks.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <TaskList
                        tasks={inProgressTasks}
                        onUpdate={handleUpdateTask}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDeleteTask}
                        emptyMessage="No tasks in progress"
                      />
                    </CardContent>
                  </Card>

                  {/* Completed */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        Completed ({completedTasks.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <TaskList
                        tasks={completedTasks}
                        onUpdate={handleUpdateTask}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDeleteTask}
                        emptyMessage="No completed tasks"
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="overview" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  {projectOverview ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Total Tasks</p>
                          <p className="text-2xl font-semibold">{projectOverview.total_tasks}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Completed Tasks</p>
                          <p className="text-2xl font-semibold">{projectOverview.completed_tasks}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Progress</p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${projectOverview.timeline_status?.progress_percentage || 0}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {projectOverview.timeline_status?.progress_percentage || 0}% complete
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>Loading project overview...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="members" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Team Members</CardTitle>
                </CardHeader>
                <CardContent>
                  {projectMembers.length > 0 ? (
                    <div className="space-y-3">
                      {projectMembers.map((member) => (
                        <div key={member.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-purple-600">
                              {member.user?.first_name?.charAt(0)}{member.user?.last_name?.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">
                              {member.user?.first_name} {member.user?.last_name}
                            </p>
                            <p className="text-sm text-gray-500">{member.user?.email}</p>
                          </div>
                          <Badge variant="outline">{member.role}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No team members found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <p>Timeline view coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProjectDetail;
