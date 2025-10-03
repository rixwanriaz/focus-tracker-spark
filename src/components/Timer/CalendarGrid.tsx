import React, { useState, useEffect } from 'react';
import { ChevronRight, Plus, Play, Clock } from 'lucide-react';
import TimeEntryModal from './TimeEntryModal';

interface CalendarGridProps {
  isTimerRunning: boolean;
  onTimerToggle: () => void;
  currentTask?: string | null;
  onTaskUpdate?: (task: string) => void;
  selectedDate: Date;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ 
  isTimerRunning, 
  onTimerToggle, 
  currentTask = null,
  onTaskUpdate,
  selectedDate
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Generate week data based on selected date
  const generateWeekData = (date: Date) => {
    const today = new Date();
    const weekDays = [];
    
    // Get the start of the week (Monday)
    const startOfWeek = new Date(date);
    const dayOfWeek = date.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Sunday is 0, so -6 to get Monday
    startOfWeek.setDate(date.getDate() + daysToMonday);
    
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);
      
      const isSelected = currentDay.toDateString() === date.toDateString();
      const isToday = currentDay.toDateString() === today.toDateString();
      
      // Mock time data - in a real app, this would come from your data store
      const mockTime = isSelected ? '0:29:12' : '0:00:00';
      
      weekDays.push({
        day: dayNames[currentDay.getDay()],
        date: currentDay.getDate().toString(),
        time: mockTime,
        active: isSelected,
        isToday: isToday,
        fullDate: currentDay
      });
    }
    
    return weekDays;
  };

  const weekDays = generateWeekData(selectedDate);

  const timeSlots = [
    '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', 
    '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'
  ];

  // Calculate current time position in the grid
  const getCurrentTimePosition = () => {
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();
    
    // Convert to 12-hour format
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const ampm = hour < 12 ? 'AM' : 'PM';
    const timeString = `${hour12}:00 ${ampm}`;
    
    const slotIndex = timeSlots.findIndex(slot => slot === timeString);
    
    if (slotIndex === -1) return null;
    
    // Calculate position within the slot (0-1)
    const slotPosition = minute / 60;
    
    return {
      slotIndex,
      position: slotPosition,
      timeString: `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`
    };
  };

  const timePosition = getCurrentTimePosition();

  const handleTimeEntryClick = (entry: any) => {
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  const handleSaveEntry = (data: any) => {
    console.log('Saving time entry:', data);
    if (onTaskUpdate) {
      onTaskUpdate(data.description);
    }
    // Here you would typically save to your backend/state management
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEntry(null);
  };

  const handleAddTask = () => {
    // Start timer if not running
    if (!isTimerRunning) {
      onTimerToggle();
    }
    
    setSelectedEntry({
      description: '',
      startTime: timePosition?.timeString || '4:00 AM',
      endTime: timePosition?.timeString || '4:00 AM'
    });
    setIsModalOpen(true);
  };

  return (
    <div className="flex-1 bg-gray-900 overflow-auto">
      <div className="flex h-full">
        {/* Time Column */}
        <div className="w-20 sm:w-24 border-r border-gray-800 flex-shrink-0 bg-gray-900/50">
          <div className="h-16 border-b border-gray-800 bg-gray-800/30"></div>
          {timeSlots.map((time, idx) => {
            const isCurrentHour = timePosition && timePosition.slotIndex === idx;
            return (
              <div 
                key={idx} 
                className={`h-12 sm:h-14 border-b border-gray-800 px-2 sm:px-3 py-2 text-xs flex items-center transition-colors ${
                  isCurrentHour ? 'text-purple-400 bg-purple-900/10' : 'text-gray-500 hover:text-gray-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isCurrentHour && <Clock className="w-3 h-3 text-purple-400" />}
                  <span className="hidden sm:inline font-medium">{time}</span>
                  <span className="sm:hidden text-xs font-medium">{time.split(' ')[0]}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Day Columns */}
        <div className="flex-1 flex">
          {weekDays.map((day, idx) => (
            <div key={idx} className="flex-1 min-w-[90px] sm:min-w-[130px] border-r border-gray-800 last:border-r-0 hover:bg-gray-800/20 transition-colors">
              <div className={`h-16 border-b border-gray-800 p-3 transition-all duration-200 ${
                day.active ? 'bg-gradient-to-r from-purple-900/30 to-purple-800/20 border-b-purple-600/30' : 
                day.isToday ? 'bg-gray-800/30' : 'hover:bg-gray-800/10'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className={`text-lg sm:text-2xl font-bold transition-colors ${
                      day.active ? 'text-purple-400' : 
                      day.isToday ? 'text-cyan-400' : 'text-gray-300'
                    }`}>
                      {day.date}
                    </div>
                    <div className={`text-xs font-medium transition-colors ${
                      day.active ? 'text-purple-300' : 'text-gray-500'
                    }`}>
                      {day.day}
                    </div>
                  </div>
                  <div className={`text-xs font-semibold mt-1 sm:mt-0 px-2 py-1 rounded-md transition-colors ${
                    day.active ? 'text-purple-200 bg-purple-800/30' : 
                    day.time !== '0:00:00' ? 'text-green-400 bg-green-900/20' : 'text-gray-400'
                  }`}>
                    {day.time}
                  </div>
                </div>
              </div>
              {timeSlots.map((_, slotIdx) => {
                const isCurrentSlot = day.active && timePosition && timePosition.slotIndex === slotIdx;
                const isPastSlot = day.active && timePosition && timePosition.slotIndex > slotIdx;
                const isFutureSlot = day.active && timePosition && timePosition.slotIndex < slotIdx;
                
                return (
                  <div 
                    key={slotIdx} 
                    className={`h-12 sm:h-14 border-b border-gray-800 relative group transition-all duration-200 ${
                      isCurrentSlot ? 'bg-purple-900/10' : 
                      isPastSlot ? 'bg-gray-800/20' : 
                      'hover:bg-gray-800/30'
                    }`}
                  >
                    {/* Current time line indicator */}
                    {isCurrentSlot && timePosition && (
                      <div 
                        className="absolute left-0 right-0 h-0.5 bg-purple-400 z-10"
                        style={{ top: `${timePosition.position * 100}%` }}
                      >
                        <div className="absolute -left-1 -top-1 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      </div>
                    )}

                    {/* Timer indicator */}
                    {isCurrentSlot && isTimerRunning && (
                      <div 
                        className="absolute left-2 right-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg shadow-lg border border-purple-400/50 cursor-pointer hover:from-purple-500 hover:to-purple-600 transition-all duration-200 transform hover:scale-[1.02]"
                        style={{
                          top: '4px',
                          height: 'calc(100% - 8px)',
                          zIndex: 5
                        }}
                        onClick={handleAddTask}
                      >
                        <div className="p-2 text-xs text-white h-full flex flex-col justify-between">
                          {currentTask ? (
                            <>
                              <div className="font-medium truncate text-white/90">{currentTask}</div>
                              <div className="flex items-center justify-between mt-1">
                                <div className="flex-1 bg-purple-500/50 rounded-full h-1 mr-2">
                                  <div className="bg-white rounded-full h-full w-1/3 animate-pulse"></div>
                                </div>
                                <Play className="w-3 h-3 text-white flex-shrink-0 animate-pulse" />
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                <span className="text-xs text-white/80">Click to add task</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Add time entry button on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button 
                        onClick={handleAddTask}
                        className="w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-all duration-200 transform hover:scale-110 shadow-lg"
                      >
                        <Plus className="w-4 h-4 text-white" />
                      </button>
                    </div>

                    {/* Past time indicator */}
                    {isPastSlot && (
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-800/10 pointer-events-none"></div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Right Sidebar - Hidden on mobile, visible on larger screens */}
        <div className="hidden lg:block w-64 border-l border-gray-800 flex-shrink-0">
          <div className="p-4">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3 cursor-pointer hover:bg-gray-800 p-3 rounded-lg transition-colors group">
                <div className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-gray-400 mr-2 group-hover:text-gray-300" />
                  <span className="text-sm font-medium text-gray-200">Goals</span>
                </div>
                <Plus className="w-4 h-4 text-gray-400 group-hover:text-gray-300" />
              </div>
              <button className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm py-2 px-3 rounded-lg transition-colors">
                CREATE A GOAL
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3 cursor-pointer hover:bg-gray-800 p-3 rounded-lg transition-colors group">
                <div className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-gray-400 mr-2 group-hover:text-gray-300" />
                  <span className="text-sm font-medium text-gray-200">Favorites</span>
                </div>
                <Plus className="w-4 h-4 text-gray-400 group-hover:text-gray-300" />
              </div>
              <div className="text-xs text-gray-500 bg-gray-800 px-3 py-2 rounded-lg">
                FAVORITE
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Time Entry Modal */}
      <TimeEntryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveEntry}
        initialData={selectedEntry}
      />
    </div>
  );
};

export default CalendarGrid;
