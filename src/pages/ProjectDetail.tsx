import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ArrowLeft, Users, Calendar, DollarSign, BarChart3, Settings, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/Layout";
import { NewTaskDialog, TaskFiltersComponent, TaskTable } from "@/components/Tasks";
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
  const { projectTasks, loading: tasksLoading, creating, updating, filters, error: taskError } = useSelector(
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
      // Refresh tasks to show the new task
      dispatch(getProjectTasks({ projectId, filters: taskFilters }));
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
      // Refresh tasks to show the updated task
      if (projectId) {
        dispatch(getProjectTasks({ projectId, filters: taskFilters }));
      }
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      await dispatch(updateTaskStatus({ taskId, status })).unwrap();
      toast.success(`Task status updated to ${status}!`);
      // Refresh tasks to show the updated status
      if (projectId) {
        dispatch(getProjectTasks({ projectId, filters: taskFilters }));
      }
    } catch (error) {
      toast.error("Failed to update task status");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await dispatch(deleteTask(taskId)).unwrap();
      toast.success("Task deleted!");
      // Refresh tasks to remove the deleted task
      if (projectId) {
        dispatch(getProjectTasks({ projectId, filters: taskFilters }));
      }
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

  const handleRefreshTasks = () => {
    if (projectId) {
      dispatch(getProjectTasks({ projectId, filters: taskFilters }));
    }
  };

  // Get filtered tasks
  const filteredTasks = projectTasks[projectId || ""] || [];

  // Debug logging (remove in production)
  // console.log("Project ID:", projectId);
  // console.log("Project Tasks:", projectTasks);
  // console.log("Filtered Tasks:", filteredTasks);

  // Format project members for task assignment
  const assignees = projectMembers.map(member => ({
    id: member.user_id,
    first_name: member.user?.first_name || "",
    last_name: member.user?.last_name || "",
  }));

  if (projectLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
          <div className="text-gray-400">Loading project...</div>
        </div>
      </MainLayout>
    );
  }

  if (!currentProject) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white mb-2">Project not found</h2>
            <Button onClick={() => navigate("/projects")} className="bg-purple-600 hover:bg-purple-700">
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
      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/projects")}
                  className="text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Projects
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-white">{currentProject.name}</h1>
                  {currentProject.description && (
                    <p className="text-gray-400 mt-1">{currentProject.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                  {currentProject.status || "Active"}
                </Badge>
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
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
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-400">Team Members</p>
                    <p className="text-lg font-semibold text-white">{projectMembers.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-green-400" />
                  <div>
                    <p className="text-sm text-gray-400">Tasks</p>
                    <p className="text-lg font-semibold text-white">{filteredTasks.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-400">Due Date</p>
                    <p className="text-lg font-semibold text-white">
                      {currentProject.end_date 
                        ? new Date(currentProject.end_date).toLocaleDateString()
                        : "No due date"
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-orange-400" />
                  <div>
                    <p className="text-sm text-gray-400">Budget</p>
                    <p className="text-lg font-semibold text-white">
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
            <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
              <TabsTrigger value="tasks" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400">Tasks</TabsTrigger>
              <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400">Overview</TabsTrigger>
              <TabsTrigger value="members" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400">Members</TabsTrigger>
              <TabsTrigger value="timeline" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="mt-6">
              <div className="space-y-6">
                {/* Task Filters */}
                <Card className="bg-gray-800 border-gray-700">
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
                  <div>
                    <h2 className="text-lg font-semibold text-white">Tasks</h2>
                    {tasksLoading && (
                      <p className="text-sm text-gray-400">Loading tasks...</p>
                    )}
                    {taskError && (
                      <p className="text-sm text-red-400">Error loading tasks: {taskError}</p>
                    )}
                    {!tasksLoading && !taskError && (
                      <p className="text-sm text-gray-400">
                        Total: {filteredTasks.length} tasks
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefreshTasks}
                      disabled={tasksLoading}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      <RefreshCw className={`mr-2 h-4 w-4 ${tasksLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                    <NewTaskDialog
                      projectId={projectId!}
                      onCreateTask={handleCreateTask}
                      assignees={assignees}
                      loading={creating}
                    />
                  </div>
                </div>

                {/* Task Display */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-0">
                    <TaskTable
                      tasks={filteredTasks}
                      onUpdate={handleUpdateTask}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDeleteTask}
                      loading={tasksLoading}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="overview" className="mt-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Project Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  {projectOverview ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-400">Total Tasks</p>
                          <p className="text-2xl font-semibold text-white">{projectOverview.total_tasks}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Completed Tasks</p>
                          <p className="text-2xl font-semibold text-white">{projectOverview.completed_tasks}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Progress</p>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ inlineSize: `${projectOverview.timeline_status?.progress_percentage ?? 0}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {projectOverview.timeline_status?.progress_percentage ?? 0}% complete
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <p>Loading project overview...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="members" className="mt-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Team Members</CardTitle>
                </CardHeader>
                <CardContent>
                  {projectMembers.length > 0 ? (
                    <div className="space-y-3">
                      {projectMembers.map((member) => (
                        <div key={member.id} className="flex items-center gap-3 p-3 border border-gray-700 rounded-lg bg-gray-700">
                          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {member.user?.first_name?.charAt(0)}{member.user?.last_name?.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-white">
                              {member.user?.first_name} {member.user?.last_name}
                            </p>
                            <p className="text-sm text-gray-400">{member.user?.email}</p>
                          </div>
                          <Badge variant="outline" className="border-gray-600 text-gray-300">{member.role}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <p>No team members found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="mt-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Project Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-400">
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
