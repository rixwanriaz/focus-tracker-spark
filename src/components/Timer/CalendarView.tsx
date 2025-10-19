import React from 'react';
import { format, isSameDay, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { WeekDay, TimeEntry } from './types';
import { Clock, Calendar as CalendarIcon } from 'lucide-react';

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
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Start from current hour - showing time from when user is active
  const startHour = currentHour;
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const workingHours = hours.slice(startHour, 24); // From current hour to 11 PM

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getEntryPosition = (entry: TimeEntry) => {
    const entryHour = entry.startTime.getHours();
    const entryMinute = entry.startTime.getMinutes();
    
    // Calculate position relative to our dynamic start hour
    const top = ((entryHour - startHour) * 60 + entryMinute) * (60 / 60); // 60px per hour
    
    const durationMinutes = entry.duration / 60;
    const height = Math.max(durationMinutes * (60 / 60), 24); // Minimum 24px height
    
    return { top, height };
  };

  const getEntryColor = (entry: TimeEntry) => {
    // Generate consistent colors based on project/task
    const colors = [
      'bg-blue-500/90 border-blue-400',
      'bg-emerald-500/90 border-emerald-400',
      'bg-purple-500/90 border-purple-400',
      'bg-orange-500/90 border-orange-400',
      'bg-pink-500/90 border-pink-400',
      'bg-indigo-500/90 border-indigo-400',
      'bg-teal-500/90 border-teal-400',
      'bg-rose-500/90 border-rose-400',
    ];
    
    // Simple hash function for consistent color assignment
    let hash = 0;
    const str = entry.description || entry.id;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="flex-1 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="h-full flex flex-col">
        {/* Week Days Header */}
        <div className="grid grid-cols-8 border-b border-slate-700/50 bg-gradient-to-b from-slate-800/60 to-slate-800/40 backdrop-blur-md sticky top-0 z-10 shadow-xl shadow-black/20">
          <div className="p-5 border-r border-slate-700/50 flex items-center justify-center bg-slate-800/30">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 flex items-center justify-center backdrop-blur-sm">
              <Clock className="h-5 w-5 text-purple-400" />
            </div>
          </div>
          {weekDays.map((day) => (
            <div
              key={day.date.toISOString()}
              className={cn(
                "p-5 text-center border-r border-slate-700/50 transition-all duration-300 hover:bg-slate-800/40",
                isToday(day.date) && "bg-gradient-to-b from-purple-600/25 via-purple-700/15 to-transparent border-b-2 border-b-purple-500/40"
              )}
            >
              <div className="flex flex-col items-center gap-2.5">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.15em] mb-0.5">
                  {day.dayName}
                </span>
                <span
                  className={cn(
                    "text-2xl font-extrabold flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300",
                    isToday(day.date) 
                      ? "bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white shadow-xl shadow-purple-500/40 ring-2 ring-purple-400/30 ring-offset-2 ring-offset-slate-900 scale-110" 
                      : "text-slate-300 hover:bg-gradient-to-br hover:from-slate-700 hover:to-slate-800 hover:scale-105 hover:shadow-lg"
                  )}
                >
                  {day.dayNumber}
                </span>
                {day.totalDuration > 0 && (
                  <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg shadow-sm backdrop-blur-sm">
                    <Clock className="h-3 w-3" />
                    <span className="font-semibold">{formatDuration(day.totalDuration)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-900/60 to-slate-950/80">
          <div className="relative">
            {/* Time Labels */}
            <div className="grid grid-cols-8">
              <div className="border-r border-slate-700/50 bg-gradient-to-r from-slate-900/70 to-slate-900/50 backdrop-blur-sm sticky left-0 z-10">
                {workingHours.map((hour) => {
                  const isCurrentHour = hour === currentHour;
                  const isPastHour = hour < currentHour;
                  return (
                    <div
                      key={hour}
                      className={cn(
                        "h-[70px] border-b border-slate-700/40 px-4 py-3 text-xs font-bold font-mono flex items-center justify-center relative group",
                        isCurrentHour && "bg-gradient-to-r from-purple-600/30 via-purple-500/20 to-transparent text-purple-300 shadow-lg shadow-purple-500/10",
                        isPastHour && "text-slate-600 opacity-60",
                        !isCurrentHour && !isPastHour && "text-slate-400 hover:text-slate-300 hover:bg-slate-800/40"
                      )}
                    >
                      <div className={cn(
                        "px-3 py-1.5 rounded-lg transition-all duration-200",
                        isCurrentHour && "bg-purple-600/20 border border-purple-500/40 shadow-sm",
                        !isCurrentHour && !isPastHour && "group-hover:bg-slate-800/60"
                      )}>
                        {format(new Date().setHours(hour, 0, 0, 0), 'h:mm a')}
                      </div>
                      {isCurrentHour && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-500/50" />
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Day Columns */}
              {weekDays.map((day) => (
                <div
                  key={day.date.toISOString()}
                  className={cn(
                    "relative border-r border-slate-700/50 transition-all duration-200",
                    isToday(day.date) && "bg-gradient-to-b from-purple-500/8 via-purple-600/5 to-transparent"
                  )}
                >
                  {workingHours.map((hour) => {
                    const isCurrentHour = hour === currentHour;
                    const isPastHour = hour < currentHour;
                    const isTodayDate = day.date.getDate() === now.getDate() && 
                                   day.date.getMonth() === now.getMonth() && 
                                   day.date.getFullYear() === now.getFullYear();
                    
                    return (
                      <div
                        key={hour}
                        className={cn(
                          "h-[70px] border-b border-slate-700/30 transition-all duration-300 group relative",
                          isPastHour && isTodayDate && "bg-slate-900/60 cursor-not-allowed opacity-40 hover:opacity-40",
                          !isPastHour && "hover:bg-gradient-to-br hover:from-slate-700/30 hover:to-slate-600/20 cursor-pointer",
                          isCurrentHour && isTodayDate && "bg-gradient-to-r from-purple-500/15 via-purple-600/10 to-purple-700/5"
                        )}
                        onClick={() => !isPastHour && onTimeSlotClick?.(day.date, hour)}
                      >
                        {/* Enhanced hover indicator */}
                        {!isPastHour && (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </>
                        )}
                        {isPastHour && isTodayDate && (
                          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,rgba(71,85,105,0.1)_48%,rgba(71,85,105,0.1)_52%,transparent_52%)] bg-[length:8px_8px]" />
                        )}
                      </div>
                    );
                  })}

                  {/* Time Entries */}
                  {day.entries.map((entry) => {
                    const { top, height } = getEntryPosition(entry);
                    const colorClass = getEntryColor(entry);
                    return (
                      <div
                        key={entry.id}
                        className={cn(
                          "absolute left-2 right-2 rounded-xl px-3.5 py-2.5 cursor-pointer",
                          "text-white text-xs shadow-xl backdrop-blur-md",
                          "hover:shadow-2xl hover:scale-[1.03] hover:-translate-y-0.5 transition-all duration-300",
                          "border-l-4 overflow-hidden group ring-1 ring-white/10",
                          colorClass
                        )}
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                        }}
                        onClick={() => onEntryClick?.(entry)}
                      >
                        <div className="relative z-10">
                          <div className="font-bold truncate mb-1 text-shadow-sm group-hover:tracking-wide transition-all duration-300">
                            {entry.description || 'No description'}
                          </div>
                          {height > 40 && (
                            <div className="text-[10px] opacity-90 font-mono flex items-center gap-1.5 bg-black/20 px-2 py-0.5 rounded-md w-fit">
                              <Clock className="h-3 w-3" />
                              <span className="font-semibold">{format(entry.startTime, 'h:mm a')}</span>
                            </div>
                          )}
                        </div>
                        {/* Enhanced shine effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                        {/* Glow effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-white/5 to-transparent transition-opacity duration-300" />
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

