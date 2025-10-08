import React, { useState } from "react";
import { Plus, Calendar, Clock, User, AlertCircle, CheckCircle2, Circle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Task, TaskStatus, TaskPriority, CreateTaskRequest } from "@/redux/api/project";
import { format, parseISO } from "date-fns";

// Task status configuration
const taskStatusConfig = {
  not_started: { label: "To Do", icon: Circle, color: "text-gray-400" },
  in_progress: { label: "In Progress", icon: Clock, color: "text-blue-400" },
  completed: { label: "Completed", icon: CheckCircle2, color: "text-green-400" },
};

// Task priority configuration
const taskPriorityConfig = {
  low: { label: "Low", color: "bg-gray-100 text-gray-800" },
  medium: { label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  high: { label: "High", color: "bg-orange-100 text-orange-800" },
  urgent: { label: "Urgent", color: "bg-red-100 text-red-800" },
};

export interface TaskItemProps {
  task: Task;
  onUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onDelete?: (taskId: string) => void;
  showProject?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onUpdate,
  onStatusChange,
  onDelete,
  showProject = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description || "",
    priority: task.priority,
    due_date: task.due_date || "",
  });

  const StatusIcon = taskStatusConfig[task.status].icon;
  const PriorityBadge = taskPriorityConfig[task.priority];

  const handleSave = () => {
    if (editData.title.trim()) {
      onUpdate?.(task.id, editData);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      due_date: task.due_date || "",
    });
    setIsEditing(false);
  };

  const formatEstimate = (seconds?: number) => {
    if (!seconds) return null;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return format(parseISO(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== "completed";

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      task.status === "completed" && "opacity-75",
      isOverdue && "border-red-200 bg-red-50"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Status Dropdown */}
          <div className="flex-shrink-0 pt-1">
            <Select
              value={task.status}
              onValueChange={(value: TaskStatus) => onStatusChange?.(task.id, value)}
            >
              <SelectTrigger className="w-32 h-6 text-xs">
                <div className="flex items-center gap-1">
                  <StatusIcon className={cn("h-3 w-3", taskStatusConfig[task.status].color)} />
                  <span>{taskStatusConfig[task.status].label}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(taskStatusConfig).map(([value, config]) => {
                  const IconComponent = config.icon;
                  return (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        <IconComponent className={cn("h-3 w-3", config.color)} />
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-3">
                <Input
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="font-medium"
                  placeholder="Task title"
                />
                <Textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  placeholder="Task description"
                  rows={2}
                />
                <div className="flex gap-2">
                  <Select
                    value={editData.priority}
                    onValueChange={(value: TaskPriority) => setEditData({ ...editData, priority: value })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(taskPriorityConfig).map(([value, config]) => (
                        <SelectItem key={value} value={value}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="date"
                    value={editData.due_date}
                    onChange={(e) => setEditData({ ...editData, due_date: e.target.value })}
                    className="w-40"
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave}>
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className={cn(
                      "font-medium text-gray-900",
                      task.status === "completed" && "line-through text-gray-500"
                    )}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Badge className={cn("text-xs", PriorityBadge.color)}>
                      {PriorityBadge.label}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="h-6 w-6 p-0"
                    >
                      <AlertCircle className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Task Meta */}
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <StatusIcon className={cn("h-3 w-3", taskStatusConfig[task.status].color)} />
                    <span>{taskStatusConfig[task.status].label}</span>
                  </div>
                  
                  {task.assignee && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{task.assignee.first_name} {task.assignee.last_name}</span>
                    </div>
                  )}
                  
                  {task.estimate_seconds && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatEstimate(task.estimate_seconds)}</span>
                    </div>
                  )}
                  
                  {task.due_date && (
                    <div className={cn(
                      "flex items-center gap-1",
                      isOverdue && "text-red-600 font-medium"
                    )}>
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(task.due_date)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export interface TaskListProps {
  tasks: Task[];
  onUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onDelete?: (taskId: string) => void;
  showProject?: boolean;
  emptyMessage?: string;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onUpdate,
  onStatusChange,
  onDelete,
  showProject = false,
  emptyMessage = "No tasks found",
}) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Circle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onUpdate={onUpdate}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
          showProject={showProject}
        />
      ))}
    </div>
  );
};

export interface NewTaskDialogProps {
  projectId: string;
  onCreateTask: (projectId: string, taskData: CreateTaskRequest) => void;
  assignees?: Array<{ id: string; first_name: string; last_name: string }>;
  loading?: boolean;
}

export const NewTaskDialog: React.FC<NewTaskDialogProps> = ({
  projectId,
  onCreateTask,
  assignees = [],
  loading = false,
}) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateTaskRequest>({
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
    project_id: projectId,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    onCreateTask(projectId, formData);
    
    // Reset form
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      due_date: "",
      project_id: projectId,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter task title"
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter task description"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Priority</label>
              <Select
                value={formData.priority}
                onValueChange={(value: TaskPriority) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(taskPriorityConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Due Date</label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>
          </div>
          
          {assignees.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700">Assignee</label>
              <Select
                value={formData.assignee_id || "unassigned"}
                onValueChange={(value) => setFormData({ ...formData, assignee_id: value === "unassigned" ? undefined : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {assignees.map((assignee) => (
                    <SelectItem key={assignee.id} value={assignee.id}>
                      {assignee.first_name} {assignee.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.title.trim()}>
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
