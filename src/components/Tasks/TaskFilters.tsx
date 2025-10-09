import React from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TaskFilters, TaskStatus, TaskPriority } from "@/redux/api/project";

interface TaskFiltersProps {
  filters: TaskFilters;
  onFiltersChange: (filters: Partial<TaskFilters>) => void;
  onClearFilters: () => void;
  assignees?: Array<{ id: string; first_name: string; last_name: string }>;
  className?: string;
}

const taskStatusOptions = [
  { value: "not_started", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

const taskPriorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export const TaskFiltersComponent: React.FC<TaskFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  assignees = [],
  className,
}) => {
  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== "" && value !== "all");

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-300">Filters</span>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-6 px-2 text-xs text-gray-400 hover:text-gray-300 hover:bg-gray-700"
          >
            <X className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="text-xs font-medium text-gray-400 mb-1 block">Status</label>
          <Select
            value={filters.status || "all"}
            onValueChange={(value) => onFiltersChange({ status: value === "all" ? undefined : value as TaskStatus })}
          >
            <SelectTrigger className="h-8 bg-gray-700 border-gray-600 text-gray-300">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              <SelectItem value="all" className="text-gray-300 hover:bg-gray-600">All statuses</SelectItem>
              {taskStatusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-gray-300 hover:bg-gray-600">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="text-xs font-medium text-gray-400 mb-1 block">Priority</label>
          <Select
            value={filters.priority || "all"}
            onValueChange={(value) => onFiltersChange({ priority: value === "all" ? undefined : value as TaskPriority })}
          >
            <SelectTrigger className="h-8 bg-gray-700 border-gray-600 text-gray-300">
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              <SelectItem value="all" className="text-gray-300 hover:bg-gray-600">All priorities</SelectItem>
              {taskPriorityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-gray-300 hover:bg-gray-600">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Assignee Filter */}
        {assignees.length > 0 && (
          <div>
            <label className="text-xs font-medium text-gray-400 mb-1 block">Assignee</label>
            <Select
              value={filters.assignee_id || "all"}
              onValueChange={(value) => onFiltersChange({ assignee_id: value === "all" ? undefined : value })}
            >
              <SelectTrigger className="h-8 bg-gray-700 border-gray-600 text-gray-300">
                <SelectValue placeholder="All assignees" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="all" className="text-gray-300 hover:bg-gray-600">All assignees</SelectItem>
                <SelectItem value="unassigned" className="text-gray-300 hover:bg-gray-600">Unassigned</SelectItem>
                {assignees.map((assignee) => (
                  <SelectItem key={assignee.id} value={assignee.id} className="text-gray-300 hover:bg-gray-600">
                    {assignee.first_name} {assignee.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Due Date Filter */}
        <div>
          <label className="text-xs font-medium text-gray-400 mb-1 block">Due Date</label>
          <div className="flex gap-1">
            <Input
              type="date"
              value={filters.due_from || ""}
              onChange={(e) => onFiltersChange({ due_from: e.target.value || undefined })}
              placeholder="From"
              className="h-8 text-xs bg-gray-700 border-gray-600 text-white"
            />
            <Input
              type="date"
              value={filters.due_to || ""}
              onChange={(e) => onFiltersChange({ due_to: e.target.value || undefined })}
              placeholder="To"
              className="h-8 text-xs bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.status && (
            <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300 border-gray-600">
              Status: {taskStatusOptions.find(opt => opt.value === filters.status)?.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent text-gray-400 hover:text-gray-300"
                onClick={() => onFiltersChange({ status: undefined })}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          {filters.priority && (
            <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300 border-gray-600">
              Priority: {taskPriorityOptions.find(opt => opt.value === filters.priority)?.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent text-gray-400 hover:text-gray-300"
                onClick={() => onFiltersChange({ priority: undefined })}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          {filters.assignee_id && (
            <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300 border-gray-600">
              Assignee: {filters.assignee_id === "unassigned" ? "Unassigned" : assignees.find(a => a.id === filters.assignee_id)?.first_name}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent text-gray-400 hover:text-gray-300"
                onClick={() => onFiltersChange({ assignee_id: undefined })}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          {(filters.due_from || filters.due_to) && (
            <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300 border-gray-600">
              Due: {filters.due_from || "..."} to {filters.due_to || "..."}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent text-gray-400 hover:text-gray-300"
                onClick={() => onFiltersChange({ due_from: undefined, due_to: undefined })}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
