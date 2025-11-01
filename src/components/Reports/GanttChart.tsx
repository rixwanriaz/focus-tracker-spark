import React, { useMemo, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Users } from 'lucide-react';
import { GanttChartData } from '@/redux/api/project';
import { cn } from '@/lib/utils';

interface GanttChartProps {
  data: GanttChartData | null;
  loading?: boolean;
  totalTasks?: number;
  totalCompleted?: number;
  averageProgress?: number;
}

export const GanttChart: React.FC<GanttChartProps> = ({ data, loading, totalTasks, totalCompleted, averageProgress }) => {
  const headerRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const taskBarRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [headerTooltip, setHeaderTooltip] = useState<{ visible: boolean; x: number; y: number; text: string }>(() => ({ visible: false, x: 0, y: 0, text: '' }));
  const [hoverGuide, setHoverGuide] = useState<{ visible: boolean; x: number; text: string }>(() => ({ visible: false, x: 0, text: '' }));
  // Calculate the timeline range
  const timelineRange = useMemo(() => {
    if (!data || !data.tasks || !data.tasks.length) return null;

    const allDates = [
      ...data.tasks.map(t => new Date(t.start_date)),
      ...data.tasks.map(t => new Date(t.end_date)),
      ...(data.milestones || []).map(m => new Date(m.date))
    ];

    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

    // Add some padding
    minDate.setDate(minDate.getDate() - 3);
    maxDate.setDate(maxDate.getDate() + 3);

    return { minDate, maxDate, totalDays: Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) };
  }, [data]);

  const calculatePosition = (date: string) => {
    if (!timelineRange) return 0;
    const dateObj = new Date(date);
    const daysSinceStart = Math.ceil((dateObj.getTime() - timelineRange.minDate.getTime()) / (1000 * 60 * 60 * 24));
    return (daysSinceStart / timelineRange.totalDays) * 100;
  };

  const calculateWidth = (startDate: string, endDate: string) => {
    if (!timelineRange) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return (days / timelineRange.totalDays) * 100;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'text-green-500';
    if (progress >= 50) return 'text-yellow-500';
    return 'text-blue-500';
  };

  const computeHeaderTooltip = (clientX: number, clientY: number) => {
    if (!timelineRange || !headerRef.current) return;
    const bounds = headerRef.current.getBoundingClientRect();
    const clampedX = Math.max(bounds.left, Math.min(clientX, bounds.right));
    const ratio = (clampedX - bounds.left) / Math.max(1, bounds.width);
    const hoveredDate = new Date(timelineRange.minDate.getTime() + ratio * (timelineRange.maxDate.getTime() - timelineRange.minDate.getTime()));
    const today = new Date();
    const inRange = today >= timelineRange.minDate && today <= timelineRange.maxDate;
    const elapsedPct = Math.round(((today.getTime() - timelineRange.minDate.getTime()) / (timelineRange.maxDate.getTime() - timelineRange.minDate.getTime())) * 100);
    const overall = averageProgress ?? Math.round((data?.tasks?.reduce((s, t) => s + (t.progress || 0), 0) || 0) / Math.max(1, data?.tasks?.length || 1));

    const text = `Start: ${formatDate(timelineRange.minDate.toISOString())}  |  Hover: ${formatDate(hoveredDate.toISOString())}  |  Today: ${inRange ? formatDate(today.toISOString()) : '—'} (${inRange ? Math.max(0, Math.min(100, elapsedPct)) : '—'}%)  |  End: ${formatDate(timelineRange.maxDate.toISOString())}  |  Overall progress: ${overall}%`;
    setHeaderTooltip({ visible: true, x: clampedX - bounds.left, y: clientY - bounds.top, text });
  };

  const computeContainerHover = (clientX: number, task?: { name: string; start_date: string; end_date: string; progress: number }) => {
    if (!timelineRange || !containerRef.current) return;
    const bounds = containerRef.current.getBoundingClientRect();
    const clampedX = Math.max(bounds.left, Math.min(clientX, bounds.right));
    const ratio = (clampedX - bounds.left) / Math.max(1, bounds.width);
    const hoveredDate = new Date(timelineRange.minDate.getTime() + ratio * (timelineRange.maxDate.getTime() - timelineRange.minDate.getTime()));
    const today = new Date();
    const inRange = today >= timelineRange.minDate && today <= timelineRange.maxDate;
    const elapsedPct = Math.round(((today.getTime() - timelineRange.minDate.getTime()) / (timelineRange.maxDate.getTime() - timelineRange.minDate.getTime())) * 100);
    const overall = averageProgress ?? Math.round((data?.tasks?.reduce((s, t) => s + (t.progress || 0), 0) || 0) / Math.max(1, data?.tasks?.length || 1));
    const text = task
      ? `Task: ${task.name}  |  Start: ${formatDate(task.start_date)}  |  Hover: ${formatDate(hoveredDate.toISOString())}  |  Today: ${inRange ? formatDate(today.toISOString()) : '—'}  |  End: ${formatDate(task.end_date)}  |  Progress: ${task.progress}%`
      : `Start: ${formatDate(timelineRange.minDate.toISOString())}  |  Hover: ${formatDate(hoveredDate.toISOString())}  |  Today: ${inRange ? formatDate(today.toISOString()) : '—'} (${inRange ? Math.max(0, Math.min(100, elapsedPct)) : '—'}%)  |  End: ${formatDate(timelineRange.maxDate.toISOString())}  |  Overall progress: ${overall}%`;
    setHoverGuide({ visible: true, x: clampedX - bounds.left, text });
  };

  const registerTaskBar = (taskId: string, el: HTMLDivElement | null) => {
    taskBarRefs.current[taskId] = el;
  };

  const hitTestTaskAt = (clientX: number, clientY: number): { id: string; rect: DOMRect } | null => {
    const entries = Object.entries(taskBarRefs.current).filter(([, el]) => !!el) as Array<[string, HTMLDivElement]>;
    let best: { id: string; rect: DOMRect } | null = null;
    for (const [id, el] of entries) {
      const rect = el.getBoundingClientRect();
      const inside = clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
      if (!inside) continue;
      // Choose the bar whose top is closest to the pointer (acts like topmost for stacked lanes)
      if (!best || Math.abs(clientY - rect.top) < Math.abs(clientY - best.rect.top)) {
        best = { id, rect };
      }
    }
    return best;
  };

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Project Gantt Chart</CardTitle>
          <CardDescription>Loading timeline data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.tasks || !data.tasks.length) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Project Gantt Chart</CardTitle>
          <CardDescription>No tasks available for this project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-400">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Add tasks to see the Gantt chart timeline</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Project Gantt Chart
        </CardTitle>
        <CardDescription>
          Timeline from {timelineRange && formatDate(timelineRange.minDate.toISOString())} to{' '}
          {timelineRange && formatDate(timelineRange.maxDate.toISOString())}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Unified hover layer across the whole gantt section */}
        <div
          ref={containerRef}
          className="relative"
          onMouseMove={(e) => {
            const hit = hitTestTaskAt(e.clientX, e.clientY);
            if (hit && data) {
              const task = (data.tasks as any[]).find((t) => t.id === hit.id);
              if (task) return computeContainerHover(e.clientX, { name: task.name, start_date: task.start_date, end_date: task.end_date, progress: task.progress });
            }
            return computeContainerHover(e.clientX);
          }}
          onMouseLeave={() => setHoverGuide((s) => ({ ...s, visible: false }))}
        >
          {hoverGuide.visible && (
            <>
              <div
                className="pointer-events-none absolute inset-y-0 w-px bg-gray-500/40 z-20"
                style={{ insetInlineStart: `${hoverGuide.x}px` }}
              />
              <div
                className="pointer-events-none absolute z-30 -translate-y-8"
                style={{ insetInlineStart: `${hoverGuide.x}px`, insetBlockStart: 0 }}
              >
                <div className="max-w-[640px] whitespace-nowrap px-2 py-1 text-[11px] rounded bg-gray-900/95 border border-gray-700 shadow-xl text-gray-200">
                  {hoverGuide.text}
                </div>
              </div>
            </>
          )}
        {/* Timeline Header */}
        {timelineRange && (
          <div className="border-b border-gray-800 pb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>{formatDate(timelineRange.minDate.toISOString())}</span>
              <span>{formatDate(timelineRange.maxDate.toISOString())}</span>
            </div>
            <div
              ref={headerRef}
              className="h-2 bg-gray-800 rounded-full relative cursor-crosshair"
              onMouseEnter={(e) => computeHeaderTooltip(e.clientX, e.clientY)}
              onMouseMove={(e) => computeHeaderTooltip(e.clientX, e.clientY)}
              onMouseLeave={() => setHeaderTooltip((s) => ({ ...s, visible: false }))}
            >
              {/* Today marker */}
              {(() => {
                const today = new Date();
                if (today >= timelineRange.minDate && today <= timelineRange.maxDate) {
                  const position = calculatePosition(today.toISOString());
                  return (
                    <div
                      className="absolute top-0 w-0.5 h-8 bg-purple-500 -translate-y-3"
                      style={{ insetInlineStart: `${position}%` }}
                    >
                      <span className="absolute -top-6 start-1/2 -translate-x-1/2 text-xs text-purple-500 whitespace-nowrap">
                        Today
                      </span>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Hover tooltip for header timeline */}
              {headerTooltip.visible && (
                <div
                  className="absolute z-20 pointer-events-none select-none -translate-y-10"
                  style={{ insetInlineStart: `${headerTooltip.x}px` }}
                >
                  <div className="max-w-[560px] whitespace-nowrap px-2 py-1 text-[11px] rounded bg-gray-900/95 border border-gray-700 shadow-xl text-gray-200">
                    {headerTooltip.text}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Milestones */}
        {data.milestones && data.milestones.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Milestones
            </h3>
            <div className="space-y-2">
              {data.milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <span className="text-sm text-white flex-1">{milestone.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {formatDate(milestone.date)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tasks Timeline */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Tasks ({data.tasks.length})
          </h3>
          <div className="space-y-4">
            {data.tasks.map((task) => (
              <div key={task.id} className="space-y-2">
                {/* Task Info */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">{task.name}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span>{formatDate(task.start_date)}</span>
                      <span>→</span>
                      <span>{formatDate(task.end_date)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={cn('text-sm font-medium', getProgressColor(task.progress))}>
                      {task.progress}%
                    </span>
                    {task.dependencies.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {task.dependencies.length} deps
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Task Timeline Bar */}
                <div
                  className="relative h-8 bg-gray-800 rounded-lg overflow-hidden"
                  ref={(el) => registerTaskBar(task.id, el)}
                >
                  <div
                    className="absolute [inset-block-start:0] h-full bg-purple-600/20 border-s-2 border-e-2 border-purple-600"
                    style={{
                      insetInlineStart: `${calculatePosition(task.start_date)}%`,
                      inlineSize: `${calculateWidth(task.start_date, task.end_date)}%`
                    }}
                  >
                    <div
                      className="h-full bg-purple-600 transition-all duration-300"
                      style={{ inlineSize: `${task.progress}%` }}
                    />
                  </div>

                  

                  {/* Milestone markers on task timeline */}
                  {(data.milestones || []).map((milestone) => {
                    const milestoneDate = new Date(milestone.date);
                    const taskStart = new Date(task.start_date);
                    const taskEnd = new Date(task.end_date);
                    
                    if (milestoneDate >= taskStart && milestoneDate <= taskEnd) {
                      return (
                        <div
                          key={`${task.id}-${milestone.id}`}
                          className="absolute top-0 w-0.5 h-full bg-yellow-500"
                          style={{ insetInlineStart: `${calculatePosition(milestone.date)}%` }}
                          title={milestone.name}
                        />
                      );
                    }
                    return null;
                  })}
                </div>

                {/* Dependencies Info */}
                {task.dependencies.length > 0 && (
                  <div className="ps-4 text-xs text-gray-500">
                    Depends on:{' '}
                    {task.dependencies.map((depId, idx) => {
                      const depTask = data.tasks.find(t => t.id === depId);
                      return depTask ? (
                        <span key={depId}>
                          {idx > 0 && ', '}
                          {depTask.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-800">
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <div className="text-2xl font-bold text-white">
              {totalTasks ?? data.tasks.length}
            </div>
            <div className="text-sm text-gray-400">Total Tasks</div>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <div className="text-2xl font-bold text-green-500">
              {totalCompleted ?? data.tasks.filter(t => t.progress === 100).length}
            </div>
            <div className="text-sm text-gray-400">Completed</div>
          </div>
          <div className="p-4 bg-gray-800/50 rounded-lg">
            <div className="text-2xl font-bold text-blue-500">
              {averageProgress ?? Math.round(data.tasks.reduce((sum, t) => sum + t.progress, 0) / data.tasks.length)}%
            </div>
            <div className="text-sm text-gray-400">Overall Progress</div>
          </div>
        </div>
        </div>
      </CardContent>
    </Card>
  );
};

