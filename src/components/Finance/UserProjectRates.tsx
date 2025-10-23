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
    return rateSet ? 'bg-green-600' : 'bg-orange-600';
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border-purple-800/50 hover:border-purple-700 transition-all hover:shadow-xl hover:scale-105 group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-purple-300 group-hover:text-purple-200 transition-colors">Total Projects</p>
                <p className="text-4xl font-bold text-white">{projectRates.length}</p>
              </div>
              <div className="p-3 bg-purple-900/40 rounded-xl border border-purple-800/50 group-hover:bg-purple-900/60 transition-colors">
                <Building className="h-7 w-7 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-900/30 to-green-800/10 border-green-800/50 hover:border-green-700 transition-all hover:shadow-xl hover:scale-105 group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-green-300 group-hover:text-green-200 transition-colors">Rates Set</p>
                <p className="text-4xl font-bold text-white">{ratesSet}</p>
              </div>
              <div className="p-3 bg-green-900/40 rounded-xl border border-green-800/50 group-hover:bg-green-900/60 transition-colors">
                <CheckCircle className="h-7 w-7 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-900/30 to-orange-800/10 border-orange-800/50 hover:border-orange-700 transition-all hover:shadow-xl hover:scale-105 group">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-orange-300 group-hover:text-orange-200 transition-colors">Pending Setup</p>
                <p className="text-4xl font-bold text-white">{ratesPending}</p>
              </div>
              <div className="p-3 bg-orange-900/40 rounded-xl border border-orange-800/50 group-hover:bg-orange-900/60 transition-colors">
                <AlertCircle className="h-7 w-7 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rate Setup Alert */}
      {ratesPending > 0 && (
        <Alert className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 border-orange-800/50 rounded-xl shadow-lg">
          <div className="flex gap-3">
            <div className="p-2 bg-orange-900/30 rounded-lg border border-orange-800/50">
              <AlertCircle className="h-5 w-5 text-orange-400" />
            </div>
            <AlertDescription className="text-orange-200">
              <p className="font-semibold mb-1">Action Required</p>
              You have <span className="font-bold text-orange-300">{ratesPending}</span> project{ratesPending > 1 ? 's' : ''} without rates set. 
              Please set your hourly rates to enable time tracking and billing.
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Projects List */}
      <div className="grid gap-6">
        {projectRates.map((project) => (
          <Card key={project.id} className="bg-gray-900 border-gray-800 shadow-2xl hover:shadow-purple-500/10 hover:border-purple-700/50 transition-all duration-300 overflow-hidden rounded-xl group">
            <CardHeader className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-800/50 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-md opacity-40 group-hover:opacity-60 transition-opacity"></div>
                    <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                      <Building className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">{project.name}</CardTitle>
                    {project.description && (
                      <p className="text-gray-400 text-sm mt-1 leading-relaxed">{project.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`${getStatusBadgeColor(project.status)} text-white font-semibold px-3 py-1.5 rounded-lg shadow-md`}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </Badge>
                  <Badge className={`${getRateStatusBadgeColor(project.rateSet)} text-white font-semibold px-3 py-1.5 rounded-lg shadow-md flex items-center gap-2`}>
                    <div className={`w-2 h-2 rounded-full ${
                      project.rateSet ? 'bg-green-300' : 'bg-orange-300'
                    }`}></div>
                    {project.rateSet ? 'Rate Set' : 'Pending'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Current Rate Display */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-900/30 rounded-lg border border-blue-800/30">
                      <DollarSign className="h-4 w-4 text-blue-400" />
                    </div>
                    <h4 className="text-sm font-semibold text-white">Current Rate</h4>
                  </div>
                  {project.rateSet ? (
                    <div className="p-5 bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-800/30 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <span className="text-sm font-medium text-green-300">Active Rate</span>
                      </div>
                      <div className="text-4xl font-bold text-white mb-1">${project.currentRate}<span className="text-xl text-gray-400">/hr</span></div>
                      <p className="text-xs text-gray-400 flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        Last updated: {project.lastUpdated}
                      </p>
                    </div>
                  ) : (
                    <div className="p-5 bg-gradient-to-br from-orange-900/20 to-orange-800/10 border border-orange-800/30 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertCircle className="h-5 w-5 text-orange-400" />
                        <span className="text-sm font-medium text-orange-300">No Rate Set</span>
                      </div>
                      <p className="text-sm text-gray-300">
                        Set your hourly rate to enable time tracking and billing for this project.
                      </p>
                    </div>
                  )}
                </div>

                {/* Rate Setup Actions */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-900/30 rounded-lg border border-purple-800/30">
                      <Clock className="h-4 w-4 text-purple-400" />
                    </div>
                    <h4 className="text-sm font-semibold text-white">Quick Set Rate</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[25, 50, 75, 100].map((rate) => (
                      <Button
                        key={rate}
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickRateSet(project, rate)}
                        disabled={updatingRates.has(project.id)}
                        className="border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-purple-600 hover:border-purple-600 hover:text-white transition-all hover:scale-105 font-semibold h-11"
                      >
                        {updatingRates.has(project.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          `$${rate}/hr`
                        )}
                      </Button>
                    ))}
                  </div>
                  <div className="pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleDetailedRateSetup(project)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white w-full h-11 font-semibold hover:scale-105 transition-transform shadow-lg"
                    >
                      <DollarSign className="mr-2 h-4 w-4" />
                      Set Custom Rate
                    </Button>
                    <p className="text-xs text-gray-500 mt-3 text-center">
                      Click a preset or create a custom rate
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Help Section */}
      <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-800/50 shadow-xl rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-900/30 to-blue-800/20 border-b border-blue-800/30 pb-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-900/40 rounded-xl border border-blue-800/50">
              <DollarSign className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">About Project Rates</CardTitle>
              <p className="text-sm text-blue-200/80 mt-1">Understanding how billing rates work</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-blue-900/30 rounded-lg border border-blue-800/30 mt-0.5">
                  <CheckCircle className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Why set rates?</p>
                  <p className="text-sm text-gray-400 mt-1">Your hourly rate determines how your time is billed when tracking time on projects.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-blue-900/30 rounded-lg border border-blue-800/30 mt-0.5">
                  <Building className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Rate flexibility</p>
                  <p className="text-sm text-gray-400 mt-1">Set different rates for different projects based on complexity, requirements, or your role.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-blue-900/30 rounded-lg border border-blue-800/30 mt-0.5">
                  <Clock className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Rate changes</p>
                  <p className="text-sm text-gray-400 mt-1">Update rates anytime. Changes apply to new time entries but don't affect historical data.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-blue-900/30 rounded-lg border border-blue-800/30 mt-0.5">
                  <DollarSign className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Automatic billing</p>
                  <p className="text-sm text-gray-400 mt-1">When you track time, the system automatically uses your project rate for billing calculations.</p>
                </div>
              </div>
            </div>
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
