import React, { useState, useEffect } from 'react';
import { Play, Square, Tag, DollarSign, FolderOpen, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { TimerState } from './types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Project } from '@/redux/api/project';
import { Task } from '@/redux/api/project';

interface TimerInputProps {
  timerState: TimerState;
  projects: Project[];
  tasks: Task[];
  onStart: () => void;
  onStop: () => void;
  onDescriptionChange: (description: string) => void;
  onProjectChange: (projectId: string) => void;
  onTaskChange: (taskId: string) => void;
  onBillableChange: (billable: boolean) => void;
  onManualEntryClick: () => void;
}

export const TimerInput: React.FC<TimerInputProps> = ({
  timerState,
  projects,
  tasks,
  onStart,
  onStop,
  onDescriptionChange,
  onProjectChange,
  onTaskChange,
  onBillableChange,
  onManualEntryClick,
}) => {
  const [displayTime, setDisplayTime] = useState('0:00:00');
  const [showProjectSelect, setShowProjectSelect] = useState(false);

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
      onStart();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !timerState.isRunning) {
      onStart();
    }
  };

  const selectedProject = projects.find(p => p.id === timerState.project_id);
  const selectedTask = tasks.find(t => t.id === timerState.task_id);

  return (
    <div className="bg-gray-950 border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          {/* Timer Input */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-center gap-3 bg-gray-900 rounded-lg px-4 py-3 border border-gray-800 hover:border-purple-600/50 transition-colors">
              <Input
                type="text"
                placeholder="What have you done?"
                value={timerState.currentDescription}
                onChange={(e) => onDescriptionChange(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={timerState.isRunning}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base text-white placeholder:text-gray-500"
              />
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Popover open={showProjectSelect} onOpenChange={setShowProjectSelect}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={cn(
                        "h-8 w-8 hover:bg-gray-800 relative",
                        timerState.project_id && timerState.task_id 
                          ? "text-purple-500" 
                          : "text-gray-400 hover:text-white"
                      )}
                      disabled={timerState.isRunning}
                      title={
                        !timerState.project_id 
                          ? "Select project and task (Required)" 
                          : !timerState.task_id 
                          ? "Select task (Required)" 
                          : "Project and task selected"
                      }
                    >
                      <FolderOpen className="h-4 w-4" />
                      {(!timerState.project_id || !timerState.task_id) && !timerState.isRunning && (
                        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-red-500 rounded-full" />
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end">
                    <div className="p-3 space-y-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Project <span className="text-red-500">*</span>
                        </label>
                        <Select 
                          value={timerState.project_id || ''} 
                          onValueChange={onProjectChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a project" />
                          </SelectTrigger>
                          <SelectContent>
                            {projects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {timerState.project_id && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Task <span className="text-red-500">*</span>
                          </label>
                          <Select 
                            value={timerState.task_id || ''} 
                            onValueChange={onTaskChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a task" />
                            </SelectTrigger>
                            <SelectContent>
                              {tasks.length > 0 ? (
                                tasks.map((task) => (
                                  <SelectItem key={task.id} value={task.id}>
                                    {task.title}
                                  </SelectItem>
                                ))
                              ) : (
                                <div className="px-2 py-6 text-center text-sm text-gray-500">
                                  No tasks available
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      
                      {!timerState.project_id && (
                        <p className="text-xs text-gray-500">
                          Select a project to see available tasks
                        </p>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn(
                    "h-8 w-8 hover:bg-gray-800",
                    timerState.billable ? "text-green-500" : "text-gray-400 hover:text-white"
                  )}
                  onClick={() => onBillableChange(!timerState.billable)}
                  disabled={timerState.isRunning}
                  title="Toggle billable"
                >
                  <DollarSign className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800"
                  onClick={onManualEntryClick}
                  title="Add manual time entry"
                >
                  <Clock className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Selected Project/Task Display */}
            <div className="flex items-center gap-2 text-xs px-2">
              {!selectedProject && !timerState.isRunning && (
                <span className="flex items-center gap-1 text-red-400">
                  <span className="h-1.5 w-1.5 bg-red-500 rounded-full" />
                  Project and task required
                </span>
              )}
              {selectedProject && !selectedTask && !timerState.isRunning && (
                <span className="flex items-center gap-1 text-yellow-400">
                  <FolderOpen className="h-3 w-3" />
                  {selectedProject.name}
                  <span className="ml-2 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-yellow-500 rounded-full" />
                    Task required
                  </span>
                </span>
              )}
              {selectedProject && selectedTask && (
                <>
                  <span className="flex items-center gap-1 text-gray-400">
                    <FolderOpen className="h-3 w-3" />
                    {selectedProject.name}
                  </span>
                  <span className="flex items-center gap-1 text-gray-400">
                    <Tag className="h-3 w-3" />
                    {selectedTask.title}
                  </span>
                  {timerState.billable && (
                    <span className="flex items-center gap-1 text-green-500">
                      <DollarSign className="h-3 w-3" />
                      Billable
                    </span>
                  )}
                </>
              )}
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

