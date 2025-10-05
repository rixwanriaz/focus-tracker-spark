import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { cn } from '@/lib/utils';

interface WeekNavigatorProps {
  currentDate: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  weekTotal: number; // in seconds
}

export const WeekNavigator: React.FC<WeekNavigatorProps> = ({
  currentDate,
  onPreviousWeek,
  onNextWeek,
  onToday,
  weekTotal,
}) => {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekNumber = format(currentDate, 'I');

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-950 border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Week Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onPreviousWeek}
              className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-900 border border-gray-800">
              <CalendarIcon className="h-4 w-4 text-gray-400" />
              <span className="font-medium text-sm text-white">
                This week · W{weekNumber}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onNextWeek}
              className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onToday}
              className="ml-2 border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Today
            </Button>
          </div>

          {/* Week Total */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 uppercase tracking-wide">
              Week Total
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

