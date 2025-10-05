import React from 'react';
import { format, isSameDay, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { WeekDay, TimeEntry } from './types';

interface CalendarViewProps {
  weekDays: WeekDay[];
  onEntryClick?: (entry: TimeEntry) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  weekDays,
  onEntryClick,
  onTimeSlotClick,
}) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const workingHours = hours.slice(5, 24); // 5 AM to 11 PM

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getEntryPosition = (entry: TimeEntry) => {
    const startHour = entry.startTime.getHours();
    const startMinute = entry.startTime.getMinutes();
    const top = ((startHour - 5) * 60 + startMinute) * (60 / 60); // 60px per hour
    
    const durationMinutes = entry.duration / 60;
    const height = Math.max(durationMinutes * (60 / 60), 20); // Minimum 20px height
    
    return { top, height };
  };

  return (
    <div className="flex-1 overflow-hidden bg-gray-950">
      <div className="h-full flex flex-col">
        {/* Week Days Header */}
        <div className="grid grid-cols-8 border-b border-gray-800 bg-gray-950 sticky top-0 z-10">
          <div className="p-3 border-r border-gray-800"></div>
          {weekDays.map((day) => (
            <div
              key={day.date.toISOString()}
              className={cn(
                "p-3 text-center border-r border-gray-800",
                isToday(day.date) && "bg-purple-900/20"
              )}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500 uppercase">
                  {day.dayName}
                </span>
                <span
                  className={cn(
                    "text-2xl font-semibold flex items-center justify-center w-10 h-10 rounded-full text-white",
                    isToday(day.date) && "bg-purple-600 text-white"
                  )}
                >
                  {day.dayNumber}
                </span>
                {day.totalDuration > 0 && (
                  <span className="text-xs font-mono text-gray-400">
                    {formatDuration(day.totalDuration)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-y-auto bg-gray-950">
          <div className="relative">
            {/* Time Labels */}
            <div className="grid grid-cols-8">
              <div className="border-r border-gray-800 bg-gray-950">
                {workingHours.map((hour) => (
                  <div
                    key={hour}
                    className="h-[60px] border-b border-gray-800 px-2 py-1 text-xs text-gray-500"
                  >
                    {format(new Date().setHours(hour, 0, 0, 0), 'h:00 a')}
                  </div>
                ))}
              </div>

              {/* Day Columns */}
              {weekDays.map((day) => (
                <div
                  key={day.date.toISOString()}
                  className={cn(
                    "relative border-r border-gray-800",
                    isToday(day.date) && "bg-purple-900/10"
                  )}
                >
                  {workingHours.map((hour) => (
                    <div
                      key={hour}
                      className="h-[60px] border-b border-gray-800 hover:bg-gray-900 cursor-pointer transition-colors"
                      onClick={() => onTimeSlotClick?.(day.date, hour)}
                    />
                  ))}

                  {/* Time Entries */}
                  {day.entries.map((entry) => {
                    const { top, height } = getEntryPosition(entry);
                    return (
                      <div
                        key={entry.id}
                        className={cn(
                          "absolute left-1 right-1 rounded-md px-2 py-1 cursor-pointer",
                          "bg-purple-600/90 text-white text-xs",
                          "hover:bg-purple-600 transition-colors overflow-hidden",
                          "border-l-4 border-purple-500"
                        )}
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                        }}
                        onClick={() => onEntryClick?.(entry)}
                      >
                        <div className="font-medium truncate">{entry.description || 'No description'}</div>
                        {height > 30 && (
                          <div className="text-[10px] opacity-90">
                            {format(entry.startTime, 'h:mm a')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

