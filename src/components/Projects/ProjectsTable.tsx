import React, { useState } from "react";
import { ArrowUpDown, Pin } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Project {
  id: string;
  name: string;
  client?: string;
  timeframe?: string;
  timeStatus: number; // in hours
  billableStatus?: "billable" | "non-billable";
  team?: string[];
  pinned: boolean;
  archived: boolean;
  color?: string;
}

interface ProjectsTableProps {
  projects: Project[];
  onProjectSelect?: (projectId: string) => void;
  onProjectPin?: (projectId: string) => void;
  selectedProjects?: string[];
}

type SortField = "name" | "client" | "timeframe" | "pinned";
type SortDirection = "asc" | "desc";

export const ProjectsTable: React.FC<ProjectsTableProps> = ({
  projects,
  onProjectSelect,
  onProjectPin,
  selectedProjects = [],
}) => {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

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
      case "client":
        comparison = (a.client || "").localeCompare(b.client || "");
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

  const formatTimeStatus = (hours: number): string => {
    if (hours === 0) return "0 h";
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    return `${hours} h`;
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-950 border-b border-gray-800 text-xs font-semibold text-gray-400 uppercase">
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

        <div className="col-span-2 flex items-center gap-2">
          <button
            onClick={() => handleSort("client")}
            className="flex items-center gap-1 hover:text-gray-300 transition-colors"
          >
            CLIENT
            <ArrowUpDown className="h-3 w-3" />
          </button>
        </div>

        <div className="col-span-2 flex items-center gap-2">
          <button
            onClick={() => handleSort("timeframe")}
            className="flex items-center gap-1 hover:text-gray-300 transition-colors"
          >
            TIMEFRAME
            <ArrowUpDown className="h-3 w-3" />
          </button>
        </div>

        <div className="col-span-1 flex items-center">TIME STATUS</div>
        <div className="col-span-2 flex items-center">BILLABLE STATUS</div>
        <div className="col-span-1 flex items-center">TEAM</div>

        <div className="col-span-1 flex items-center gap-2">
          <button
            onClick={() => handleSort("pinned")}
            className="flex items-center gap-1 hover:text-gray-300 transition-colors"
          >
            PINNED
            <ArrowUpDown className="h-3 w-3" />
          </button>
        </div>
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
              className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-gray-800/50 transition-colors"
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
                <span className="text-sm text-purple-400 font-medium hover:text-purple-300 cursor-pointer">
                  {project.name}
                </span>
              </div>

              <div className="col-span-2 flex items-center text-sm text-gray-400">
                {project.client || "-"}
              </div>

              <div className="col-span-2 flex items-center text-sm text-gray-400">
                {project.timeframe || "-"}
              </div>

              <div className="col-span-1 flex items-center text-sm text-white">
                {formatTimeStatus(project.timeStatus)}
              </div>

              <div className="col-span-2 flex items-center text-sm text-gray-400">
                {project.billableStatus ? (
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs",
                      project.billableStatus === "billable"
                        ? "bg-green-900/30 text-green-400"
                        : "bg-gray-800 text-gray-400"
                    )}
                  >
                    {project.billableStatus}
                  </span>
                ) : (
                  "-"
                )}
              </div>

              <div className="col-span-1 flex items-center text-sm text-gray-400">
                {project.team && project.team.length > 0 ? (
                  <div className="flex -space-x-2">
                    {project.team.slice(0, 3).map((member, idx) => (
                      <div
                        key={idx}
                        className="w-6 h-6 rounded-full bg-purple-600 border-2 border-gray-900 flex items-center justify-center text-xs text-white font-medium"
                      >
                        {member.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {project.team.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center text-xs text-gray-300">
                        +{project.team.length - 3}
                      </div>
                    )}
                  </div>
                ) : (
                  "-"
                )}
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
            </div>
          ))
        )}
      </div>
    </div>
  );
};
