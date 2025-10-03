import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Calendar,
  List,
  Settings
} from 'lucide-react';
import { Sidebar } from '@/components/Layout';
import TimerBar from './TimerBar';
import CalendarGrid from './CalendarGrid';
import DatePickerModal from './DatePickerModal';

const TimerModule: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState('calendar');
  const [weekView, setWeekView] = useState('W40');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [taskDescription, setTaskDescription] = useState('');
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [currentTask, setCurrentTask] = useState<string | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isTimerRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTimerRunning]);

  const handleStartStop = () => {
    if (!isTimerRunning) {
      setStartTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
      setEndTime(null);
      setElapsedTime(0); // Reset timer to zero when starting
    } else {
      setEndTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
      setElapsedTime(0); // Reset timer to zero when stopping
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const handleTaskUpdate = (task: string) => {
    setCurrentTask(task);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Update week view based on selected date
    const weekNumber = getWeekNumber(date);
    setWeekView(`W${weekNumber}`);
  };

  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const formatSelectedDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Sidebar Component */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed}
        activeItem="Timer"
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Timer Bar Component */}
        <TimerBar
          taskDescription={taskDescription}
          setTaskDescription={setTaskDescription}
          isTimerRunning={isTimerRunning}
          elapsedTime={elapsedTime}
          startTime={startTime}
          endTime={endTime}
          onStartStop={handleStartStop}
        />

        {/* Week Selector & View Options */}
        <div className="bg-gray-900 border-b border-gray-800 px-4 sm:px-6 py-3">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Left Section - Week Navigation */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                  <ChevronLeft className="w-4 h-4 text-gray-400" />
                </button>
                <button 
                  onClick={() => setIsDatePickerOpen(true)}
                  className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-200">{formatSelectedDate(selectedDate)} · {weekView}</span>
                </button>
                <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <div className="text-sm text-gray-500 bg-gray-800 px-3 py-2 rounded-lg">
                WEEK TOTAL: <span className="text-gray-300 font-medium">0:29:12</span>
              </div>
            </div>

            {/* Right Section - View Options */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Week view</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
              
              {/* View Toggle Buttons */}
              <div className="flex bg-gray-800 rounded-lg">
                <button 
                  onClick={() => setActiveView('calendar')}
                  className={`px-4 py-2 text-sm rounded-l-lg transition-colors ${
                    activeView === 'calendar' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Calendar
                </button>
                <button 
                  onClick={() => setActiveView('list')}
                  className={`px-4 py-2 text-sm transition-colors ${
                    activeView === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  List view
                </button>
                <button 
                  onClick={() => setActiveView('timesheet')}
                  className={`px-4 py-2 text-sm rounded-r-lg transition-colors ${
                    activeView === 'timesheet' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Timesheet
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors" title="Settings">
                  <Settings className="w-5 h-5 text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors" title="List view">
                  <List className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Project Header */}
        <div className="bg-gray-900 px-4 sm:px-6 py-3 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="text-cyan-400 font-semibold text-sm bg-gray-800 px-3 py-1 rounded-lg">
              TESTONE
            </div>
            <div className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-lg">
              (NO PROJECT)
            </div>
          </div>
        </div>

        {/* Calendar Grid Component */}
        <CalendarGrid 
          isTimerRunning={isTimerRunning}
          onTimerToggle={handleStartStop}
          currentTask={currentTask}
          onTaskUpdate={handleTaskUpdate}
          selectedDate={selectedDate}
        />

        {/* Bottom Right Chat/Help Button */}
        <div className="fixed bottom-6 right-6 z-40">
          <button className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center shadow-lg hover:bg-purple-700 transition-all duration-200 transform hover:scale-110">
            <div className="text-white text-lg font-bold">?</div>
          </button>
        </div>

        {/* Date Picker Modal */}
        <DatePickerModal
          isOpen={isDatePickerOpen}
          onClose={() => setIsDatePickerOpen(false)}
          onDateSelect={handleDateSelect}
          selectedDate={selectedDate}
        />
      </div>
    </div>
  );
};

export default TimerModule;
