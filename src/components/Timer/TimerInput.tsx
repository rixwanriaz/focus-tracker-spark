import React, { useState, useEffect } from 'react';
import { Play, Square, Tag, DollarSign, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { TimerState } from './types';

interface TimerInputProps {
  timerState: TimerState;
  onStart: (description: string) => void;
  onStop: () => void;
  onDescriptionChange: (description: string) => void;
}

export const TimerInput: React.FC<TimerInputProps> = ({
  timerState,
  onStart,
  onStop,
  onDescriptionChange,
}) => {
  const [displayTime, setDisplayTime] = useState('0:00:00');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerState.isRunning && timerState.startTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - timerState.startTime!.getTime()) / 1000);
        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor((elapsed % 3600) / 60);
        const seconds = elapsed % 60;
        setDisplayTime(`${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      }, 1000);
    } else {
      setDisplayTime('0:00:00');
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState.isRunning, timerState.startTime]);

  const handleToggleTimer = () => {
    if (timerState.isRunning) {
      onStop();
    } else {
      onStart(timerState.currentDescription);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !timerState.isRunning) {
      onStart(timerState.currentDescription);
    }
  };

  return (
    <div className="bg-gray-950 border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          {/* Timer Input */}
          <div className="flex-1 flex items-center gap-3 bg-gray-900 rounded-lg px-4 py-3 border border-gray-800 hover:border-purple-600/50 transition-colors">
            <Input
              type="text"
              placeholder="What have you done?"
              value={timerState.currentDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base text-white placeholder:text-gray-500"
            />
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800">
                <FolderOpen className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800">
                <Tag className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800">
                <DollarSign className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Time Display */}
          <div className={cn(
            "text-2xl font-mono font-semibold min-w-[120px] text-center",
            timerState.isRunning ? "text-purple-500" : "text-gray-500"
          )}>
            {displayTime}
          </div>

          {/* Start/Stop Button */}
          <Button
            onClick={handleToggleTimer}
            size="icon"
            className={cn(
              "h-12 w-12 rounded-full transition-all duration-200",
              timerState.isRunning
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-purple-600 hover:bg-purple-700 text-white"
            )}
          >
            {timerState.isRunning ? (
              <Square className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current ml-0.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

