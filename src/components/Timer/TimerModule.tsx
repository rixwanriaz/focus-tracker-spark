import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addWeeks, subWeeks, startOfWeek, addDays, format } from 'date-fns';
import { TimerInput } from './TimerInput';
import { WeekNavigator, ViewMode } from './WeekNavigator';
import { CalendarView } from './CalendarView';
import { ManualTimeEntryDialog } from './ManualTimeEntryDialog';
import { TimerState, WeekDay, TimeEntry } from './types';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { AppDispatch, RootState } from '@/redux/store';
import { 
  getActiveTimer, 
  startTimer, 
  stopTimer, 
  listEntries 
} from '@/redux/slice/timeSlice';
import { getProjects } from '@/redux/slice/projectSlice';
import { getProjectTasks } from '@/redux/slice/taskSlice';

export const TimerModule: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { activeTimer, entries, starting, stopping } = useSelector(
    (state: RootState) => state.time
  );
  const { projects } = useSelector((state: RootState) => state.project);
  const { projectTasks } = useSelector((state: RootState) => state.task);
  
  // Timer State
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    currentDescription: '',
    elapsedTime: 0,
    project_id: undefined,
    task_id: undefined,
    billable: false,
  });

  // Week Navigation
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [weekDays, setWeekDays] = useState<WeekDay[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  
  // Dialog state
  const [manualEntryDialogOpen, setManualEntryDialogOpen] = useState(false);

  // Goals and Favorites removed

  // Get tasks for selected project
  const selectedProjectTasks = timerState.project_id 
    ? projectTasks[timerState.project_id] || [] 
    : [];

  // Load initial data
  useEffect(() => {
    dispatch(getProjects());
    dispatch(getActiveTimer());
    
    // Load current week entries
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = addDays(weekStart, 6);
    dispatch(listEntries({
      start: weekStart.toISOString(),
      end: weekEnd.toISOString(),
    }));
  }, [dispatch]);

  // Reload data when view mode changes
  useEffect(() => {
    if (viewMode === 'day') {
      // Load entries for just the current date
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      dispatch(listEntries({
        start: dayStart.toISOString(),
        end: dayEnd.toISOString(),
      }));
    } else {
      // Load entries for the entire week
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = addDays(weekStart, 6);
      dispatch(listEntries({
        start: weekStart.toISOString(),
        end: weekEnd.toISOString(),
      }));
    }
  }, [viewMode, dispatch]);

  // Load tasks when project is selected
  useEffect(() => {
    if (timerState.project_id && !projectTasks[timerState.project_id]) {
      dispatch(getProjectTasks({ projectId: timerState.project_id, filters: {} }));
    }
  }, [timerState.project_id, projectTasks, dispatch]);

  // Update timer state when active timer changes
  useEffect(() => {
    if (activeTimer) {
      setTimerState({
        isRunning: true,
        currentDescription: activeTimer.description || '',
        startTime: new Date(activeTimer.start_ts),
        elapsedTime: 0,
        project_id: activeTimer.project_id,
        task_id: activeTimer.task_id,
        billable: activeTimer.billable,
      });
    }
  }, [activeTimer]);

  // Convert API entries to local TimeEntry format
  const convertToLocalEntry = (entry: any): TimeEntry => ({
    id: entry.id,
    description: entry.description || '',
    startTime: new Date(entry.start_ts),
    endTime: entry.end_ts ? new Date(entry.end_ts) : undefined,
    duration: entry.duration_seconds || 0,
    project_id: entry.project_id,
    project: entry.project,
    task_id: entry.task_id,
    task: entry.task,
    billable: entry.billable,
    color: '#8b5cf6',
  });

  // Initialize days based on view mode
  useEffect(() => {
    const entriesArray = Array.isArray(entries) ? entries : [];
    
    if (viewMode === 'day') {
      // For day view, only show the selected date
      const dayEntries = entriesArray
        .map(convertToLocalEntry)
        .filter((entry) =>
          format(entry.startTime, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
        );
      const totalDuration = dayEntries.reduce((sum, entry) => sum + entry.duration, 0);

      setWeekDays([{
        date: currentDate,
        dayName: format(currentDate, 'EEEE').toUpperCase(),
        dayNumber: parseInt(format(currentDate, 'd')),
        totalDuration,
        entries: dayEntries,
      }]);
    } else {
      // For week view, show the entire week
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const days: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
        const date = addDays(weekStart, i);
        
        const dayEntries = entriesArray
          .map(convertToLocalEntry)
          .filter((entry) =>
            format(entry.startTime, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
          );
        const totalDuration = dayEntries.reduce((sum, entry) => sum + entry.duration, 0);

        return {
          date,
          dayName: format(date, 'EEE').toUpperCase(),
          dayNumber: parseInt(format(date, 'd')),
          totalDuration,
          entries: dayEntries,
        };
      });
      setWeekDays(days);
    }
  }, [currentDate, entries, viewMode]);

  // Calculate week total
  const weekTotal = weekDays.reduce((sum, day) => sum + day.totalDuration, 0);

  // Timer handlers
  const handleStartTimer = async () => {
    // Validate project and task selection
    if (!timerState.project_id) {
      toast.error('Please select a project before starting the timer');
      return;
    }

    if (!timerState.task_id) {
      toast.error('Please select a task before starting the timer');
      return;
    }

    try {
      await dispatch(startTimer({
        project_id: timerState.project_id,
        task_id: timerState.task_id,
        notes: timerState.currentDescription,
        billable: timerState.billable,
      })).unwrap();
      
      toast.success('Timer started!');
    } catch (error: any) {
      toast.error(error || 'Failed to start timer');
    }
  };

  const handleStopTimer = async () => {
    if (activeTimer) {
      try {
        await dispatch(stopTimer({ 
          timeEntryId: activeTimer.id 
        })).unwrap();
        
        setTimerState({
          isRunning: false,
          currentDescription: '',
          elapsedTime: 0,
          project_id: undefined,
          task_id: undefined,
          billable: false,
        });
        
        toast.success('Timer stopped!');
        
        // Reload entries
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = addDays(weekStart, 6);
        dispatch(listEntries({
          start: weekStart.toISOString(),
          end: weekEnd.toISOString(),
        }));
      } catch (error: any) {
        toast.error(error || 'Failed to stop timer');
      }
    }
  };

  const handleDescriptionChange = (description: string) => {
    setTimerState({ ...timerState, currentDescription: description });
  };

  const handleProjectChange = (projectId: string) => {
    setTimerState({ 
      ...timerState, 
      project_id: projectId || undefined,
      task_id: undefined, // Reset task when project changes
    });
  };

  const handleTaskChange = (taskId: string) => {
    setTimerState({ ...timerState, task_id: taskId || undefined });
  };

  const handleBillableChange = (billable: boolean) => {
    setTimerState({ ...timerState, billable });
  };

  const handleManualEntrySuccess = () => {
    // Reload entries
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = addDays(weekStart, 6);
    dispatch(listEntries({
      start: weekStart.toISOString(),
      end: weekEnd.toISOString(),
    }));
  };

  // Week navigation handlers
  const handlePreviousWeek = () => {
    const newDate = subWeeks(currentDate, 1);
    setCurrentDate(newDate);
    
    // Load entries for new week
    const weekStart = startOfWeek(newDate, { weekStartsOn: 1 });
    const weekEnd = addDays(weekStart, 6);
    dispatch(listEntries({
      start: weekStart.toISOString(),
      end: weekEnd.toISOString(),
    }));
  };

  const handleNextWeek = () => {
    const newDate = addWeeks(currentDate, 1);
    setCurrentDate(newDate);
    
    // Load entries for new week
    const weekStart = startOfWeek(newDate, { weekStartsOn: 1 });
    const weekEnd = addDays(weekStart, 6);
    dispatch(listEntries({
      start: weekStart.toISOString(),
      end: weekEnd.toISOString(),
    }));
  };

  const handleToday = () => {
    const newDate = new Date();
    setCurrentDate(newDate);
    
    // Load entries for current week
    const weekStart = startOfWeek(newDate, { weekStartsOn: 1 });
    const weekEnd = addDays(weekStart, 6);
    dispatch(listEntries({
      start: weekStart.toISOString(),
      end: weekEnd.toISOString(),
    }));
  };

  // Handle date change (when user selects a specific date from calendar)
  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate);
    
    if (viewMode === 'day') {
      // For day view, load entries for just that day
      const dayStart = new Date(newDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(newDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      dispatch(listEntries({
        start: dayStart.toISOString(),
        end: dayEnd.toISOString(),
      }));
    } else {
      // For week view, load entries for the entire week containing that date
      const weekStart = startOfWeek(newDate, { weekStartsOn: 1 });
      const weekEnd = addDays(weekStart, 6);
      dispatch(listEntries({
        start: weekStart.toISOString(),
        end: weekEnd.toISOString(),
      }));
    }
  };

  // Entry handlers
  const handleEntryClick = (entry: TimeEntry) => {
    toast.info(`Entry: ${entry.description}`, {
      description: `Duration: ${Math.floor(entry.duration / 60)} minutes`,
    });
  };

  const handleTimeSlotClick = (date: Date, hour: number) => {
    // Could open a modal to create a manual time entry
  };

  // Goal and Favorite handlers removed

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      {/* Timer Input Bar */}
      <TimerInput
        timerState={timerState}
        projects={projects}
        tasks={selectedProjectTasks}
        onStart={handleStartTimer}
        onStop={handleStopTimer}
        onDescriptionChange={handleDescriptionChange}
        onProjectChange={handleProjectChange}
        onTaskChange={handleTaskChange}
        onBillableChange={handleBillableChange}
        onManualEntryClick={() => setManualEntryDialogOpen(true)}
      />
      
      {/* Manual Time Entry Dialog */}
      <ManualTimeEntryDialog
        open={manualEntryDialogOpen}
        onOpenChange={setManualEntryDialogOpen}
        projects={projects}
        onSuccess={handleManualEntrySuccess}
      />

      {/* Week Navigator */}
      <WeekNavigator
        currentDate={currentDate}
        onPreviousWeek={handlePreviousWeek}
        onNextWeek={handleNextWeek}
        onToday={handleToday}
        onDateChange={handleDateChange}
        weekTotal={weekTotal}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden bg-gray-950">
        {/* Calendar View */}
        <CalendarView
          weekDays={weekDays}
          onEntryClick={handleEntryClick}
          onTimeSlotClick={handleTimeSlotClick}
          viewMode={viewMode}
        />
      </div>
    </div>
  );
};

