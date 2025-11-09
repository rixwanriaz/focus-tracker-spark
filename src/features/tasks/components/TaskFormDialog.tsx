// src/features/tasks/components/TaskFormDialog.tsx
import React, { useState, useEffect } from "react";
import { Plus, Calendar, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Task, CreateTaskRequest, TaskStatus, TaskPriority } from "@/types/task";

interface ProjectMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<CreateTaskRequest, "project_id">) => Promise<void>;
  loading?: boolean;
  projectId: string;
  projectMembers?: ProjectMember[];
  initialData?: Task;
  mode?: "create" | "edit";
  parentTask?: Task;
}

const taskPriorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

// Today in local timezone formatted for <input type="date">
const TODAY_INPUT = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
  .toISOString()
  .split("T")[0];

export const TaskFormDialog: React.FC<TaskFormDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  loading = false,
  projectId,
  projectMembers = [],
  initialData,
  mode = "create",
  parentTask,
}) => {
  const [formData, setFormData] = useState<CreateTaskRequest>({
    project_id: projectId,
    title: "",
    description: "",
    priority: "medium",
    due_date: TODAY_INPUT,
    assignee_id: undefined,
    estimate_seconds: undefined,
    status: "not_started",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens/closes or mode changes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        setFormData({
          project_id: projectId,
          title: initialData.title,
          description: initialData.description || "",
          priority: initialData.priority,
          due_date: initialData.due_date || TODAY_INPUT,
          assignee_id: initialData.assignee_id,
          estimate_seconds: initialData.estimate_seconds,
          status: initialData.status,
        });
      } else {
        setFormData({
          project_id: projectId,
          title: "",
          description: "",
          priority: "medium",
          due_date: TODAY_INPUT,
          assignee_id: undefined,
          estimate_seconds: undefined,
          status: "not_started",
        });
      }
      setErrors({});
    }
  }, [open, mode, initialData, projectId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (formData.due_date && formData.start_date && new Date(formData.due_date) < new Date(formData.start_date)) {
      newErrors.due_date = "Due date cannot be before start date";
    }

    if (formData.estimate_seconds && formData.estimate_seconds < 0) {
      newErrors.estimate_seconds = "Estimate cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Clean up form data - convert empty strings to undefined for optional fields
    const cleanedFormData: Omit<CreateTaskRequest, "project_id"> = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      priority: formData.priority,
      due_date: formData.due_date || undefined,
      assignee_id: formData.assignee_id || undefined,
      estimate_seconds: formData.estimate_seconds,
      status: formData.status,
    };

    try {
      await onSubmit(cleanedFormData);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const formatEstimateDisplay = (seconds?: number) => {
    if (!seconds) return "";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const parseEstimateInput = (input: string): number | undefined => {
    if (!input.trim()) return undefined;

    // Parse formats like "2h 30m", "2h", "30m", "120" (minutes)
    const hourMatch = input.match(/(\d+)h/);
    const minuteMatch = input.match(/(\d+)m/);
    const plainNumberMatch = input.match(/^(\d+)$/);

    let hours = 0;
    let minutes = 0;

    if (hourMatch) {
      hours = parseInt(hourMatch[1]);
    }
    if (minuteMatch) {
      minutes = parseInt(minuteMatch[1]);
    } else if (plainNumberMatch && !hourMatch) {
      // If just a number and no hours specified, treat as minutes
      minutes = parseInt(plainNumberMatch[1]);
    }

    const totalSeconds = (hours * 3600) + (minutes * 60);
    return totalSeconds > 0 ? totalSeconds : undefined;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white shadow-2xl sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Plus className="h-5 w-5 text-purple-400" />
            {mode === "edit" ? "Edit Task" : parentTask ? "Create Subtask" : "Create New Task"}
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-sm">
            {mode === "edit"
              ? "Update the task details below."
              : parentTask
                ? `Add a subtask to "${parentTask.title}".`
                : "Add a new task to your project."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-300">
              Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title"
              required
              className={cn(
                "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800 focus:border-purple-500/50 transition-all duration-200",
                errors.title && "border-red-500/50 focus:border-red-500/50"
              )}
            />
            {errors.title && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-300">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter task description (optional)"
              rows={3}
              className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800 focus:border-purple-500/50 transition-all duration-200"
            />
          </div>

          {/* Priority and Status Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-300">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: TaskPriority) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-purple-500/50 transition-all duration-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 shadow-xl">
                  {taskPriorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-gray-300 hover:bg-gray-700 focus:bg-gray-700">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-300">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: TaskStatus) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-purple-500/50 transition-all duration-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 shadow-xl">
                  <SelectItem value="not_started" className="text-gray-300 hover:bg-gray-700">To Do</SelectItem>
                  <SelectItem value="in_progress" className="text-gray-300 hover:bg-gray-700">In Progress</SelectItem>
                  <SelectItem value="blocked" className="text-gray-300 hover:bg-gray-700">Blocked</SelectItem>
                  <SelectItem value="completed" className="text-gray-300 hover:bg-gray-700">Completed</SelectItem>
                  <SelectItem value="cancelled" className="text-gray-300 hover:bg-gray-700">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-300">Assignee</Label>
            <Select
              value={formData.assignee_id || "unassigned"}
              onValueChange={(value) => setFormData(prev => ({
                ...prev,
                assignee_id: value === "unassigned" ? undefined : value
              }))}
            >
              <SelectTrigger className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-purple-500/50 transition-all duration-200">
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 shadow-xl">
                <SelectItem value="unassigned" className="text-gray-300 hover:bg-gray-700 focus:bg-gray-700">
                  Unassigned
                </SelectItem>
                {projectMembers.map((assignee) => (
                  <SelectItem key={assignee.id} value={assignee.id} className="text-gray-300 hover:bg-gray-700 focus:bg-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {assignee.first_name?.charAt(0)}{assignee.last_name?.charAt(0)}
                        </span>
                      </div>
                      {assignee.first_name} {assignee.last_name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due Date and Estimate Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due_date" className="text-sm font-medium text-gray-300">
                Due Date
              </Label>
              <div className="relative">
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  min={TODAY_INPUT}
                  className={cn(
                    "bg-gray-800/50 border-gray-700 text-white focus:bg-gray-800 focus:border-purple-500/50 transition-all duration-200",
                    errors.due_date && "border-red-500/50 focus:border-red-500/50"
                  )}
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.due_date && (
                <p className="text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.due_date}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimate" className="text-sm font-medium text-gray-300">
                Estimate
              </Label>
              <div className="relative">
                <Input
                  id="estimate"
                  value={formatEstimateDisplay(formData.estimate_seconds)}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    estimate_seconds: parseEstimateInput(e.target.value)
                  }))}
                  placeholder="2h 30m or 150m"
                  className={cn(
                    "bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800 focus:border-purple-500/50 transition-all duration-200",
                    errors.estimate_seconds && "border-red-500/50 focus:border-red-500/50"
                  )}
                />
                <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.estimate_seconds && (
                <p className="text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.estimate_seconds}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-600/50 text-gray-300 hover:bg-gray-700 hover:border-gray-500 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {loading ? "Saving..." : mode === "edit" ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
