import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/Layout';
import { GanttChart, TimeFilters, TimeReportTable, LeaderboardTable, CapacityTable, ExportsPanel, ForecastPanel } from '@/components/Reports';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { getProjects, getGanttChart } from '@/redux/slice/projectSlice';
import { api } from '@/service/api';
import { API_CONFIG } from '@/config/api.config';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Calendar, TrendingUp, Clock, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchTimeReport, downloadTimeCsv, fetchLeaderboard, fetchCapacity, setLastTimeQuery } from '@/redux/slice/reportsSlice';
import { useToast } from '@/hooks/use-toast';
import type { TimeReportQuery } from '@/redux/api/reports';

const Reports: React.FC = () => {
  const dispatch = useAppDispatch();
  const projectState = useAppSelector((state) => state.project);
  const { projects = [], ganttChartData, loadingGantt } = projectState || {};
  const reportsState = useAppSelector((state) => state.reports);
  const { timeReport, leaderboard, capacity, loading, lastQuery } = reportsState || ({} as any);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [ganttApiTasks, setGanttApiTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const { toast } = useToast();

  // Time report filters state
  const todayIso = new Date().toISOString().slice(0, 10);
  const firstOfMonth = (() => { const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10); })();
  const [filters, setFilters] = useState<TimeReportQuery>({
    from_date: lastQuery?.from_date || firstOfMonth,
    to_date: lastQuery?.to_date || todayIso,
    group_by: lastQuery?.group_by || 'project',
    limit: lastQuery?.limit ?? 50,
    offset: lastQuery?.offset ?? 0,
  });

  useEffect(() => {
    dispatch(getProjects());
  }, [dispatch]);

  useEffect(() => {
    // Auto-select first project if available and none is selected
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  useEffect(() => {
    // Fetch Gantt chart data and tasks when project is selected
    if (selectedProjectId) {
      dispatch(getGanttChart(selectedProjectId));
      
      // Fetch project tasks
      setLoadingTasks(true);
      
      // Fetch tasks with progress_percent from Gantt API
      api.get(API_CONFIG.ENDPOINTS.PROJECTS.GANTT(selectedProjectId))
        .then((response) => {
          const tasksWithProgress = Array.isArray(response.data) ? response.data : [];
          setGanttApiTasks(tasksWithProgress);
        })
        .catch((error) => {
          console.error('Error fetching gantt tasks:', error);
        })
        .finally(() => {
          setLoadingTasks(false);
        });
    }
  }, [selectedProjectId, dispatch]);

  // Prefetch basic reports on mount for better UX
  useEffect(() => {
    if (!timeReport) {
      dispatch(fetchTimeReport(filters));
      dispatch(setLastTimeQuery(filters));
    }
    if (!leaderboard) dispatch(fetchLeaderboard({ sort_by: 'profitability', limit: 10 }));
    if (!capacity) dispatch(fetchCapacity({ from_date: filters.from_date, to_date: filters.to_date }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runTimeReport = async () => {
    // basic validation to avoid 422s
    const from = filters.from_date;
    const to = filters.to_date;
    const isIso = (s?: string) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
    if (!isIso(from) || !isIso(to)) {
      return toast({ title: 'Invalid dates', description: 'Use YYYY-MM-DD format', variant: 'destructive' as any });
    }
    if (new Date(from!) > new Date(to!)) {
      return toast({ title: 'Invalid range', description: 'From date must be before To date', variant: 'destructive' as any });
    }
    try {
      await dispatch(fetchTimeReport(filters)).unwrap();
      dispatch(setLastTimeQuery(filters));
    } catch (e: any) {
      toast({ title: 'Failed to load report', description: String(e), variant: 'destructive' as any });
    }
  };

  const onDownloadCsv = async () => {
    try {
      const blob = await dispatch(downloadTimeCsv(filters)).unwrap();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `time-report_${filters.from_date || ''}_${filters.to_date || ''}.csv`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
      toast({ title: 'CSV downloaded' });
    } catch (e: any) {
      toast({ title: 'CSV download failed', description: String(e), variant: 'destructive' as any });
    }
  };

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // Calculate task statistics from ganttApiTasks (which has progress_percent)
  const totalTasks = ganttApiTasks.length;
  const completedTasks = ganttApiTasks.filter((t: any) => t.progress_percent === 100).length;
  const inProgressTasks = ganttApiTasks.filter((t: any) => t.progress_percent > 0 && t.progress_percent < 100).length;
  const notStartedTasks = ganttApiTasks.filter((t: any) => t.progress_percent === 0).length;
  const tasksWithDates = ganttApiTasks.filter((t: any) => t.start_date && t.end_date).length;
  const tasksWithoutDates = ganttApiTasks.filter((t: any) => !t.start_date || !t.end_date).length;
  
  // Calculate average progress from all tasks using actual progress_percent
  const averageProgress = totalTasks > 0 
    ? Math.round(ganttApiTasks.reduce((sum: number, t: any) => sum + (t.progress_percent || 0), 0) / totalTasks)
    : 0;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-950 text-white p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-purple-500" />
                Reports & Analytics
              </h1>
              <p className="text-gray-400">View and analyze your project timelines and progress.</p>
            </div>
            <Button
              variant="outline"
              className="border-gray-700 hover:bg-gray-800"
              onClick={() => selectedProjectId && dispatch(getGanttChart(selectedProjectId))}
            >
              Refresh Data
            </Button>
          </div>

          {/* Project Selector */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white text-lg">Select Project</CardTitle>
              <CardDescription>Choose a project to view its Gantt chart timeline</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedProjectId} onValueChange={handleProjectChange}>
                <SelectTrigger className="w-full md:w-96 bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <span>{project.name}</span>
                        {project.status && (
                          <span className="text-xs text-gray-400">({project.status})</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedProject && (
                <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Project:</span>
                      <span className="ms-2 text-white font-medium">{selectedProject.name}</span>
                    </div>
                    {selectedProject.start_date && (
                      <div>
                        <span className="text-gray-400">Start Date:</span>
                        <span className="ms-2 text-white">
                          {new Date(selectedProject.start_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {selectedProject.end_date && (
                      <div>
                        <span className="text-gray-400">End Date:</span>
                        <span className="ms-2 text-white">
                          {new Date(selectedProject.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  {selectedProject.description && (
                    <p className="mt-3 text-gray-400 text-sm">{selectedProject.description}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Task Statistics */}
        {selectedProjectId && (
          <div className="mb-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-purple-500" />
                  Task Overview
                </CardTitle>
                <CardDescription>Summary of all tasks in this project</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingTasks ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {/* Total Tasks */}
                    <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div className="text-3xl font-bold text-white mb-1">{totalTasks}</div>
                      <div className="text-sm text-gray-400">Total Tasks</div>
                    </div>
                    
                    {/* Completed */}
                    <div className="p-4 bg-green-950/30 rounded-lg border border-green-900/50">
                      <div className="text-3xl font-bold text-green-500 mb-1">{completedTasks}</div>
                      <div className="text-sm text-gray-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Completed
                      </div>
                    </div>
                    
                    {/* In Progress */}
                    <div className="p-4 bg-blue-950/30 rounded-lg border border-blue-900/50">
                      <div className="text-3xl font-bold text-blue-500 mb-1">{inProgressTasks}</div>
                      <div className="text-sm text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        In Progress
                      </div>
                    </div>
                    
                    {/* Not Started */}
                    <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div className="text-3xl font-bold text-gray-400 mb-1">{notStartedTasks}</div>
                      <div className="text-sm text-gray-400 flex items-center gap-1">
                        <Circle className="h-3 w-3" />
                        Not Started
                      </div>
                    </div>
                    
                    {/* With Dates */}
                    <div className="p-4 bg-purple-950/30 rounded-lg border border-purple-900/50">
                      <div className="text-3xl font-bold text-purple-500 mb-1">{tasksWithDates}</div>
                      <div className="text-sm text-gray-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        With Dates
                      </div>
                    </div>
                    
                    {/* Without Dates */}
                    <div className="p-4 bg-yellow-950/30 rounded-lg border border-yellow-900/50">
                      <div className="text-3xl font-bold text-yellow-500 mb-1">{tasksWithoutDates}</div>
                      <div className="text-sm text-gray-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        No Dates
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs: Gantt, Time, Leaderboard, Capacity, Exports, Forecast */}
        <Tabs defaultValue="gantt" className="space-y-6">
          <TabsList className="bg-gray-900 border border-gray-800">
            <TabsTrigger value="gantt">Gantt</TabsTrigger>
            <TabsTrigger value="time">Time</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="capacity">Capacity</TabsTrigger>
            <TabsTrigger value="exports">Exports</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
          </TabsList>

          <TabsContent value="gantt">
            {selectedProjectId ? (
              <div className="space-y-6">
                <GanttChart 
                  data={ganttChartData || { project_id: selectedProjectId, tasks: [], milestones: [] }} 
                  loading={loadingGantt}
                  totalTasks={totalTasks}
                  totalCompleted={completedTasks}
                  averageProgress={averageProgress}
                />
              </div>
            ) : (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="py-12">
                  <div className="text-center text-gray-400">
                    <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Select a project to view reports</p>
                    <p className="text-sm mt-2">Choose a project from the dropdown above to see its Gantt chart and analytics</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="time">
            <div className="space-y-4">
              <TimeFilters
                value={filters}
                onChange={setFilters}
                onSubmit={runTimeReport}
                onDownloadCsv={onDownloadCsv}
                loading={loading?.time}
                csvLoading={loading?.csv}
              />
              <TimeReportTable data={timeReport || null} loading={loading?.time} />
            </div>
          </TabsContent>

          <TabsContent value="leaderboard">
            <LeaderboardTable data={leaderboard || null} loading={loading?.leaderboard} />
          </TabsContent>

          <TabsContent value="capacity">
            <CapacityTable data={capacity || null} loading={loading?.capacity} />
          </TabsContent>

          <TabsContent value="exports">
            <ExportsPanel />
          </TabsContent>

          <TabsContent value="forecast">
            <ForecastPanel projectId={selectedProjectId || undefined} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Reports;

