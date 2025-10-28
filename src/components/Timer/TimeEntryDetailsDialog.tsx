import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Loader2, Edit, Clock, DollarSign, User, Briefcase, CheckCircle, XCircle } from 'lucide-react';
import { AppDispatch, RootState } from '@/redux/store';
import { updateEntry, getEntry } from '@/redux/slice/timeSlice';
import { getProjectTasks } from '@/redux/slice/taskSlice';
import { toast } from 'sonner';
import { Project } from '@/redux/api/project';
import { Task } from '@/redux/api/project';
import { TimeEntry as ComponentTimeEntry } from './types';
import { TimeEntry as ApiTimeEntry } from '@/redux/api/time';

interface TimeEntryDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: ComponentTimeEntry | null;
  projects: Project[];
  onUpdateSuccess?: () => void;
  onEntryUpdate?: (entry: ComponentTimeEntry) => void;
}

export const TimeEntryDetailsDialog: React.FC<TimeEntryDetailsDialogProps> = ({
  open,
  onOpenChange,
  entry,
  projects,
  onUpdateSuccess,
  onEntryUpdate,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { updating } = useSelector((state: RootState) => state.time);
  const { projectTasks, loading: tasksLoading } = useSelector(
    (state: RootState) => state.task
  );

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);

  // Form state - initialized from entry
  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [projectId, setProjectId] = useState<string>('');
  const [taskId, setTaskId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [billable, setBillable] = useState(false);
  const [allowOverlap, setAllowOverlap] = useState(false);

  // Initialize form when entry changes
  useEffect(() => {
    if (entry) {
      const entryDate = new Date(entry.startTime);
      setDate(entryDate);
      setStartTime(format(entry.startTime, 'HH:mm'));
      setEndTime(entry.endTime ? format(entry.endTime, 'HH:mm') : '');
      setProjectId(entry.project_id || '');
      setTaskId(entry.task_id || '');
      setDescription(entry.description || '');
      setBillable(entry.billable);
      setAllowOverlap(false); // Default to false for updates
      setIsEditing(false); // Reset to view mode
    }
  }, [entry]);

  // Get tasks for selected project
  const tasks = projectId ? projectTasks[projectId] || [] : [];

  // Load tasks when project changes
  useEffect(() => {
    if (projectId && !projectTasks[projectId]) {
      dispatch(getProjectTasks({ projectId, filters: {} }));
    }
  }, [projectId, projectTasks, dispatch]);

  // Reset task when project changes
  useEffect(() => {
    if (isEditing) {
      setTaskId('');
    }
  }, [projectId, isEditing]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!entry) return;

    // Validate times
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startDate = new Date(date);
    startDate.setHours(startHour, startMin, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(endHour, endMin, 0, 0);

    if (endTime && endDate <= startDate) {
      toast.error('End time must be after start time');
      return;
    }

    // Prepare update data - only include changed fields
    const updateData: any = {};

    if (startTime !== format(entry.startTime, 'HH:mm')) {
      updateData.start_ts = startDate.toISOString();
    }

    if (entry.endTime) {
      if (endTime !== format(entry.endTime, 'HH:mm')) {
        updateData.end_ts = endDate.toISOString();
      }
    } else if (endTime) {
      updateData.end_ts = endDate.toISOString();
    }

    if (projectId !== (entry.project_id || '')) {
      updateData.project_id = projectId || undefined;
    }

    if (taskId !== (entry.task_id || '')) {
      updateData.task_id = taskId || undefined;
    }

    if (description !== (entry.description || '')) {
      updateData.notes = description || undefined;
    }

    if (billable !== entry.billable) {
      updateData.billable = billable;
    }

    if (allowOverlap) {
      updateData.allow_overlap = true;
    }

    // Check if anything changed
    if (Object.keys(updateData).length === 0) {
      toast.info('No changes detected');
      setIsEditing(false);
      return;
    }

    try {
      await dispatch(
        updateEntry({
          entryId: entry.id,
          data: updateData,
        })
      ).unwrap();

      // Fetch the updated entry details
      const apiEntry: ApiTimeEntry = await dispatch(getEntry(entry.id)).unwrap();

      // Convert API entry to component format
      const updatedEntry: ComponentTimeEntry = {
        id: apiEntry.id,
        description: apiEntry.notes || apiEntry.description || '',
        startTime: new Date(apiEntry.start_ts),
        endTime: apiEntry.end_ts ? new Date(apiEntry.end_ts) : undefined,
        duration: apiEntry.duration_seconds || 0,
        project_id: apiEntry.project_id,
        project: apiEntry.project_name ? {
          id: apiEntry.project_id || '',
          name: apiEntry.project_name
        } : apiEntry.project,
        task_id: apiEntry.task_id,
        task: apiEntry.task_name ? {
          id: apiEntry.task_id || '',
          title: apiEntry.task_name
        } : apiEntry.task,
        billable: apiEntry.billable,
        color: '#8b5cf6',
      };

      // Update the entry in the dialog
      if (onEntryUpdate) {
        onEntryUpdate(updatedEntry);
      }

      toast.success('Time entry updated successfully');
      setIsEditing(false);
      onUpdateSuccess?.();
    } catch (error: any) {
      toast.error(error || 'Failed to update time entry');
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleCancelEdit = () => {
    // Reset form to original values
    if (entry) {
      const entryDate = new Date(entry.startTime);
      setDate(entryDate);
      setStartTime(format(entry.startTime, 'HH:mm'));
      setEndTime(entry.endTime ? format(entry.endTime, 'HH:mm') : '');
      setProjectId(entry.project_id || '');
      setTaskId(entry.task_id || '');
      setDescription(entry.description || '');
      setBillable(entry.billable);
      setAllowOverlap(false);
    }
    setIsEditing(false);
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getEntryColor = (entry: ComponentTimeEntry) => {
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

  if (!entry) return null;

  const entryColorClass = getEntryColor(entry);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-gray-900 border-gray-700">
        <DialogHeader className="border-b border-gray-700 pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg",
              entryColorClass
            )}>
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold">Time Entry Details</span>
              <span className="text-sm text-gray-400 font-normal">
                {format(entry.startTime, 'EEEE, MMMM d, yyyy')}
              </span>
            </div>
            {entry.billable && (
              <div className="ml-auto flex items-center gap-1 bg-emerald-900/30 border border-emerald-600/50 px-3 py-1.5 rounded-lg">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                <span className="text-sm text-emerald-300 font-medium">Billable</span>
              </div>
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            View and edit time entry details. All fields are optional when updating.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* Read-only Info Section */}
          {!isEditing && (
            <div className="space-y-6">
              {/* Time and Duration Card */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-purple-400" />
                      <span className="text-sm font-medium text-gray-300">Date & Time</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-semibold text-white">
                        {format(entry.startTime, 'h:mm a')}
                        {entry.endTime && ` - ${format(entry.endTime, 'h:mm a')}`}
                      </p>
                      <p className="text-sm text-gray-400">
                        {entry.endTime ? 'Completed' : 'Running'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-purple-400" />
                      <span className="text-sm font-medium text-gray-300">Duration</span>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {formatDuration(entry.duration)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Project and Task Card */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-purple-400" />
                      <span className="text-sm font-medium text-gray-300">Project</span>
                    </div>
                    <p className="text-white font-medium">
                      {entry.project?.name || 'No project assigned'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-purple-400" />
                      <span className="text-sm font-medium text-gray-300">Task</span>
                    </div>
                    <p className="text-white font-medium">
                      {entry.task?.title || 'No task assigned'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description Card */}
              {entry.description && (
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-purple-400" />
                      <span className="text-sm font-medium text-gray-300">Description</span>
                    </div>
                    <p className="text-white leading-relaxed">
                      {entry.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Billable Status */}
              <div className="flex items-center justify-center gap-3 bg-gray-800/30 border border-gray-700 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  {entry.billable ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                      <span className="text-emerald-300 font-medium">This entry is billable</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-400">This entry is not billable</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Edit Form */}
          {isEditing && (
            <form onSubmit={handleUpdate} className="space-y-6">
              {/* Date and Time Section */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-purple-400" />
                  Date & Time
                </h3>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date" className="text-gray-300">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'justify-start text-left font-normal bg-gray-800 border-gray-600 text-white hover:bg-gray-700',
                            !date && 'text-gray-400'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-purple-400" />
                          {date ? format(date, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(d) => d && setDate(d)}
                          initialFocus
                          className="bg-gray-800 text-white"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="start-time" className="text-gray-300">Start Time</Label>
                      <Input
                        id="start-time"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="end-time" className="text-gray-300">End Time</Label>
                      <Input
                        id="end-time"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Project and Task Section */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-purple-400" />
                  Project & Task
                </h3>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="project" className="text-gray-300">
                      Project <span className="text-gray-500 text-xs">(Optional)</span>
                    </Label>
                    <Select value={projectId} onValueChange={setProjectId}>
                      <SelectTrigger id="project" className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue placeholder="Select a project (optional)" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id} className="text-white hover:bg-gray-700">
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {projectId && (
                    <div className="grid gap-2">
                      <Label htmlFor="task" className="text-gray-300">
                        Task <span className="text-gray-500 text-xs">(Optional)</span>
                      </Label>
                      <Select
                        value={taskId}
                        onValueChange={setTaskId}
                        disabled={tasksLoading}
                      >
                        <SelectTrigger id="task" className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue placeholder="Select a task (optional)" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          {tasks.map((task: Task) => (
                            <SelectItem key={task.id} value={task.id} className="text-white hover:bg-gray-700">
                              {task.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              {/* Description and Settings Section */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-400" />
                  Description & Settings
                </h3>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="description" className="text-gray-300">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="What did you work on?"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <Label htmlFor="billable" className="cursor-pointer text-gray-300 flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-emerald-400" />
                        Billable
                      </Label>
                      <Switch
                        id="billable"
                        checked={billable}
                        onCheckedChange={setBillable}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <Label htmlFor="allow-overlap" className="cursor-pointer text-gray-300">
                        Allow time overlap (Admin only)
                      </Label>
                      <Switch
                        id="allow-overlap"
                        checked={allowOverlap}
                        onCheckedChange={setAllowOverlap}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        <DialogFooter className="border-t border-gray-700 pt-4">
          {!isEditing ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
              >
                Close
              </Button>
              <Button
                onClick={handleEditToggle}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Entry
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={updating}
                className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={updating}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Entry
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
