import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  ArrowLeft,
  Users,
  Calendar,
  DollarSign,
  BarChart3,
  RefreshCw,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/Layout";
import {
  NewTaskDialog,
  TaskFiltersComponent,
  TaskTable,
} from "@/components/Tasks";
import { ProjectMembersTab } from "@/components/Projects";
import ProjectTimeline from "@/components/Projects/ProjectTimeline";
import { ProjectUserCostsTab, ProjectExpensesTab } from "@/components/Finance";
import { CalendarPicker } from "@/components/ui/calendar-picker";
import { PermissionGate } from "@/components/ui/PermissionGate";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, XAxis, YAxis } from "recharts";
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
import {
  Task,
  TaskFilters,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskStatus,
} from "@/redux/api/project";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { fetchProjectFinancials, fetchProjectUserCosts, fetchMyProjectCost } from "@/redux/slice/financeSlice";
import { getForecast } from "@/redux/slice/reportsSlice";

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const {
    currentProject,
    projectMembers,
    projectOverview,
    loading: projectLoading,
    loadingMembers,
  } = useSelector((state: RootState) => state.project);

  const {
    projectTasks,
    loading: tasksLoading,
    creating,
    updating,
    filters,
    error: taskError,
  } = useSelector((state: RootState) => state.task);

  // Local state
  const [activeTab, setActiveTab] = useState("tasks");
  const [taskFilters, setTaskFilters] = useState<TaskFilters>({});
  const [startDate, setStartDate] = useState<Date | undefined>(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState<Date | undefined>(() => new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999));

  // Load project data
  useEffect(() => {
    if (projectId) {
      dispatch(getProjectById(projectId));
      dispatch(getProjectMembers(projectId)).catch((error) => {
        console.error("Failed to load project members:", error);
      });
      dispatch(getProjectOverview(projectId));
      dispatch(getProjectTasks({ projectId }));
      // Finance + forecast summary
      dispatch(fetchProjectFinancials(projectId));
      dispatch(getForecast({ projectId }));
    }
  }, [dispatch, projectId]);

  // Fetch per-user costs on date changes
  useEffect(() => {
    if (!projectId) return;
    const start = startDate ? startDate.toISOString() : undefined;
    const end = endDate ? endDate.toISOString() : undefined;
    dispatch(fetchProjectUserCosts({ project_id: projectId, start, end }));
    dispatch(fetchMyProjectCost({ project_id: projectId, start, end }));
  }, [dispatch, projectId, startDate, endDate]);

  // Task handlers
  const handleCreateTask = async (
    projectId: string,
    taskData: CreateTaskRequest
  ) => {
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

  // Calculate total hours from tasks
  const totalHours = filteredTasks.reduce((total, task) => {
    if (task.estimate_seconds) {
      return total + task.estimate_seconds / 3600; // Convert seconds to hours
    }
    return total;
  }, 0);

  // Format project members for task assignment
  const assigneesForFilters = projectMembers.map((member) => ({
    id: member.user_id,
    first_name:
      member.user?.first_name || member.user_email?.split("@")[0] || "",
    last_name: member.user?.last_name || "",
  }));

  const assigneesForDialog = projectMembers.map((member) => ({
    id: member.user_id,
    email: member.user_email,
  }));

  // Finance + forecast state
  const financeState = useSelector((s: RootState) => s.finance);
  const reportsState = useSelector((s: RootState) => s.reports);
  const financials = financeState.projectFinancials[currentProject?.id || ""];
  const userCostsKey = `${projectId || ""}|${startDate ? startDate.toISOString() : ""}|${endDate ? endDate.toISOString() : ""}`;
  const userCosts = financeState.projectUserCosts[userCostsKey];
  const forecast = reportsState.forecast[currentProject?.id || ""];

  const currency = currentProject?.budget_currency || financials?.currency || "USD";
  const budgetTotal = currentProject?.budget_amount ?? financials?.budget_amount ?? 0;
  const laborCost = financials?.freelancer_cost ?? 0;
  const expensesCost = financials?.expenses ?? 0;
  const spent = laborCost + expensesCost;
  const remaining = Math.max(0, (budgetTotal || 0) - spent);

  // Burn rate (simple): spent / days elapsed (in selected range if present)
  const rangeStart = startDate || (currentProject?.start_date ? new Date(currentProject.start_date) : undefined);
  const rangeEnd = endDate || new Date();
  const daysElapsed = rangeStart ? Math.max(1, Math.ceil(((rangeEnd as Date).getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24))) : undefined;
  const burnPerDay = daysElapsed ? spent / daysElapsed : undefined;
  const daysToExhaust = burnPerDay && burnPerDay > 0 ? Math.max(0, Math.floor(remaining / burnPerDay)) : undefined;

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
            <h2 className="text-xl font-semibold text-white mb-2">
              Project not found
            </h2>
            <Button
              onClick={() => navigate("/projects")}
              className="bg-purple-600 hover:bg-purple-700"
            >
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
      <div className="min-h-screen bg-gray-950">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-800/50 shadow-xl">
          <div className="px-6 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/projects")}
                  className="text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all hover:scale-105"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      {currentProject.name}
                    </h1>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-semibold px-3 py-1",
                        currentProject.is_active ||
                          currentProject.status?.toLowerCase() === "active"
                          ? "bg-green-900/30 border-green-800 text-green-400"
                          : "bg-gray-800 border-gray-600 text-gray-300"
                      )}
                    >
                      {currentProject.status || "Active"}
                    </Badge>
                  </div>
                  {currentProject.description && (
                    <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
                      {currentProject.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  onClick={() =>
                    navigate(`/invoices?project_id=${currentProject.id}`)
                  }
                  className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white shadow-lg hover:scale-105 transition-transform"
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Create Invoice
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Project Stats */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 border-blue-800/50 hover:border-blue-700 transition-all hover:shadow-xl hover:scale-105 group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-blue-300 group-hover:text-blue-200 transition-colors">
                      Team Members
                    </p>
                    <p className="text-3xl font-bold text-white">
                      {projectMembers.length}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-900/40 rounded-xl border border-blue-800/50 group-hover:bg-blue-900/60 transition-colors">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-900/30 to-green-800/10 border-green-800/50 hover:border-green-700 transition-all hover:shadow-xl hover:scale-105 group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-green-300 group-hover:text-green-200 transition-colors">
                      Tasks
                    </p>
                    <p className="text-3xl font-bold text-white">
                      {filteredTasks.length}
                    </p>
                  </div>
                  <div className="p-3 bg-green-900/40 rounded-xl border border-green-800/50 group-hover:bg-green-900/60 transition-colors">
                    <BarChart3 className="h-6 w-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border-purple-800/50 hover:border-purple-700 transition-all hover:shadow-xl hover:scale-105 group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-purple-300 group-hover:text-purple-200 transition-colors">
                      Due Date
                    </p>
                    <p className="text-xl font-bold text-white">
                      {currentProject?.end_date
                        ? new Date(currentProject.end_date).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" }
                          )
                        : "No date"}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-900/40 rounded-xl border border-purple-800/50 group-hover:bg-purple-900/60 transition-colors">
                    <Calendar className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-900/30 to-orange-800/10 border-orange-800/50 hover:border-orange-700 transition-all hover:shadow-xl hover:scale-105 group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-orange-300 group-hover:text-orange-200 transition-colors">
                      Budget
                    </p>
                    <p className="text-xl font-bold text-white">
                      {currentProject.budget_amount
                        ? `${
                            currentProject.budget_currency
                          } ${currentProject.budget_amount.toLocaleString()}`
                        : "No budget"}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-900/40 rounded-xl border border-orange-800/50 group-hover:bg-orange-900/60 transition-colors">
                    <DollarSign className="h-6 w-6 text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 pb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6 bg-gray-900 border border-gray-800 rounded-xl p-1 shadow-lg">
              <TabsTrigger
                value="tasks"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white text-gray-400 hover:text-gray-300 transition-all data-[state=active]:shadow-lg rounded-lg font-medium"
              >
                Tasks
              </TabsTrigger>
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white text-gray-400 hover:text-gray-300 transition-all data-[state=active]:shadow-lg rounded-lg font-medium"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="members"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white text-gray-400 hover:text-gray-300 transition-all data-[state=active]:shadow-lg rounded-lg font-medium"
              >
                Team Members{" "}
              </TabsTrigger>
              <TabsTrigger
                value="timeline"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white text-gray-400 hover:text-gray-300 transition-all data-[state=active]:shadow-lg rounded-lg font-medium"
              >
                Timeline
              </TabsTrigger>
              <TabsTrigger
                value="costs"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white text-gray-400 hover:text-gray-300 transition-all data-[state=active]:shadow-lg rounded-lg font-medium"
              >
                Costs
              </TabsTrigger>
              <TabsTrigger
                value="expenses"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white text-gray-400 hover:text-gray-300 transition-all data-[state=active]:shadow-lg rounded-lg font-medium"
              >
                Expenses
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="mt-6">
              <div className="space-y-6">
                {/* Task Filters */}
                <Card className="bg-gray-900 border-gray-800 shadow-lg rounded-xl">
                  <CardContent className="p-5">
                    <TaskFiltersComponent
                      filters={taskFilters}
                      onFiltersChange={handleFiltersChange}
                      onClearFilters={handleClearFilters}
                      assignees={assigneesForFilters}
                    />
                  </CardContent>
                </Card>

                {/* Task Creation */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 bg-gray-900 border border-gray-800 rounded-xl shadow-lg">
                  <div>
                    <h2 className="text-xl font-bold text-white">Tasks</h2>
                    {tasksLoading && (
                      <p className="text-sm text-gray-400 mt-1">
                        Loading tasks...
                      </p>
                    )}
                    {taskError && (
                      <p className="text-sm text-red-400 mt-1">
                        Error loading tasks: {taskError}
                      </p>
                    )}
                    {!tasksLoading && !taskError && (
                      <p className="text-sm text-gray-400 mt-1">
                        Total:{" "}
                        <span className="font-semibold text-purple-400">
                          {filteredTasks.length}
                        </span>{" "}
                        tasks
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefreshTasks}
                      disabled={tasksLoading}
                      className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white hover:scale-105 transition-all"
                    >
                      <RefreshCw
                        className={`mr-2 h-4 w-4 ${
                          tasksLoading ? "animate-spin" : ""
                        }`}
                      />
                      Refresh
                    </Button>
                    <NewTaskDialog
                      projectId={projectId!}
                      onCreateTask={handleCreateTask}
                      assignees={assigneesForDialog}
                      assigneesLoading={loadingMembers}
                      onEnsureAssignees={() => {
                        if (projectId) {
                          dispatch(getProjectMembers(projectId));
                        }
                      }}
                      loading={creating}
                    />
                  </div>
                </div>

                {/* Task Display */}
                <Card className="bg-gray-900 border-gray-800 shadow-xl rounded-xl overflow-hidden">
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
              {/* Date range filter */}
              <Card className="bg-gray-900 border-gray-800 shadow-xl rounded-xl mb-6">
                <CardContent className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Start date</p>
                      <CalendarPicker value={startDate} onChange={setStartDate} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">End date</p>
                      <CalendarPicker value={endDate} onChange={setEndDate} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* KPI cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                <Card className="bg-gradient-to-br from-orange-900/30 to-orange-800/10 border-orange-800/50">
                  <CardContent className="p-5">
                    <p className="text-sm text-orange-300">Budget</p>
                    <p className="text-2xl font-bold text-white mt-1">{currency} {Number(budgetTotal || 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">Remaining: {currency} {Number(remaining).toLocaleString()}</p>
                  </CardContent>
                </Card>
                <PermissionGate permission="finance:read" fallback={<Card className="bg-gray-900 border-gray-800"><CardContent className="p-5"><p className="text-sm text-gray-400">Spent to date (requires finance access)</p></CardContent></Card>}>
                  <Card className="bg-gradient-to-br from-green-900/30 to-green-800/10 border-green-800/50">
                    <CardContent className="p-5">
                      <p className="text-sm text-green-300">Spent to Date</p>
                      <p className="text-2xl font-bold text-white mt-1">{currency} {Number(spent).toLocaleString()}</p>
                      <p className="text-xs text-gray-400 mt-1">Labor {currency} {Number(laborCost).toLocaleString()} · Expenses {currency} {Number(expensesCost).toLocaleString()}</p>
                    </CardContent>
                  </Card>
                </PermissionGate>
                <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border-purple-800/50">
                  <CardContent className="p-5">
                    <p className="text-sm text-purple-300">Progress</p>
                    <p className="text-2xl font-bold text-white mt-1">{projectOverview?.timeline_status?.progress_percentage ?? 0}%</p>
                    <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full" style={{ width: `${projectOverview?.timeline_status?.progress_percentage ?? 0}%` }} />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 border-blue-800/50">
                  <CardContent className="p-5">
                    <p className="text-sm text-blue-300">Burn & Forecast</p>
                    <p className="text-2xl font-bold text-white mt-1">{burnPerDay ? `${currency} ${burnPerDay.toFixed(2)}/day` : "—"}</p>
                    <p className="text-xs text-gray-400 mt-1">Days to Exhaustion: {daysToExhaust ?? "—"}{forecast?.predicted_budget_exhausted_date ? ` · P50 ${new Date(forecast.predicted_budget_exhausted_date).toLocaleDateString()}` : ""}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Team Hours */}
              <PermissionGate permission="finance:read" fallback={<></>}>
                <Card className="bg-gray-900 border-gray-800 shadow-xl rounded-xl mb-6">
                  <CardHeader className="border-b border-gray-800">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-400" />
                      Team Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5">
                    {userCosts?.users?.length ? (
                      <ChartContainer config={{ hours: { label: "Hours", color: "#60a5fa" } }} className="h-64">
                        <BarChart data={userCosts.users.map(u => ({ name: u.user_email, hours: u.hours }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                          <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                          <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="hours" fill="var(--color-hours)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ChartContainer>
                    ) : (
                      <p className="text-gray-400 text-sm">No cost data for the selected range.</p>
                    )}
                  </CardContent>
                </Card>
              </PermissionGate>

              {/* Team Costs */}
              <PermissionGate permission="finance:read" fallback={<></>}>
                <Card className="bg-gray-900 border-gray-800 shadow-xl rounded-xl mb-6">
                  <CardHeader className="border-b border-gray-800">
                    <CardTitle className="text-white flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-emerald-400" />
                      Team Costs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5">
                    {userCosts?.users?.length ? (
                      <ChartContainer config={{ cost: { label: "Cost", color: "#34d399" } }} className="h-64">
                        <BarChart data={userCosts.users.map(u => ({ name: u.user_email, cost: u.cost }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                          <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                          <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="cost" fill="var(--color-cost)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ChartContainer>
                    ) : (
                      <p className="text-gray-400 text-sm">No cost data for the selected range.</p>
                    )}
                  </CardContent>
                </Card>
              </PermissionGate>

              {/* Cost breakdown */}
              <PermissionGate permission="finance:read" fallback={<></>}>
                <Card className="bg-gray-900 border-gray-800 shadow-xl rounded-xl">
                  <CardHeader className="border-b border-gray-800">
                    <CardTitle className="text-white">Cost Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="p-5">
                    <div className="text-sm text-gray-300">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-sm" style={{ background: "#34d399" }} />
                        <span>Labor: {currency} {Number(laborCost).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="h-3 w-3 rounded-sm" style={{ background: "#f97316" }} />
                        <span>Expenses: {currency} {Number(expensesCost).toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </PermissionGate>
            </TabsContent>

            <TabsContent value="members" className="mt-6">
              <ProjectMembersTab projectId={projectId!} />
            </TabsContent>

            <TabsContent value="timeline" className="mt-6">
              {projectId && <ProjectTimeline projectId={projectId} />}
            </TabsContent>

            <TabsContent value="costs" className="mt-6">
              <ProjectUserCostsTab projectId={projectId!} />
            </TabsContent>

            <TabsContent value="expenses" className="mt-6">
              <ProjectExpensesTab projectId={projectId!} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProjectDetail;
