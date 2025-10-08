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
import { CalendarIcon, Loader2 } from 'lucide-react';
import { AppDispatch, RootState } from '@/redux/store';
import { createManualEntry } from '@/redux/slice/timeSlice';
import { getProjectTasks } from '@/redux/slice/taskSlice';
import { toast } from 'sonner';
import { Project } from '@/redux/api/project';
import { Task } from '@/redux/api/project';

interface ManualTimeEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
  onSuccess?: () => void;
}

export const ManualTimeEntryDialog: React.FC<ManualTimeEntryDialogProps> = ({
  open,
  onOpenChange,
  projects,
  onSuccess,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { creating } = useSelector((state: RootState) => state.time);
  const { projectTasks, loading: tasksLoading } = useSelector(
    (state: RootState) => state.task
  );

  // Form state
  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [projectId, setProjectId] = useState<string>('');
  const [taskId, setTaskId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [billable, setBillable] = useState(false);
  const [allowOverlap, setAllowOverlap] = useState(false);

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
    setTaskId('');
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate project and task selection
    if (!projectId) {
      toast.error('Please select a project');
      return;
    }

    if (!taskId) {
      toast.error('Please select a task');
      return;
    }

    // Validate times
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startDate = new Date(date);
    startDate.setHours(startHour, startMin, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(endHour, endMin, 0, 0);

    if (endDate <= startDate) {
      toast.error('End time must be after start time');
      return;
    }

    try {
      await dispatch(
        createManualEntry({
          start_ts: startDate.toISOString(),
          end_ts: endDate.toISOString(),
          project_id: projectId,
          task_id: taskId,
          notes: description || undefined,
          billable,
          allow_overlap: allowOverlap,
        })
      ).unwrap();

      toast.success('Time entry created successfully');
      onOpenChange(false);
      resetForm();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error || 'Failed to create time entry');
    }
  };

  const resetForm = () => {
    setDate(new Date());
    setStartTime('09:00');
    setEndTime('17:00');
    setProjectId('');
    setTaskId('');
    setDescription('');
    setBillable(false);
    setAllowOverlap(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Manual Time Entry</DialogTitle>
            <DialogDescription>
              Create a time entry manually by entering the start and end times.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Date Picker */}
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Project Selector */}
            <div className="grid gap-2">
              <Label htmlFor="project">
                Project <span className="text-red-500">*</span>
              </Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger id="project">
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

            {/* Task Selector */}
            {projectId && (
              <div className="grid gap-2">
                <Label htmlFor="task">
                  Task <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={taskId}
                  onValueChange={setTaskId}
                  disabled={tasksLoading}
                >
                  <SelectTrigger id="task">
                    <SelectValue placeholder="Select a task" />
                  </SelectTrigger>
                  <SelectContent>
                    {tasks.map((task: Task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="What did you work on?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Billable Switch */}
            <div className="flex items-center justify-between">
              <Label htmlFor="billable" className="cursor-pointer">
                Billable
              </Label>
              <Switch
                id="billable"
                checked={billable}
                onCheckedChange={setBillable}
              />
            </div>

            {/* Allow Overlap Switch */}
            <div className="flex items-center justify-between">
              <Label htmlFor="allow-overlap" className="cursor-pointer">
                Allow time overlap
              </Label>
              <Switch
                id="allow-overlap"
                checked={allowOverlap}
                onCheckedChange={setAllowOverlap}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Entry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

