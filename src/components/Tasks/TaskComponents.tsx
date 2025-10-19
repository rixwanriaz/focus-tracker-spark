import React, { useState, useCallback } from "react";
import { Plus, Calendar, Clock, User, AlertCircle, CheckCircle2, Circle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Task, TaskStatus, TaskPriority, CreateTaskRequest } from "@/redux/api/project";

// Priority configuration
const taskPriorityConfig = {
  low: { label: "Low", dot: "bg-green-400" },
  medium: { label: "Medium", dot: "bg-yellow-400" },
  high: { label: "High", dot: "bg-red-400" },
};

// Status configuration
const taskStatusConfig = {
  not_started: { label: "Not Started", dot: "bg-yellow-400", icon: Clock },
  in_progress: { label: "In Progress", dot: "bg-blue-400", icon: AlertCircle },
  completed: { label: "Completed", dot: "bg-green-400", icon: CheckCircle2 },
};

// Helper function to format dates
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Helper function to check if task is overdue
const isOverdue = (dueDate: string): boolean => {
  return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
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

  const handleStatusToggle = () => {
    const newStatus = task.status === "completed" ? "not_started" : "completed";
    onStatusChange?.(task.id, newStatus);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate?.(task.id, editData);
    setIsEditing(false);
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

  const priorityConfig = taskPriorityConfig[task.priority];
  const statusConfig = taskStatusConfig[task.status];
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-3">
                <Input
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <Textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  rows={2}
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <div className="flex gap-2">
                  <Select
                    value={editData.priority}
                    onValueChange={(value: TaskPriority) =>
                      setEditData({ ...editData, priority: value })
                    }
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {Object.entries(taskPriorityConfig).map(([value, config]) => (
                        <SelectItem key={value} value={value} className="text-gray-300">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${config.dot}`}></div>
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="date"
                    value={editData.due_date}
                    onChange={(e) => setEditData({ ...editData, due_date: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white w-40"
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel} className="border-gray-600 text-gray-300">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={task.status === "completed"}
                    onCheckedChange={handleStatusToggle}
                    className="border-gray-600 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                  <h3 className={cn(
                    "font-semibold text-white text-lg",
                    task.status === "completed" && "line-through text-gray-400"
                  )}>
                    {task.title}
                  </h3>
                </div>

                {task.description && (
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {task.description}
                  </p>
                )}

                <div className="flex items-center gap-3 flex-wrap">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full",
                      `bg-${task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'yellow' : 'green'}-500/20`,
                      `text-${task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'yellow' : 'green'}-300`
                    )}
                  >
                    <div className={`w-2 h-2 rounded-full ${priorityConfig.dot}`}></div>
                    {priorityConfig.label}
                  </Badge>

                  <Badge
                    variant="secondary"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/50 text-gray-300"
                  >
                    <StatusIcon className="h-4 w-4" />
                    {statusConfig.label}
                  </Badge>

                  {task.assignee && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-300">
                      <User className="h-4 w-4" />
                      <span className="font-medium">
                        {task.assignee.first_name} {task.assignee.last_name}
                      </span>
                    </div>
                  )}

                  {task.due_date && (
                    <div className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full",
                      isOverdue(task.due_date) ? "bg-red-500/20 text-red-300" : "bg-gray-800/50"
                    )}>
                      <Calendar className={cn("h-4 w-4", isOverdue(task.due_date) ? "text-red-400" : "text-orange-400")} />
                      <span className="font-medium">{formatDate(task.due_date)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {!isEditing && (
            <div className="flex items-center gap-2 ml-4">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleEdit}
                className="text-gray-400 hover:text-white hover:bg-gray-700"
              >
                Edit
              </Button>
              {onDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(task.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
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
      <div className="flex flex-col items-center justify-center py-16">
        <div className="p-4 bg-gray-800/50 rounded-full mb-6">
          <Circle className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No tasks yet</h3>
        <p className="text-gray-400 text-sm text-center max-w-md">
          {emptyMessage}
        </p>
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
  assignees?: Array<{ id: string; email: string }>;
  assigneesLoading?: boolean;
  onEnsureAssignees?: () => void;
  loading?: boolean;
}

export const NewTaskDialog: React.FC<NewTaskDialogProps> = ({
  projectId,
  onCreateTask,
  assignees = [],
  assigneesLoading = false,
  onEnsureAssignees,
  loading = false,
}) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateTaskRequest>({
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
    assignee_id: undefined,
    project_id: projectId,
  });

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    // Clean up form data - convert empty strings to undefined for optional fields
    const cleanedFormData: CreateTaskRequest = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      priority: formData.priority,
      due_date: formData.due_date || undefined,
      assignee_id: formData.assignee_id || undefined,
      project_id: projectId,
    };

    onCreateTask(projectId, cleanedFormData);
    
    // Reset form
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      due_date: "",
      assignee_id: undefined,
      project_id: projectId,
    });
    setOpen(false);
  }, [formData, projectId, onCreateTask]);

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (value) {
          onEnsureAssignees?.();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-200">
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 text-white shadow-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Plus className="h-5 w-5 text-purple-400" />
            Create New Task
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-sm">
            Add a new task to your project
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title"
              required
              className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800 focus:border-purple-500/50 transition-all duration-200"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter task description"
              rows={3}
              className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800 focus:border-purple-500/50 transition-all duration-200"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Priority</label>
              <Select
                value={formData.priority}
                onValueChange={(value: TaskPriority) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-purple-500/50 transition-all duration-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 shadow-xl">
                  {Object.entries(taskPriorityConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value} className="text-gray-300 hover:bg-gray-700 focus:bg-gray-700">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${config.dot}`}></div>
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Due Date</label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                className="bg-gray-800/50 border-gray-700 text-white focus:bg-gray-800 focus:border-purple-500/50 transition-all duration-200"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Assignee</label>
            <Select
              value={formData.assignee_id || "unassigned"}
              onValueChange={(value) => setFormData(prev => ({ ...prev, assignee_id: value === "unassigned" ? undefined : value }))}
            >
              <SelectTrigger className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-purple-500/50 transition-all duration-200">
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 shadow-xl">
                {assigneesLoading && (
                  <SelectItem value="loading" disabled className="text-gray-500">
                    Loading members...
                  </SelectItem>
                )}
                <SelectItem value="unassigned" className="text-gray-300 hover:bg-gray-700 focus:bg-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    Unassigned
                  </div>
                </SelectItem>
                {!assigneesLoading && assignees.length > 0 ? (
                  assignees.map((assignee) => (
                    <SelectItem key={assignee.id} value={assignee.id} className="text-gray-300 hover:bg-gray-700 focus:bg-gray-700">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                        {assignee.email}
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  !assigneesLoading && (
                  <SelectItem value="no-members" disabled className="text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                      No project members found
                    </div>
                  </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-gray-600/50 text-gray-300 hover:bg-gray-700 hover:border-gray-500 transition-all duration-200">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.title.trim()} className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all duration-200">
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};