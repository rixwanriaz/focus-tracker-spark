import React, { useState } from "react";
import { ArrowUpDown, Pin, Archive } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Project as ApiProject } from "@/redux/api";

// Display Project interface for UI components
export interface Project {
  id: string;
  name: string;
  timeframe?: string;
  pinned: boolean;
  archived: boolean;
  color?: string;
}

// Type adapter to convert API Project to Display Project
export const adaptApiProjectToDisplay = (apiProject: ApiProject): Project => ({
  id: apiProject.id,
  name: apiProject.name,
  timeframe: apiProject.end_date ? new Date(apiProject.end_date).toLocaleDateString() : undefined,
  pinned: false, // This would need to be added to the API
  archived: false, // This would need to be added to the API
  color: '#8b5cf6', // This would need to be added to the API
});

interface ProjectsTableProps {
  projects: Project[];
  onProjectSelect?: (projectId: string) => void;
  onProjectPin?: (projectId: string) => void;
  onArchiveProject?: (projectId: string) => void;
  selectedProjects?: string[];
}

type SortField = "name" | "timeframe" | "pinned";
type SortDirection = "asc" | "desc";

export const ProjectsTable: React.FC<ProjectsTableProps> = ({
  projects,
  onProjectSelect,
  onProjectPin,
  onArchiveProject,
  selectedProjects = [],
}) => {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const navigate = useNavigate();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedProjects = [...projects].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "timeframe":
        comparison = (a.timeframe || "").localeCompare(b.timeframe || "");
        break;
      case "pinned":
        comparison = Number(b.pinned) - Number(a.pinned);
        break;
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-6 gap-4 px-4 py-3 bg-gray-950 border-b border-gray-800 text-xs font-semibold text-gray-400 uppercase">
        <div className="col-span-1 flex items-center">
          <Checkbox className="border-gray-600" />
        </div>

        <div className="col-span-2 flex items-center gap-2">
          <button
            onClick={() => handleSort("name")}
            className="flex items-center gap-1 hover:text-gray-300 transition-colors"
          >
            PROJECT
            <ArrowUpDown className="h-3 w-3" />
          </button>
        </div>

        <div className="col-span-1 flex items-center gap-2">
          <button
            onClick={() => handleSort("timeframe")}
            className="flex items-center gap-1 hover:text-gray-300 transition-colors"
          >
            TIMEFRAME
            <ArrowUpDown className="h-3 w-3" />
          </button>
        </div>

        <div className="col-span-1 flex items-center gap-2">
          <button
            onClick={() => handleSort("pinned")}
            className="flex items-center gap-1 hover:text-gray-300 transition-colors"
          >
            PINNED
            <ArrowUpDown className="h-3 w-3" />
          </button>
        </div>

        <div className="col-span-1 flex items-center">ACTIONS</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-800">
        {sortedProjects.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-500">
            <p>No projects found</p>
            <p className="text-sm mt-1">
              Create your first project to get started
            </p>
          </div>
        ) : (
          sortedProjects.map((project) => (
            <div
              key={project.id}
              className="grid grid-cols-6 gap-4 px-4 py-4 hover:bg-gray-800/50 transition-colors"
            >
              <div className="col-span-1 flex items-center">
                <Checkbox
                  checked={selectedProjects.includes(project.id)}
                  onCheckedChange={() => onProjectSelect?.(project.id)}
                  className="border-gray-600"
                />
              </div>

              <div className="col-span-2 flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: project.color || "#8b5cf6" }}
                />
                <span 
                  className="text-sm text-purple-400 font-medium hover:text-purple-300 cursor-pointer"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  {project.name}
                </span>
              </div>

              <div className="col-span-1 flex items-center text-sm text-gray-400">
                {project.timeframe || "-"}
              </div>

              <div className="col-span-1 flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8",
                    project.pinned
                      ? "text-purple-400"
                      : "text-gray-600 hover:text-gray-400"
                  )}
                  onClick={() => onProjectPin?.(project.id)}
                >
                  <Pin
                    className={cn("h-4 w-4", project.pinned && "fill-current")}
                  />
                </Button>
              </div>

              <div className="col-span-1 flex items-center gap-1">
                {!project.archived && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-600 hover:text-orange-400"
                    onClick={() => onArchiveProject?.(project.id)}
                    title="Archive project"
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
