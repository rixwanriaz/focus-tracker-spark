import React, { useState, useEffect } from 'react';
import { DollarSign, Clock, Building, Loader2, AlertCircle, CheckCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { getProjects } from '@/redux/slice/projectSlice';
import { financeApiService, projectApiService } from '@/redux/api';
import { toast } from 'sonner';
import { ProjectRateSetupDialog } from './ProjectRateSetupDialog';

interface ProjectWithRate {
  id: string;
  name: string;
  description?: string;
  status: string;
  currentRate?: number;
  rateSet: boolean;
  lastUpdated?: string;
}

const UserProjectRates: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { projects, loading } = useSelector((state: RootState) => state.project);
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Local state
  const [projectRates, setProjectRates] = useState<ProjectWithRate[]>([]);
  const [loadingRates, setLoadingRates] = useState(false);
  const [updatingRates, setUpdatingRates] = useState<Set<string>>(new Set());
  const [rateDialogOpen, setRateDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectWithRate | null>(null);

  // Load user's projects and their rates
  useEffect(() => {
    loadUserProjectsAndRates();
  }, []);

  const loadUserProjectsAndRates = async () => {
    try {
      setLoadingRates(true);
      
      // Get all projects first
      await dispatch(getProjects()).unwrap();
      
      // For each project, check if user has a rate set
      const projectsWithRates = await Promise.all(
        projects.map(async (project) => {
          let currentRate: number | undefined;
          let rateSet = false;
          let lastUpdated: string | undefined;

          try {
            // Resolve current user's rate for the project (auth handled by axios client)
            const rateData = await financeApiService.resolveRate(project.id, undefined, undefined, 'billable');
            if (rateData && typeof rateData.hourly_rate === 'number') {
              currentRate = rateData.hourly_rate;
              rateSet = true;
              lastUpdated = 'Recently';
            }
          } catch (error) {
            // Likely 404 when no rate set, ignore
          }

          return {
            id: project.id,
            name: project.name,
            description: project.description,
            status: project.status || 'active',
            currentRate,
            rateSet,
            lastUpdated,
          };
        })
      );

      setProjectRates(projectsWithRates);
    } catch (error) {
      console.error('Error loading user projects and rates:', error);
      toast.error('Failed to load your projects');
    } finally {
      setLoadingRates(false);
    }
  };

  const handleSetRate = async (projectId: string, rate: number) => {
    setUpdatingRates(prev => new Set(prev).add(projectId));
    
    try {
      await projectApiService.setMyRate(projectId, rate);

      // Update local state
      setProjectRates(prev => prev.map(project => 
        project.id === projectId 
          ? { ...project, currentRate: rate, rateSet: true, lastUpdated: 'Just now' }
          : project
      ));

      toast.success('Rate updated successfully!');
    } catch (error: any) {
      console.error('Error setting rate:', error);
      toast.error(error?.message || 'Failed to set rate. Please try again.');
    } finally {
      setUpdatingRates(prev => {
        const newSet = new Set(prev);
        newSet.delete(projectId);
        return newSet;
      });
    }
  };

  const handleQuickRateSet = async (project: ProjectWithRate, rate: number) => {
    await handleSetRate(project.id, rate);
  };

  const handleDetailedRateSetup = (project: ProjectWithRate) => {
    setSelectedProject(project);
    setRateDialogOpen(true);
  };

  const handleRateDialogSuccess = () => {
    loadUserProjectsAndRates(); // Refresh the rates
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600';
      case 'completed': return 'bg-blue-600';
      case 'paused': return 'bg-yellow-600';
      case 'cancelled': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getRateStatusBadgeColor = (rateSet: boolean) => {
    return rateSet ? 'bg-green-600' : 'bg-yellow-600';
  };

  if (loading || loadingRates) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400">Loading your projects and rates...</p>
        </div>
      </div>
    );
  }

  if (projectRates.length === 0) {
    return (
      <div className="text-center py-12">
        <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No Projects Found</h3>
        <p className="text-gray-400 mb-4">You're not a member of any projects yet.</p>
        <Button 
          onClick={() => window.location.href = '/projects'}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Browse Projects
        </Button>
      </div>
    );
  }

  const ratesSet = projectRates.filter(p => p.rateSet).length;
  const ratesPending = projectRates.filter(p => !p.rateSet).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">My Project Rates</h2>
          <p className="text-gray-400 text-sm mt-1">
            Set your hourly rates for each project you're working on
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-purple-500/50 transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Projects</p>
                <p className="text-3xl font-bold text-white">{projectRates.length}</p>
              </div>
              <div className="p-3 bg-purple-600/20 rounded-full">
                <Building className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-green-500/50 transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Rates Set</p>
                <p className="text-3xl font-bold text-white">{ratesSet}</p>
              </div>
              <div className="p-3 bg-green-600/20 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-yellow-500/50 transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Pending Setup</p>
                <p className="text-3xl font-bold text-white">{ratesPending}</p>
              </div>
              <div className="p-3 bg-yellow-600/20 rounded-full">
                <AlertCircle className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rate Setup Alert */}
      {ratesPending > 0 && (
        <Alert className="bg-yellow-900/20 border-yellow-500/50">
          <AlertCircle className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-yellow-300">
            You have {ratesPending} project{ratesPending > 1 ? 's' : ''} without rates set. 
            Please set your hourly rates to enable time tracking and billing.
          </AlertDescription>
        </Alert>
      )}

      {/* Projects List */}
      <div className="grid gap-4">
        {projectRates.map((project) => (
          <Card key={project.id} className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl hover:border-purple-500/50 transition-all duration-200">
            <CardHeader className="bg-gray-950/50 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center">
                    <Building className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-white">{project.name}</CardTitle>
                    {project.description && (
                      <p className="text-gray-400 text-sm mt-1">{project.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${getStatusBadgeColor(project.status)} text-white font-medium px-3 py-1 rounded-full`}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </Badge>
                  <Badge className={`${getRateStatusBadgeColor(project.rateSet)} text-white font-medium px-3 py-1 rounded-full`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      project.rateSet ? 'bg-green-300' : 'bg-yellow-300'
                    }`}></div>
                    {project.rateSet ? 'Rate Set' : 'Pending'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Rate Display */}
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Current Rate</h4>
                  {project.rateSet ? (
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-white">${project.currentRate}/hour</div>
                      <p className="text-xs text-gray-400">
                        Last updated: {project.lastUpdated}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-lg text-yellow-400">No rate set</div>
                      <p className="text-xs text-gray-400">
                        Set your hourly rate to enable time tracking
                      </p>
                    </div>
                  )}
                </div>

                {/* Rate Setup Actions */}
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Quick Set Rate</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickRateSet(project, 25)}
                      disabled={updatingRates.has(project.id)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white text-xs"
                    >
                      {updatingRates.has(project.id) ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        '$25/hr'
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickRateSet(project, 50)}
                      disabled={updatingRates.has(project.id)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white text-xs"
                    >
                      {updatingRates.has(project.id) ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        '$50/hr'
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickRateSet(project, 75)}
                      disabled={updatingRates.has(project.id)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white text-xs"
                    >
                      {updatingRates.has(project.id) ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        '$75/hr'
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickRateSet(project, 100)}
                      disabled={updatingRates.has(project.id)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white text-xs"
                    >
                      {updatingRates.has(project.id) ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        '$100/hr'
                      )}
                    </Button>
                  </div>
                  <div className="mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDetailedRateSetup(project)}
                      className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white text-xs w-full"
                    >
                      <DollarSign className="mr-2 h-3 w-3" />
                      Set Custom Rate
                    </Button>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      Click a rate above to set instantly, or set a custom rate
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Help Section */}
      <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-400" />
            About Project Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-300">
            <p>
              <strong>Why set rates?</strong> Your hourly rate determines how your time is billed when tracking time on projects.
            </p>
            <p>
              <strong>Rate flexibility:</strong> You can set different rates for different projects based on complexity, requirements, or your role.
            </p>
            <p>
              <strong>Rate changes:</strong> You can update your rates anytime. Changes apply to new time entries but don't affect historical data.
            </p>
            <p>
              <strong>Billing:</strong> When you track time, the system automatically uses your project rate for billing calculations.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Rate Setup Dialog */}
      {selectedProject && (
        <ProjectRateSetupDialog
          open={rateDialogOpen}
          onOpenChange={setRateDialogOpen}
          projectId={selectedProject.id}
          projectName={selectedProject.name}
          currentRate={selectedProject.currentRate}
          onSuccess={handleRateDialogSuccess}
        />
      )}
    </div>
  );
};

export { UserProjectRates };
