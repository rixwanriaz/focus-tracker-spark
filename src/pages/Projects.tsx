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
import { projectApiService, Project as ApiProject, CreateProjectRequest } from '@/redux/api';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { toast } from 'sonner';
import PermissionGate from '@/components/ui/PermissionGate';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Get user info from Redux store
  const { user } = useSelector((state: RootState) => ({
    user: state.auth.user
  }));

  // Load projects from API
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const apiProjects = await projectApiService.getProjects(
          showArchived ? undefined : 'active',
          searchQuery || undefined
        );
        
        // Convert API projects to display format
        const displayProjects = apiProjects.map(project => ({
          id: project.id,
          name: project.name,
          timeframe: project.end_date ? new Date(project.end_date).toLocaleDateString() : undefined,
          pinned: false, // TODO: Add to API response
          archived: !project.is_active,
          color: '#8b5cf6', // TODO: Add to API response
        }));
        
        setProjects(displayProjects);
      } catch (err) {
        console.error('Error loading projects:', err);
        setError('Failed to load projects');
        toast.error('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [showArchived, searchQuery]);

  const handleCreateProject = async (projectData: CreateProjectRequest) => {
    try {
      const newApiProject = await projectApiService.createProject(
        projectData
      );

      // Convert API project to display format
      const newDisplayProject: Project = {
        id: newApiProject.id,
        name: newApiProject.name,
        timeframe: newApiProject.end_date ? new Date(newApiProject.end_date).toLocaleDateString() : undefined,
        pinned: false,
        archived: !newApiProject.is_active,
        color: '#8b5cf6',
      };

      setProjects(prev => [newDisplayProject, ...prev]);
      toast.success(`Project "${newApiProject.name}" created successfully!`);
    } catch (err) {
      console.error('Error creating project:', err);
      toast.error('Failed to create project');
    }
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

  const handleArchiveProject = async (projectId: string) => {
    try {
      await projectApiService.archiveProject(projectId);
      
      // Update local state
      setProjects((prev) =>
        prev.map((project) =>
          project.id === projectId
            ? { ...project, archived: true }
            : project
        )
      );
      
      const project = projects.find(p => p.id === projectId);
      if (project) {
        toast.success(`"${project.name}" archived successfully`);
      }
    } catch (err) {
      console.error('Error archiving project:', err);
      toast.error('Failed to archive project');
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
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Projects Table */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-400">Loading projects...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-red-400">{error}</div>
            </div>
          ) : (
            <ProjectsTable
              projects={filteredProjects}
              selectedProjects={selectedProjects}
              onProjectSelect={handleProjectSelect}
              onProjectPin={handleProjectPin}
              onArchiveProject={handleArchiveProject}
            />
          )}
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

