import React, { useState, useEffect } from 'react';
import { addWeeks, subWeeks, startOfWeek, addDays, format } from 'date-fns';
import { TimerInput } from './TimerInput';
import { WeekNavigator } from './WeekNavigator';
import { CalendarView } from './CalendarView';
import { TimerSidebar } from './TimerSidebar';
import { TimerState, WeekDay, TimeEntry, Goal, Favorite, ViewMode } from './types';
import { Button } from '@/components/ui/button';
import { Calendar, List, Table, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const TimerModule: React.FC = () => {
  // Timer State
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    currentDescription: '',
    elapsedTime: 0,
  });

  // Week Navigation
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [weekDays, setWeekDays] = useState<WeekDay[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');

  // Goals and Favorites
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Weekly coding goal',
      target: 40,
      current: 17.45,
    },
  ]);

  const [favorites, setFavorites] = useState<Favorite[]>([
    {
      id: '1',
      description: 'Daily standup meeting',
      project: 'Team Sync',
    },
  ]);

  // Time Entries Storage
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);

  // Initialize week days
  useEffect(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const days: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i);
      const dayEntries = timeEntries.filter((entry) =>
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
  }, [currentDate, timeEntries]);

  // Calculate week total
  const weekTotal = weekDays.reduce((sum, day) => sum + day.totalDuration, 0);

  // Timer handlers
  const handleStartTimer = (description: string) => {
    setTimerState({
      isRunning: true,
      currentDescription: description,
      startTime: new Date(),
      elapsedTime: 0,
    });
    toast.success('Timer started!');
  };

  const handleStopTimer = () => {
    if (timerState.startTime) {
      const duration = Math.floor((Date.now() - timerState.startTime.getTime()) / 1000);
      
      const newEntry: TimeEntry = {
        id: Date.now().toString(),
        description: timerState.currentDescription || 'Untitled task',
        startTime: timerState.startTime,
        endTime: new Date(),
        duration,
        color: '#8b5cf6',
      };

      setTimeEntries([...timeEntries, newEntry]);
      setTimerState({
        isRunning: false,
        currentDescription: '',
        elapsedTime: 0,
      });
      
      toast.success(`Time entry saved: ${Math.floor(duration / 60)} minutes`);
    }
  };

  const handleDescriptionChange = (description: string) => {
    setTimerState({ ...timerState, currentDescription: description });
  };

  // Week navigation handlers
  const handlePreviousWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Entry handlers
  const handleEntryClick = (entry: TimeEntry) => {
    toast.info(`Entry: ${entry.description}`, {
      description: `Duration: ${Math.floor(entry.duration / 60)} minutes`,
    });
  };

  const handleTimeSlotClick = (date: Date, hour: number) => {
    console.log('Time slot clicked:', date, hour);
    // Could open a modal to create a manual time entry
  };

  // Goal and Favorite handlers
  const handleCreateGoal = () => {
    toast.info('Create goal modal would open here');
  };

  const handleAddFavorite = () => {
    toast.info('Add favorite modal would open here');
  };

  const handleGoalClick = (goal: Goal) => {
    toast.info(`Goal: ${goal.title}`, {
      description: `Progress: ${goal.current}/${goal.target} hours`,
    });
  };

  const handleFavoriteClick = (favorite: Favorite) => {
    setTimerState({
      ...timerState,
      currentDescription: favorite.description,
    });
    toast.success('Favorite loaded!');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      {/* Timer Input Bar */}
      <TimerInput
        timerState={timerState}
        onStart={handleStartTimer}
        onStop={handleStopTimer}
        onDescriptionChange={handleDescriptionChange}
      />

      {/* Week Navigator */}
      <WeekNavigator
        currentDate={currentDate}
        onPreviousWeek={handlePreviousWeek}
        onNextWeek={handleNextWeek}
        onToday={handleToday}
        weekTotal={weekTotal}
      />

      {/* View Mode Selector */}
      <div className="border-b border-gray-800 bg-gray-950">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className={cn(
                  "gap-2",
                  viewMode === 'calendar' 
                    ? "bg-purple-600 text-white hover:bg-purple-700" 
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                )}
              >
                <Calendar className="h-4 w-4" />
                Calendar
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={cn(
                  "gap-2",
                  viewMode === 'list' 
                    ? "bg-purple-600 text-white hover:bg-purple-700" 
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                )}
              >
                <List className="h-4 w-4" />
                List view
              </Button>
              <Button
                variant={viewMode === 'timesheet' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('timesheet')}
                className={cn(
                  "gap-2",
                  viewMode === 'timesheet' 
                    ? "bg-purple-600 text-white hover:bg-purple-700" 
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                )}
              >
                <Table className="h-4 w-4" />
                Timesheet
              </Button>
            </div>

            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden bg-gray-950">
        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <CalendarView
            weekDays={weekDays}
            onEntryClick={handleEntryClick}
            onTimeSlotClick={handleTimeSlotClick}
          />
        )}

        {/* List View Placeholder */}
        {viewMode === 'list' && (
          <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-950">
            <div className="text-center">
              <List className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>List view coming soon</p>
            </div>
          </div>
        )}

        {/* Timesheet View Placeholder */}
        {viewMode === 'timesheet' && (
          <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-950">
            <div className="text-center">
              <Table className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Timesheet view coming soon</p>
            </div>
          </div>
        )}

        {/* Sidebar */}
        <TimerSidebar
          goals={goals}
          favorites={favorites}
          onCreateGoal={handleCreateGoal}
          onAddFavorite={handleAddFavorite}
          onGoalClick={handleGoalClick}
          onFavoriteClick={handleFavoriteClick}
        />
      </div>
    </div>
  );
};

