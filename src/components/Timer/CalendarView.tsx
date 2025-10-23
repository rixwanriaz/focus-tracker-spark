import React, { useEffect, useRef } from "react";
import { format, isSameDay, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { WeekDay, TimeEntry } from "./types";
import { Clock, Calendar as CalendarIcon } from "lucide-react";

type ViewMode = "day" | "week";

interface CalendarViewProps {
  weekDays: WeekDay[];
  onEntryClick?: (entry: TimeEntry) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
  viewMode?: ViewMode;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  weekDays,
  onEntryClick,
  onTimeSlotClick,
  viewMode = "week",
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Show all 24 hours
  const startHour = 0;
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const workingHours = hours; // Show all 24 hours

  // Auto-scroll to current hour on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      // Scroll to current hour (70px per hour, offset by 2 hours for better visibility)
      const scrollPosition = Math.max(0, (currentHour - 2) * 70);
      scrollContainerRef.current.scrollTop = scrollPosition;
    }
  }, [currentHour]);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(
      secs
    ).padStart(2, "0")}`;
  };

  const getEntryPosition = (entry: TimeEntry) => {
    const entryHour = entry.startTime.getHours();
    const entryMinute = entry.startTime.getMinutes();

    // Calculate position from midnight (hour 0)
    const top = entryHour * 70 + entryMinute * (70 / 60); // 70px per hour

    const durationMinutes = entry.duration / 60;
    const height = Math.max(durationMinutes * (70 / 60), 24); // Minimum 24px height

    return { top, height };
  };

  const getEntryColor = (entry: TimeEntry) => {
    // Generate consistent colors based on project/task - brighter and more visible
    const colors = [
      "bg-blue-600 border-blue-400",
      "bg-emerald-600 border-emerald-400",
      "bg-purple-600 border-purple-400",
      "bg-orange-600 border-orange-400",
      "bg-pink-600 border-pink-400",
      "bg-indigo-600 border-indigo-400",
      "bg-teal-600 border-teal-400",
      "bg-rose-600 border-rose-400",
    ];

    // Simple hash function for consistent color assignment
    let hash = 0;
    const str = entry.description || entry.id;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Filter to show only the selected day in day mode
  const displayDays = viewMode === "day" ? [weekDays[0]] : weekDays;

  // Render Day View (special layout for single day)
  if (viewMode === "day" && displayDays.length > 0) {
    const day = displayDays[0];
    return (
      <div className="flex-1 overflow-hidden bg-gray-900">
        <div className="h-full flex flex-col">
          {/* Compact Day Header - Horizontal layout */}
          <div className="border-b-2 border-gray-700 bg-gray-800 sticky top-0 z-10 shadow-lg">
            <div className="flex items-center justify-between px-6 py-4">
              {/* Left: Day Info */}
              <div className="flex items-center gap-4">
                <span
                  className={cn(
                    "text-5xl font-extrabold flex items-center justify-center w-16 h-16 rounded-xl transition-all duration-200",
                    isToday(day.date)
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/50"
                      : "bg-gray-700 text-gray-200"
                  )}
                >
                  {day.dayNumber}
                </span>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-white uppercase tracking-wide">
                    {day.dayName}
                  </span>
                  <span className="text-sm text-gray-400 font-mono">
                    {formatDuration(day.totalDuration)}
                  </span>
                </div>
              </div>

              {/* Right: Clock Icon */}
              <div className="w-10 h-10 rounded-xl bg-purple-600/30 border-2 border-purple-500/50 flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-300" />
              </div>
            </div>
          </div>

          {/* Calendar Grid - Two Column Layout */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto bg-gray-900 scroll-smooth"
          >
            <div className="relative">
              <div className="grid grid-cols-[80px_1fr]">
                {/* Time Labels Column */}
                <div className="border-r border-gray-800 bg-gray-950 sticky left-0 z-10">
                  {workingHours.map((hour) => {
                    const isCurrentHour =
                      hour === currentHour && isToday(day.date);
                    const isPastHour = hour < currentHour && isToday(day.date);
                    return (
                      <div
                        key={hour}
                        className={cn(
                          "h-[70px] border-b border-gray-800 px-2 flex items-start pt-1 text-xs font-medium",
                          isCurrentHour && "text-purple-300",
                          isPastHour && "text-gray-600",
                          !isCurrentHour && !isPastHour && "text-gray-400"
                        )}
                      >
                        <span className="w-full text-right pr-2">
                          {format(new Date().setHours(hour, 0, 0, 0), "h:mm a")}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Single Day Column */}
                <div className="relative bg-gray-900">
                  {workingHours.map((hour) => {
                    const isTodayDate = isToday(day.date);
                    const isCurrentHour = hour === currentHour && isTodayDate;
                    const isPastHour = hour < currentHour && isTodayDate;
                    const isClickable = !isPastHour || !isTodayDate;

                    return (
                      <div
                        key={hour}
                        className={cn(
                          "h-[70px] border-b border-gray-800 transition-all duration-200 group relative",
                          isCurrentHour && "border-purple-600",
                          isClickable && "hover:bg-gray-800/30 cursor-pointer"
                        )}
                        onClick={() =>
                          isClickable && onTimeSlotClick?.(day.date, hour)
                        }
                      >
                        {/* Current time indicator line */}
                        {isCurrentHour && (
                          <div className="absolute left-0 right-0 top-0 h-0.5 bg-purple-500 z-20" />
                        )}

                        {isClickable && (
                          <div className="absolute inset-0 bg-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        )}
                      </div>
                    );
                  })}

                  {/* Time Entries for the single day */}
                  {day.entries.map((entry) => {
                    const { top, height } = getEntryPosition(entry);
                    const colorClass = getEntryColor(entry);
                    return (
                      <div
                        key={entry.id}
                        className={cn(
                          "absolute left-1 right-1 rounded-md px-2 py-1.5 cursor-pointer",
                          "text-white text-xs shadow-md",
                          "hover:shadow-lg transition-all duration-200",
                          "border-l-3 overflow-hidden group",
                          colorClass
                        )}
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                        }}
                        onClick={() => onEntryClick?.(entry)}
                      >
                        <div className="relative z-10 h-full flex flex-col justify-center">
                          <div className="font-semibold truncate text-xs">
                            {entry.description || "No description"}
                          </div>
                          {height > 35 && (
                            <div className="text-[10px] opacity-80 mt-0.5">
                              {format(entry.startTime, "h:mm a")}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Week View Layout
  return (
    <div className="flex-1 overflow-hidden bg-gray-900">
      <div className="h-full flex flex-col">
        {/* Week Days Header */}
        <div className="grid grid-cols-8 border-b-2 border-gray-700 bg-gray-800 sticky top-0 z-10 shadow-lg">
          <div className="p-5 border-r-2 border-gray-700 flex items-center justify-center bg-gray-800">
            <div className="w-11 h-11 rounded-xl bg-purple-600/30 border-2 border-purple-500/50 flex items-center justify-center">
              <Clock className="h-5 w-5 text-purple-300" />
            </div>
          </div>
          {weekDays.map((day) => (
            <div
              key={day.date.toISOString()}
              className={cn(
                "p-5 text-center border-r-2 border-gray-700 transition-all duration-200 hover:bg-gray-700/50",
                isToday(day.date) && "bg-purple-900/30"
              )}
            >
              <div className="flex flex-col items-center gap-2.5">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.15em] mb-0.5">
                  {day.dayName}
                </span>
                <span
                  className={cn(
                    "text-2xl font-extrabold flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200",
                    isToday(day.date)
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/50"
                      : "text-gray-200 hover:bg-gray-700"
                  )}
                >
                  {day.dayNumber}
                </span>
                {day.totalDuration > 0 && (
                  <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-300 bg-emerald-900/50 border border-emerald-600/40 px-2.5 py-1.5 rounded-lg">
                    <Clock className="h-3 w-3" />
                    <span className="font-semibold">
                      {formatDuration(day.totalDuration)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto bg-gray-850 scroll-smooth"
        >
          <div className="relative">
            {/* Time Labels */}
            <div className="grid grid-cols-8">
              <div className="border-r-2 border-gray-700 bg-gray-800 sticky left-0 z-10">
                {workingHours.map((hour) => {
                  const isCurrentHour = hour === currentHour && isToday(now);
                  const isPastHour = hour < currentHour && isToday(now);
                  return (
                    <div
                      key={hour}
                      className={cn(
                        "h-[70px] border-b border-gray-700 px-4 py-3 text-xs font-bold font-mono flex items-center justify-center relative group",
                        isCurrentHour && "bg-purple-900/40 text-purple-200",
                        isPastHour && "text-gray-500",
                        !isCurrentHour &&
                          !isPastHour &&
                          "text-gray-300 hover:text-white hover:bg-gray-700/50"
                      )}
                    >
                      <div
                        className={cn(
                          "px-3 py-1.5 rounded-lg transition-all duration-200",
                          isCurrentHour &&
                            "bg-purple-600/30 border border-purple-500/60",
                          !isCurrentHour &&
                            !isPastHour &&
                            "group-hover:bg-gray-700"
                        )}
                      >
                        {format(new Date().setHours(hour, 0, 0, 0), "h:mm a")}
                      </div>
                      {isCurrentHour && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-500/50" />
                          <div
                            className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"
                            style={{ animationDelay: "150ms" }}
                          />
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
                    "relative border-r-2 border-gray-700 transition-all duration-200",
                    isToday(day.date) && "bg-purple-950/20"
                  )}
                >
                  {workingHours.map((hour) => {
                    const isTodayDate = isToday(day.date);
                    const isCurrentHour = hour === currentHour && isTodayDate;
                    const isPastHour = hour < currentHour && isTodayDate;
                    const isClickable = !isPastHour || !isTodayDate; // Allow clicks on past hours for non-today dates

                    return (
                      <div
                        key={hour}
                        className={cn(
                          "h-[70px] border-b border-gray-700 transition-all duration-200 group relative",
                          isPastHour &&
                            "bg-gray-900/80 cursor-not-allowed opacity-50",
                          isClickable && "hover:bg-gray-700/40 cursor-pointer",
                          isCurrentHour &&
                            "bg-purple-900/30 border-y-2 border-purple-600/40"
                        )}
                        onClick={() =>
                          isClickable && onTimeSlotClick?.(day.date, hour)
                        }
                      >
                        {/* Enhanced hover indicator */}
                        {isClickable && (
                          <>
                            <div className="absolute inset-0 bg-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-purple-500/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                          </>
                        )}
                        {isPastHour && (
                          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,rgba(55,65,81,0.2)_48%,rgba(55,65,81,0.2)_52%,transparent_52%)] bg-[length:8px_8px]" />
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
                          "absolute left-2 right-2 rounded-lg px-3 py-2 cursor-pointer",
                          "text-white text-xs shadow-lg",
                          "hover:shadow-xl hover:scale-[1.02] transition-all duration-200",
                          "border-l-4 border-2 overflow-hidden group",
                          colorClass
                        )}
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                        }}
                        onClick={() => onEntryClick?.(entry)}
                      >
                        <div className="relative z-10">
                          <div className="font-bold truncate mb-1">
                            {entry.description || "No description"}
                          </div>
                          {height > 40 && (
                            <div className="text-[10px] font-mono flex items-center gap-1 bg-black/30 px-1.5 py-0.5 rounded w-fit">
                              <Clock className="h-3 w-3" />
                              <span className="font-semibold">
                                {format(entry.startTime, "h:mm a")}
                              </span>
                            </div>
                          )}
                        </div>
                        {/* Subtle shine effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
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
