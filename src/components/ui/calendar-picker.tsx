import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, addDays, subDays } from 'date-fns';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface CalendarPickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
  value,
  onChange,
  placeholder = "Select date",
  className,
  disabled = false,
  minDate,
  maxDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value || new Date());
  const [positionAbove, setPositionAbove] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = subDays(monthStart, monthStart.getDay());
  const calendarEnd = addDays(monthEnd, 6 - monthEnd.getDay());
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const handleDateSelect = (date: Date) => {
    onChange(date);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleToday = () => {
    const today = new Date();
    onChange(today);
    setCurrentMonth(today);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(undefined);
    setIsOpen(false);
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const formatDisplayValue = () => {
    if (!value) return placeholder;
    return format(value, 'dd/MM/yyyy');
  };

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full justify-start text-left font-normal bg-gray-800 border-gray-700 text-white hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-purple-500 transition-all",
          !value && "text-gray-500",
          className
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {formatDisplayValue()}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Calendar */}
          <div className="absolute top-full left-0 mt-1 z-[100] bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-3 min-w-[260px] max-h-[280px] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handlePrevMonth}
                className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <h3 className="text-sm font-semibold text-white">
                {format(currentMonth, 'MMMM yyyy')}
              </h3>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleNextMonth}
                className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['S', 'M', 'T', 'W', 'R', 'F', 'S'].map((day) => (
                <div key={day} className="text-xs font-medium text-gray-400 text-center py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isSelected = value && isSameDay(day, value);
                const isTodayDate = isToday(day);
                const isDisabled = isDateDisabled(day);

                return (
                  <Button
                    key={day.toISOString()}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => !isDisabled && handleDateSelect(day)}
                    disabled={isDisabled}
                    className={cn(
                      "h-8 w-8 p-0 text-xs font-normal transition-colors",
                      !isCurrentMonth && "text-gray-600",
                      isCurrentMonth && !isSelected && !isTodayDate && "text-gray-300 hover:text-white hover:bg-gray-800",
                      isTodayDate && !isSelected && "text-blue-400 font-semibold",
                      isSelected && "bg-purple-600 text-white hover:bg-purple-700",
                      isDisabled && "text-gray-600 cursor-not-allowed hover:bg-transparent"
                    )}
                  >
                    {format(day, 'd')}
                  </Button>
                );
              })}
            </div>

            {/* Footer buttons */}
            <div className="flex justify-between mt-4 pt-3 border-t border-gray-700">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-gray-400 hover:text-white hover:bg-gray-800 px-3 py-1 h-auto"
              >
                Clear
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleToday}
                className="text-blue-400 hover:text-blue-300 hover:bg-gray-800 px-3 py-1 h-auto"
              >
                Today
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
