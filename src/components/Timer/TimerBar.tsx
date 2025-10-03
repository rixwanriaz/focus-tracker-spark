import React from 'react';
import { 
  Plus,
  FileText,
  Tag,
  FolderOpen,
  DollarSign
} from 'lucide-react';

interface TimerBarProps {
  taskDescription: string;
  setTaskDescription: (description: string) => void;
  isTimerRunning: boolean;
  elapsedTime: number;
  startTime: string | null;
  endTime: string | null;
  onStartStop: () => void;
}

const TimerBar: React.FC<TimerBarProps> = ({
  taskDescription,
  setTaskDescription,
  isTimerRunning,
  elapsedTime,
  startTime,
  endTime,
  onStartStop
}) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-900 border-b border-gray-800 px-4 sm:px-6 py-4">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Task Input and Action Buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1 w-full lg:w-auto">
          <div className="relative flex-1 w-full sm:w-auto">
            <input 
              type="text"
              placeholder="What have you done?"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className="w-full sm:min-w-[300px] bg-gray-800 text-gray-100 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 placeholder-gray-500 border border-gray-700 hover:border-gray-600 transition-colors"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button 
              className="p-2.5 hover:bg-gray-800 rounded-lg transition-colors group"
              title="Add note"
            >
              <FileText className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
            </button>
            <button 
              className="p-2.5 hover:bg-gray-800 rounded-lg transition-colors group"
              title="Add tag"
            >
              <Tag className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
            </button>
            <button 
              className="p-2.5 hover:bg-gray-800 rounded-lg transition-colors group"
              title="Select project"
            >
              <FolderOpen className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
            </button>
            <button 
              className="p-2.5 hover:bg-gray-800 rounded-lg transition-colors group"
              title="Set billable rate"
            >
              <DollarSign className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Timer Display and Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-4">
          {/* Time Display */}
          <div className="flex items-center gap-3">
            {startTime && (
              <div className="text-sm text-gray-400 bg-gray-800 px-3 py-1.5 rounded-lg">
                {startTime}
              </div>
            )}
            <div className="text-2xl sm:text-3xl font-mono font-bold text-white bg-gray-800 px-4 py-2 rounded-lg min-w-[120px] text-center">
              {formatTime(elapsedTime)}
            </div>
            {endTime && (
              <div className="text-sm text-gray-400 bg-gray-800 px-3 py-1.5 rounded-lg">
                {endTime}
              </div>
            )}
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-2">
            <button 
              onClick={onStartStop}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 ${
                isTimerRunning 
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/25' 
                  : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/25'
              }`}
            >
              {isTimerRunning ? 'Stop' : 'Start'}
            </button>
            <button 
              className="p-2.5 hover:bg-gray-800 rounded-lg transition-colors group"
              title="Add new entry"
            >
              <Plus className="w-5 h-5 text-gray-400 group-hover:text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimerBar;
