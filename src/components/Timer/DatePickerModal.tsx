import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, X } from 'lucide-react';

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({
  isOpen,
  onClose,
  onDateSelect,
  selectedDate
}) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());

  if (!isOpen) return null;

  const today = new Date();
  const currentDate = new Date(currentYear, currentMonth, 1);
  
  // Quick date options
  const quickDateOptions = [
    { label: 'Today', date: new Date() },
    { label: 'Yesterday', date: new Date(today.getTime() - 24 * 60 * 60 * 1000) },
    { label: 'This week', date: new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000)) },
    { label: 'Last week', date: new Date(today.getTime() - ((today.getDay() + 7) * 24 * 60 * 60 * 1000)) }
  ];

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // Get days from previous month
  const prevMonth = new Date(currentYear, currentMonth - 1, 0);
  const daysInPrevMonth = prevMonth.getDate();
  const prevMonthDays = [];
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    prevMonthDays.push(daysInPrevMonth - i);
  }

  // Get days from next month
  const nextMonthDays = [];
  const totalCells = 42; // 6 weeks * 7 days
  const currentCells = prevMonthDays.length + daysInMonth;
  for (let i = 1; i <= totalCells - currentCells; i++) {
    nextMonthDays.push(i);
  }

  const handleQuickDateSelect = (date: Date) => {
    onDateSelect(date);
    onClose();
  };

  const handleDateClick = (day: number, isCurrentMonth: boolean = true) => {
    const date = new Date(currentYear, isCurrentMonth ? currentMonth : currentMonth - 1, day);
    onDateSelect(date);
    onClose();
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Select Date</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex">
          {/* Left Panel - Quick Date Options */}
          <div className="w-48 p-4 border-r border-gray-700">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Quick Select</h4>
            <div className="space-y-2">
              {quickDateOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickDateSelect(option.date)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    option.label === 'Today' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right Panel - Calendar */}
          <div className="flex-1 p-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-400" />
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">
                    {monthNames[currentMonth]} {currentYear}
                  </span>
                  <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-xs text-gray-400 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Previous month days */}
              {prevMonthDays.map((day) => (
                <button
                  key={`prev-${day}`}
                  onClick={() => handleDateClick(day, false)}
                  className="p-2 text-sm text-gray-500 hover:bg-gray-700 rounded transition-colors"
                >
                  {day}
                </button>
              ))}

              {/* Current month days */}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const isToday = 
                  day === today.getDate() && 
                  currentMonth === today.getMonth() && 
                  currentYear === today.getFullYear();
                const isSelected = 
                  day === selectedDate.getDate() && 
                  currentMonth === selectedDate.getMonth() && 
                  currentYear === selectedDate.getFullYear();

                return (
                  <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`p-2 text-sm rounded transition-colors ${
                      isSelected
                        ? 'bg-purple-600 text-white'
                        : isToday
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}

              {/* Next month days */}
              {nextMonthDays.map((day) => (
                <button
                  key={`next-${day}`}
                  onClick={() => handleDateClick(day, false)}
                  className="p-2 text-sm text-gray-500 hover:bg-gray-700 rounded transition-colors"
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatePickerModal;
