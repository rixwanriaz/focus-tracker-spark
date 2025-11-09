// src/features/tasks/components/TasksFiltersBar.tsx
import React from "react";
import { Filter, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ProjectTaskFilters, Task } from "@/types/task";

interface ProjectMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface TasksFiltersBarProps {
  filters: ProjectTaskFilters;
  onFiltersChange: (filters: Partial<ProjectTaskFilters>) => void;
  onClearFilters: () => void;
  projectMembers?: ProjectMember[];
  className?: string;
}

const taskStatusOptions = [
  { value: "not_started", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "blocked", label: "Blocked" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const taskPriorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export const TasksFiltersBar: React.FC<TasksFiltersBarProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  projectMembers = [],
  className,
}) => {
  const hasActiveFilters = Object.values(filters).some(value =>
    value !== undefined && value !== null && value !== "" &&
    !(typeof value === 'number' && (value === 50 || value === 0)) // Exclude default limit/offset
  );

  const activeFilterCount = Object.entries(filters).filter(([key, value]) =>
    value !== undefined && value !== null && value !== "" &&
    !(key === 'limit' && value === 50) &&
    !(key === 'offset' && value === 0)
  ).length;

  return (
    <Card className={cn("bg-gray-800/50 border-gray-700", className)}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-300">Filters</span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="text-xs bg-purple-600/20 text-purple-300 border-purple-600/30">
                  {activeFilterCount}
                </Badge>
              )}
            </div>
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

          {/* Search */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                value={filters.search || ""}
                onChange={(e) => onFiltersChange({ search: e.target.value || undefined })}
                className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:bg-gray-700 focus:border-purple-500/50"
              />
            </div>
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Status Filter */}
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1 block">Status</label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) => onFiltersChange({ status: value === "all" ? undefined : value as Task["status"] })}
              >
                <SelectTrigger className="h-8 bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-purple-500/50">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all" className="text-gray-300 hover:bg-gray-700">All statuses</SelectItem>
                  {taskStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-gray-300 hover:bg-gray-700">
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
                onValueChange={(value) => onFiltersChange({ priority: value === "all" ? undefined : value as Task["priority"] })}
              >
                <SelectTrigger className="h-8 bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-purple-500/50">
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all" className="text-gray-300 hover:bg-gray-700">All priorities</SelectItem>
                  {taskPriorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-gray-300 hover:bg-gray-700">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assignee Filter */}
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1 block">Assignee</label>
              <Select
                value={filters.assignee_id || "all"}
                onValueChange={(value) => onFiltersChange({
                  assignee_id: value === "all" ? undefined : value === "unassigned" ? "" : value
                })}
              >
                <SelectTrigger className="h-8 bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-purple-500/50">
                  <SelectValue placeholder="All assignees" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all" className="text-gray-300 hover:bg-gray-700">All assignees</SelectItem>
                  <SelectItem value="unassigned" className="text-gray-300 hover:bg-gray-700">Unassigned</SelectItem>
                  {projectMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id} className="text-gray-300 hover:bg-gray-700">
                      {member.first_name} {member.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Due Date From */}
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1 block">Due From</label>
              <Input
                type="date"
                value={filters.due_from || ""}
                onChange={(e) => onFiltersChange({ due_from: e.target.value || undefined })}
                className="h-8 bg-gray-700/50 border-gray-600 text-white focus:bg-gray-700 focus:border-purple-500/50"
              />
            </div>

            {/* Due Date To */}
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1 block">Due To</label>
              <Input
                type="date"
                value={filters.due_to || ""}
                onChange={(e) => onFiltersChange({ due_to: e.target.value || undefined })}
                className="h-8 bg-gray-700/50 border-gray-600 text-white focus:bg-gray-700 focus:border-purple-500/50"
              />
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-700">
              {filters.search && (
                <Badge variant="secondary" className="text-xs bg-blue-600/20 text-blue-300 border-blue-600/30">
                  Search: "{filters.search}"
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1 hover:bg-transparent text-blue-400 hover:text-blue-300"
                    onClick={() => onFiltersChange({ search: undefined })}
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              )}
              {filters.status && (
                <Badge variant="secondary" className="text-xs bg-gray-600/20 text-gray-300 border-gray-600/30">
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
                <Badge variant="secondary" className="text-xs bg-orange-600/20 text-orange-300 border-orange-600/30">
                  Priority: {taskPriorityOptions.find(opt => opt.value === filters.priority)?.label}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1 hover:bg-transparent text-orange-400 hover:text-orange-300"
                    onClick={() => onFiltersChange({ priority: undefined })}
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              )}
              {filters.assignee_id && (
                <Badge variant="secondary" className="text-xs bg-green-600/20 text-green-300 border-green-600/30">
                  Assignee: {
                    filters.assignee_id === ""
                      ? "Unassigned"
                      : projectMembers.find(m => m.id === filters.assignee_id)?.first_name || "Unknown"
                  }
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1 hover:bg-transparent text-green-400 hover:text-green-300"
                    onClick={() => onFiltersChange({ assignee_id: undefined })}
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              )}
              {(filters.due_from || filters.due_to) && (
                <Badge variant="secondary" className="text-xs bg-red-600/20 text-red-300 border-red-600/30">
                  Due: {filters.due_from || "..."} to {filters.due_to || "..."}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1 hover:bg-transparent text-red-400 hover:text-red-300"
                    onClick={() => onFiltersChange({ due_from: undefined, due_to: undefined })}
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
