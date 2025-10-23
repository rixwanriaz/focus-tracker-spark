import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  format, 
  startOfWeek, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isSameMonth,
  addMonths,
  subMonths,
  getWeek,
  subDays,
  addDays,
  subWeeks,
  addWeeks
} from 'date-fns';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type ViewMode = 'day' | 'week';

interface WeekNavigatorProps {
  currentDate: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  onDateChange?: (date: Date) => void; // New prop for date selection
  weekTotal: number; // in seconds
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
}

export const WeekNavigator: React.FC<WeekNavigatorProps> = ({
  currentDate,
  onPreviousWeek,
  onNextWeek,
  onToday,
  onDateChange,
  weekTotal,
  viewMode: externalViewMode,
  onViewModeChange,
}) => {
  const [internalViewMode, setInternalViewMode] = useState<ViewMode>('week');
  const viewMode = externalViewMode ?? internalViewMode;
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(currentDate);
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekNumber = format(currentDate, 'I');

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleViewModeChange = (mode: ViewMode) => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    } else {
      setInternalViewMode(mode);
    }
    // If switching to day mode, trigger today
    if (mode === 'day') {
      onToday();
    }
  };

  const handleQuickSelect = (type: 'today' | 'yesterday' | 'thisWeek' | 'lastWeek') => {
    const now = new Date();
    switch (type) {
      case 'today':
        onToday();
        break;
      case 'yesterday':
        const yesterday = subDays(now, 1);
        if (onDateChange) {
          onDateChange(yesterday);
        }
        break;
      case 'thisWeek':
        onToday();
        break;
      case 'lastWeek':
        onPreviousWeek();
        break;
    }
    setCalendarOpen(false);
  };

  const handleDateSelect = (date: Date) => {
    if (onDateChange) {
      onDateChange(date);
    }
    setCalendarOpen(false);
  };

  // Calendar rendering logic
  const renderCalendar = () => {
    const monthStart = startOfMonth(calendarMonth);
    const monthEnd = endOfMonth(calendarMonth);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = startOfWeek(monthEnd, { weekStartsOn: 1 });
    
    // Get all days to display (including prev/next month days)
    const days = eachDayOfInterval({ start: startDate, end: addMonths(endDate, 0) });
    const weeks: Date[][] = [];
    
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <div className="space-y-4">
        {/* Calendar Header with Month Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-lg font-semibold text-white">
            {format(calendarMonth, 'MMMM yyyy')}
          </span>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-8 gap-1 text-xs text-gray-400 font-medium">
          <div className="text-center py-2"></div>
          <div className="text-center py-2">Mon</div>
          <div className="text-center py-2">Tue</div>
          <div className="text-center py-2">Wed</div>
          <div className="text-center py-2">Thu</div>
          <div className="text-center py-2">Fri</div>
          <div className="text-center py-2">Sat</div>
          <div className="text-center py-2">Sun</div>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-1">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="grid grid-cols-8 gap-1">
              {/* Week Number */}
              <div className="flex items-center justify-center text-xs text-gray-500">
                W{getWeek(week[0], { weekStartsOn: 1 })}
              </div>
              
              {/* Days */}
              {week.map((day, dayIdx) => {
                const isCurrentMonth = isSameMonth(day, calendarMonth);
                const isSelected = isSameDay(day, currentDate);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <button
                    key={dayIdx}
                    onClick={() => handleDateSelect(day)}
                    className={cn(
                      "h-10 w-full rounded-lg text-sm font-medium transition-all",
                      "hover:bg-gray-800",
                      !isCurrentMonth && "text-gray-600",
                      isCurrentMonth && "text-white",
                      isSelected && "bg-purple-600 hover:bg-purple-700 text-white",
                      isToday && !isSelected && "border border-purple-500"
                    )}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-950 border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Left Section: Calendar Popover */}
          <div className="flex items-center gap-3 flex-wrap">
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 px-4 bg-gray-900 border-gray-800 text-white hover:bg-gray-800 hover:border-gray-700"
                >
                  <span className="font-medium">
                    {viewMode === 'week' 
                      ? `Week ${weekNumber} · ${format(currentDate, 'MMM yyyy')}`
                      : format(currentDate, 'MMM d, yyyy')
                    }
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4 text-gray-400" />
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-auto p-0 bg-gray-900 border-gray-800" 
                align="start"
                sideOffset={8}
              >
                <div className="flex">
                  {/* Quick Selection Sidebar */}
                  <div className="w-40 bg-gray-950 border-r border-gray-800 p-3 space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuickSelect('today')}
                      className="w-full justify-start text-white hover:bg-purple-900/30 hover:text-purple-300"
                    >
                      Today
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuickSelect('yesterday')}
                      className="w-full justify-start text-gray-400 hover:bg-gray-800 hover:text-white"
                    >
                      Yesterday
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuickSelect('thisWeek')}
                      className="w-full justify-start text-gray-400 hover:bg-gray-800 hover:text-white"
                    >
                      This week
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuickSelect('lastWeek')}
                      className="w-full justify-start text-gray-400 hover:bg-gray-800 hover:text-white"
                    >
                      Last week
                    </Button>
                  </div>

                  {/* Calendar Section */}
                  <div className="p-4 min-w-[420px]">
                    {renderCalendar()}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* View Mode Selector */}
            <Select value={viewMode} onValueChange={(v) => handleViewModeChange(v as ViewMode)}>
              <SelectTrigger className="w-32 h-10 bg-gray-900 border-gray-800 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-800">
                <SelectItem value="day" className="text-white">Day View</SelectItem>
                <SelectItem value="week" className="text-white">Week View</SelectItem>
              </SelectContent>
            </Select>

            {/* Navigation Arrows */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (viewMode === 'day' && onDateChange) {
                    // Navigate to previous day
                    const prevDay = subDays(currentDate, 1);
                    onDateChange(prevDay);
                  } else {
                    onPreviousWeek();
                  }
                }}
                className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (viewMode === 'day' && onDateChange) {
                    // Navigate to next day
                    const nextDay = addDays(currentDate, 1);
                    onDateChange(nextDay);
                  } else {
                    onNextWeek();
                  }
                }}
                className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Week Total */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 uppercase tracking-wide">
              {viewMode === 'week' ? 'Week Total' : 'Day Total'}
            </span>
            <span className="text-lg font-mono font-semibold text-white">
              {formatDuration(weekTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

