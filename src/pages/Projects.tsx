import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { MainLayout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import {
  ProjectsTable,
  ProjectFilters,
  NewProjectDialog,
  Project,
} from '@/components/Projects';
import { toast } from 'sonner';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Load projects from localStorage on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem('focus-tracker-projects');
    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects));
      } catch (error) {
        console.error('Error loading projects:', error);
      }
    } else {
      // Initialize with sample project
      const sampleProjects: Project[] = [
        {
          id: '1',
          name: 'Testing',
          timeframe: 'Oct 3',
          timeStatus: 0,
          pinned: false,
          archived: false,
          color: '#8b5cf6',
        },
      ];
      setProjects(sampleProjects);
      localStorage.setItem('focus-tracker-projects', JSON.stringify(sampleProjects));
    }
  }, []);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('focus-tracker-projects', JSON.stringify(projects));
    }
  }, [projects]);

  const handleCreateProject = (projectData: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
    };

    setProjects([...projects, newProject]);
    toast.success(`Project "${newProject.name}" created successfully!`);
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleProjectPin = (projectId: string) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? { ...project, pinned: !project.pinned }
          : project
      )
    );
    
    const project = projects.find(p => p.id === projectId);
    if (project) {
      toast.success(
        project.pinned
          ? `"${project.name}" unpinned`
          : `"${project.name}" pinned to top`
      );
    }
  };

  const filteredProjects = projects.filter((project) =>
    showArchived ? true : !project.archived
  );

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-950 text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold">Projects</h1>
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            New project
          </Button>
        </div>

        {/* Filters */}
        <ProjectFilters
          showArchived={showArchived}
          onShowArchivedChange={setShowArchived}
        />

        {/* Projects Table */}
        <div className="p-6">
          <ProjectsTable
            projects={filteredProjects}
            selectedProjects={selectedProjects}
            onProjectSelect={handleProjectSelect}
            onProjectPin={handleProjectPin}
          />
        </div>

        {/* New Project Dialog */}
        <NewProjectDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onCreateProject={handleCreateProject}
        />
      </div>
    </MainLayout>
  );
};

export default Projects;

