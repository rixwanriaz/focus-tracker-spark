// src/features/tasks/components/TasksTable.tsx
import React, { useState } from "react";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Calendar,
  User,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
  Play,
  Square,
  ArrowUpDown,
  Plus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { Task } from "@/types/task";

interface ProjectMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface TasksTableProps {
  tasks: Task[];
  loading?: boolean;
  projectMembers?: ProjectMember[];
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
  onStatusChange?: (taskId: string, status: Task["status"]) => void;
  onAssigneeChange?: (taskId: string, assigneeId: string | null) => void;
  onPriorityChange?: (taskId: string, priority: Task["priority"]) => void;
  onDeleteTask?: (task: Task) => void;
  onCompleteTask?: (taskId: string) => void;
  onReopenTask?: (taskId: string) => void;
  onEditTask?: (task: Task) => void;
  onCreateSubtask?: (parentTask: Task) => void;
  onViewSubtasks?: (taskId: string) => void;
  onOpenDetail?: (task: Task) => void;
}

// Task status configuration
const taskStatusConfig = {
  not_started: { label: "To Do", icon: Circle, color: "text-gray-400", bgColor: "bg-gray-100 text-gray-800" },
  in_progress: { label: "In Progress", icon: Play, color: "text-blue-400", bgColor: "bg-blue-100 text-blue-800" },
  blocked: { label: "Blocked", icon: AlertCircle, color: "text-red-400", bgColor: "bg-red-100 text-red-800" },
  completed: { label: "Completed", icon: CheckCircle2, color: "text-green-400", bgColor: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelled", icon: Square, color: "text-gray-500", bgColor: "bg-gray-200 text-gray-700" },
};

// Task priority configuration
const taskPriorityConfig = {
  low: { label: "Low", color: "bg-gray-100 text-gray-800" },
  medium: { label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  high: { label: "High", color: "bg-orange-100 text-orange-800" },
};

export const TasksTable: React.FC<TasksTableProps> = ({
  tasks,
  loading = false,
  projectMembers = [],
  onUpdateTask,
  onStatusChange,
  onAssigneeChange,
  onPriorityChange,
  onDeleteTask,
  onCompleteTask,
  onReopenTask,
  onEditTask,
  onCreateSubtask,
  onViewSubtasks,
  onOpenDetail,
}) => {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Task>>({});

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    try {
      return format(parseISO(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const formatEstimate = (seconds?: number) => {
    if (!seconds) return "—";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatLoggedTime = (seconds: number) => {
    if (!seconds) return "—";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const isOverdue = (dueDate?: string, status?: Task["status"]) => {
    if (!dueDate || status === "completed" || status === "cancelled") return false;
    return new Date(dueDate) < new Date();
  };

  const handleEditStart = (task: Task) => {
    setEditingTaskId(task.id);
    setEditData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      estimate_seconds: task.estimate_seconds,
      due_date: task.due_date,
    });
  };

  const handleEditSave = (taskId: string) => {
    if (editData.title?.trim()) {
      const cleanedEditData = {
        title: editData.title.trim(),
        description: editData.description?.trim() || undefined,
        priority: editData.priority,
        estimate_seconds: editData.estimate_seconds,
        due_date: editData.due_date || undefined,
      };

      onUpdateTask?.(taskId, cleanedEditData);
      setEditingTaskId(null);
      setEditData({});
    }
  };

  const handleEditCancel = () => {
    setEditingTaskId(null);
    setEditData({});
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="rounded-md border border-gray-700 bg-gray-800">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700">
              <TableHead className="text-gray-300">Task</TableHead>
              <TableHead className="text-gray-300">Status</TableHead>
              <TableHead className="text-gray-300">Priority</TableHead>
              <TableHead className="text-gray-300">Assignee</TableHead>
              <TableHead className="text-gray-300">Estimate</TableHead>
              <TableHead className="text-gray-300">Logged</TableHead>
              <TableHead className="text-gray-300">Due Date</TableHead>
              <TableHead className="text-gray-300">Updated</TableHead>
              <TableHead className="text-gray-300 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i} className="border-gray-700">
                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Empty state
  if (tasks.length === 0) {
    return (
      <div className="rounded-md border border-gray-700 bg-gray-800 p-12">
        <div className="text-center text-gray-400">
          <Circle className="h-12 w-12 mx-auto mb-4 text-gray-500" />
          <p className="text-lg font-medium mb-2">No tasks found</p>
          <p className="text-sm">Try adjusting your filters or create a new task.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-gray-700 bg-gray-800">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-700 hover:bg-gray-700">
            <TableHead className="text-gray-300 font-medium">Task</TableHead>
            <TableHead className="text-gray-300 font-medium">Status</TableHead>
            <TableHead className="text-gray-300 font-medium">Priority</TableHead>
            <TableHead className="text-gray-300 font-medium">Assignee</TableHead>
            <TableHead className="text-gray-300 font-medium">Estimate</TableHead>
            <TableHead className="text-gray-300 font-medium">Logged</TableHead>
            <TableHead className="text-gray-300 font-medium">Due Date</TableHead>
            <TableHead className="text-gray-300 font-medium">Updated</TableHead>
            <TableHead className="text-gray-300 font-medium text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => {
            const StatusIcon = taskStatusConfig[task.status].icon;
            const overdue = isOverdue(task.due_date, task.status);
            const isEditing = editingTaskId === task.id;

            return (
              <TableRow key={task.id} className="border-gray-700 hover:bg-gray-700/50">
                {/* Task Title & Description */}
                <TableCell className="font-medium max-w-xs">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        value={editData.title || ""}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm h-8"
                        placeholder="Task title"
                      />
                      <Textarea
                        value={editData.description || ""}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                        placeholder="Task description"
                        rows={2}
                      />
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      {task.parent_task_id && (
                        <div className="flex items-center mt-0.5 mr-2">
                          <div className="w-4 h-px bg-gray-600"></div>
                          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        </div>
                      )}
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => onOpenDetail?.(task)}
                        role="button"
                        aria-label="Open task details"
                      >
                        <div
                          className={cn(
                            "text-left text-white font-medium text-sm hover:underline",
                            task.status === "completed" && "line-through text-gray-500",
                            task.status === "cancelled" && "line-through text-gray-500"
                          )}
                        >
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                            {task.description}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </TableCell>

                {/* Status */}
                <TableCell>
                  {isEditing ? (
                    <Select
                      value={editData.priority || task.priority}
                      onValueChange={(value: Task["priority"]) => setEditData({ ...editData, priority: value })}
                    >
                      <SelectTrigger className="w-32 h-8 bg-gray-600 border-gray-500 text-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        {Object.entries(taskPriorityConfig).map(([value, config]) => (
                          <SelectItem key={value} value={value} className="text-gray-300 hover:bg-gray-600">
                            <span className="text-sm">{config.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Select
                      value={task.status}
                      onValueChange={(value: Task["status"]) => onStatusChange?.(task.id, value)}
                    >
                      <SelectTrigger className="w-32 h-8 bg-gray-600 border-gray-500 text-gray-300">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <StatusIcon className={cn("h-3 w-3 flex-shrink-0", taskStatusConfig[task.status].color)} />
                          <span className="text-xs">{taskStatusConfig[task.status].label}</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        {Object.entries(taskStatusConfig).map(([value, config]) => {
                          const IconComponent = config.icon;
                          return (
                            <SelectItem key={value} value={value} className="text-gray-300 hover:bg-gray-600">
                              <div className="flex items-center gap-2 whitespace-nowrap">
                                <IconComponent className={cn("h-3 w-3 flex-shrink-0", config.color)} />
                                <span className="text-sm">{config.label}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>

                {/* Priority */}
                <TableCell>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editData.estimate_seconds || ""}
                      onChange={(e) => setEditData({ ...editData, estimate_seconds: parseInt(e.target.value) || undefined })}
                      className="w-20 h-8 bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                      placeholder="hours"
                    />
                  ) : (
                    <Badge className={cn("text-xs", taskPriorityConfig[task.priority].color)}>
                      {taskPriorityConfig[task.priority].label}
                    </Badge>
                  )}
                </TableCell>

                {/* Assignee */}
                <TableCell>
                  <Select
                    value={task.assignee_id || "unassigned"}
                    onValueChange={(value) => onAssigneeChange?.(task.id, value === "unassigned" ? null : value)}
                  >
                    <SelectTrigger className="w-36 h-8 bg-gray-600 border-gray-500 text-gray-300">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        {task.assignee ? (
                          <>
                            <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-medium text-white">
                                {task.assignee.first_name?.charAt(0)}{task.assignee.last_name?.charAt(0)}
                              </span>
                            </div>
                            <span className="text-xs truncate">
                              {task.assignee.first_name} {task.assignee.last_name}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-gray-500">Unassigned</span>
                        )}
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="unassigned" className="text-gray-300 hover:bg-gray-600">
                        <span className="text-sm">Unassigned</span>
                      </SelectItem>
                      {projectMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id} className="text-gray-300 hover:bg-gray-600">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center">
                              <span className="text-xs font-medium text-white">
                                {member.first_name?.charAt(0)}{member.last_name?.charAt(0)}
                              </span>
                            </div>
                            <span className="text-sm">{member.first_name} {member.last_name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>

                {/* Estimate */}
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-gray-300">
                    <Clock className="h-3 w-3" />
                    <span>{formatEstimate(task.estimate_seconds)}</span>
                  </div>
                </TableCell>

                {/* Logged Time */}
                <TableCell>
                  <div className="text-sm text-gray-300">
                    {formatLoggedTime(task.logged_seconds)}
                  </div>
                </TableCell>

                {/* Due Date */}
                <TableCell>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editData.due_date || ""}
                      onChange={(e) => setEditData({ ...editData, due_date: e.target.value })}
                      className="w-32 h-8 bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                    />
                  ) : (
                    <div className={cn(
                      "flex items-center gap-1 text-sm",
                      overdue ? "text-red-400" : "text-gray-300"
                    )}>
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(task.due_date)}</span>
                      {overdue && <AlertCircle className="h-3 w-3 text-red-400" />}
                    </div>
                  )}
                </TableCell>

                {/* Updated */}
                <TableCell>
                  <div className="text-xs text-gray-400">
                    {formatDate(task.updated_at)}
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  {isEditing ? (
                    <div className="flex items-center gap-1 justify-end">
                      <Button
                        size="sm"
                        onClick={() => handleEditSave(task.id)}
                        className="bg-purple-600 hover:bg-purple-700 h-6 px-2 text-xs"
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleEditCancel}
                        className="border-gray-500 text-gray-300 hover:bg-gray-600 h-6 px-2 text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-600">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-gray-700 border-gray-600">
                        <DropdownMenuItem
                          onClick={() => onEditTask?.(task) || handleEditStart(task)}
                          className="text-gray-300 hover:bg-gray-600"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>

                        {onCreateSubtask && (
                          <DropdownMenuItem
                            onClick={() => onCreateSubtask(task)}
                            className="text-purple-400 hover:bg-gray-600 hover:text-purple-300"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Create Subtask
                          </DropdownMenuItem>
                        )}

                        {onViewSubtasks && (
                          <DropdownMenuItem
                            onClick={() => onViewSubtasks(task.id)}
                            className="text-blue-400 hover:bg-gray-600 hover:text-blue-300"
                          >
                            <ArrowUpDown className="mr-2 h-4 w-4" />
                            View Subtasks
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator className="bg-gray-600" />

                        {task.status !== "completed" && task.status !== "cancelled" && (
                          <DropdownMenuItem
                            onClick={() => onCompleteTask?.(task.id)}
                            className="text-green-400 hover:bg-gray-600 hover:text-green-300"
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Complete
                          </DropdownMenuItem>
                        )}

                        {(task.status === "completed" || task.status === "cancelled") && (
                          <DropdownMenuItem
                            onClick={() => onReopenTask?.(task.id)}
                            className="text-blue-400 hover:bg-gray-600 hover:text-blue-300"
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Reopen
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator className="bg-gray-600" />

                        <DropdownMenuItem
                          onClick={() => onDeleteTask?.(task)}
                          className="text-red-400 hover:bg-gray-600 hover:text-red-300"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
