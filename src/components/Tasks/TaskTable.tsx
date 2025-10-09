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
  ArrowUpDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Task, TaskStatus, TaskPriority } from "@/redux/api/project";
import { format, parseISO } from "date-fns";

// Task status configuration
const taskStatusConfig = {
  not_started: { label: "To Do", icon: Circle, color: "text-gray-400", bgColor: "bg-gray-100 text-gray-800" },
  in_progress: { label: "In Progress", icon: Clock, color: "text-blue-400", bgColor: "bg-blue-100 text-blue-800" },
  completed: { label: "Completed", icon: CheckCircle2, color: "text-green-400", bgColor: "bg-green-100 text-green-800" },
};

// Task priority configuration
const taskPriorityConfig = {
  low: { label: "Low", color: "bg-gray-100 text-gray-800" },
  medium: { label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  high: { label: "High", color: "bg-orange-100 text-orange-800" },
  urgent: { label: "Urgent", color: "bg-red-100 text-red-800" },
};

export interface TaskTableProps {
  tasks: Task[];
  onUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onDelete?: (taskId: string) => void;
  loading?: boolean;
}

export const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  onUpdate,
  onStatusChange,
  onDelete,
  loading = false,
}) => {
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Task>>({});

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No due date";
    try {
      return format(parseISO(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const formatEstimate = (seconds?: number) => {
    if (!seconds) return "No estimate";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const isOverdue = (dueDate?: string, status?: TaskStatus) => {
    if (!dueDate || status === "completed") return false;
    return new Date(dueDate) < new Date();
  };

  const handleEditStart = (task: Task) => {
    setEditingTask(task.id);
    setEditData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      due_date: task.due_date,
    });
  };

  const handleEditSave = (taskId: string) => {
    if (editData.title?.trim()) {
      onUpdate?.(taskId, editData);
      setEditingTask(null);
      setEditData({});
    }
  };

  const handleEditCancel = () => {
    setEditingTask(null);
    setEditData({});
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Circle className="h-12 w-12 mx-auto mb-4 text-gray-500" />
        <p>No tasks found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-gray-700 bg-gray-800">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-700 hover:bg-gray-700">
            <TableHead className="text-gray-300 font-medium w-1/3">Task</TableHead>
            <TableHead className="text-gray-300 font-medium w-32">Status</TableHead>
            <TableHead className="text-gray-300 font-medium w-24">Priority</TableHead>
            <TableHead className="text-gray-300 font-medium w-32">Assignee</TableHead>
            <TableHead className="text-gray-300 font-medium w-28">Due Date</TableHead>
            <TableHead className="text-gray-300 font-medium w-24">Estimate</TableHead>
            <TableHead className="text-gray-300 font-medium text-right w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => {
            const StatusIcon = taskStatusConfig[task.status].icon;
            const PriorityBadge = taskPriorityConfig[task.priority];
            const overdue = isOverdue(task.due_date, task.status);
            const isEditing = editingTask === task.id;

            return (
              <TableRow key={task.id} className="border-gray-700 hover:bg-gray-700">
                {/* Task Title & Description */}
                <TableCell className="font-medium">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editData.title || ""}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                        placeholder="Task title"
                      />
                      <textarea
                        value={editData.description || ""}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                        placeholder="Task description"
                        rows={2}
                      />
                    </div>
                  ) : (
                    <div>
                      <div className={cn(
                        "text-white font-medium",
                        task.status === "completed" && "line-through text-gray-500"
                      )}>
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-sm text-gray-400 mt-1">
                          {task.description}
                        </div>
                      )}
                    </div>
                  )}
                </TableCell>

                {/* Status */}
                <TableCell>
                  {isEditing ? (
                    <Select
                      value={editData.priority || task.priority}
                      onValueChange={(value: TaskPriority) => setEditData({ ...editData, priority: value })}
                    >
                      <SelectTrigger className="w-28 h-8 bg-gray-600 border-gray-500 text-gray-300">
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
                      onValueChange={(value: TaskStatus) => onStatusChange?.(task.id, value)}
                    >
                      <SelectTrigger className="w-40 h-8 bg-gray-600 border-gray-500 text-gray-300">
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
                    <input
                      type="date"
                      value={editData.due_date || ""}
                      onChange={(e) => setEditData({ ...editData, due_date: e.target.value })}
                      className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                    />
                  ) : (
                    <Badge className={cn("text-xs", PriorityBadge.color)}>
                      {PriorityBadge.label}
                    </Badge>
                  )}
                </TableCell>

                {/* Assignee */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    {task.assignee ? (
                      <>
                        <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                          <span className="text-xs font-medium text-white">
                            {task.assignee.first_name?.charAt(0)}{task.assignee.last_name?.charAt(0)}
                          </span>
                        </div>
                        <span className="text-gray-300 text-sm">
                          {task.assignee.first_name} {task.assignee.last_name}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-500 text-sm">Unassigned</span>
                    )}
                  </div>
                </TableCell>

                {/* Due Date */}
                <TableCell>
                  <div className={cn(
                    "flex items-center gap-1 text-sm",
                    overdue ? "text-red-400" : "text-gray-300"
                  )}>
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(task.due_date)}</span>
                    {overdue && <AlertCircle className="h-3 w-3 text-red-400" />}
                  </div>
                </TableCell>

                {/* Estimate */}
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-gray-300">
                    <Clock className="h-3 w-3" />
                    <span>{formatEstimate(task.estimate_seconds)}</span>
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
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
                          onClick={() => handleEditStart(task)}
                          className="text-gray-300 hover:bg-gray-600"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete?.(task.id)}
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
