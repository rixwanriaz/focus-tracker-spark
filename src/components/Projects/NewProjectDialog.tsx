import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarPicker } from '@/components/ui/calendar-picker';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, ChevronDown, ChevronUp, DollarSign, Info, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreateProjectRequest } from '@/redux/api';
import { 
  projectValidationSchema,
  formatValidationErrors,
  defaultProjectFormData,
  projectColors,
  type ProjectFormData,
  type ProjectValidationError 
} from '@/validation/project';
import { AppDispatch, RootState } from '@/redux/store';
import { getOrganizationMembers } from '@/redux/slice/organizationSlice';
import { getOrgIdFromToken } from '@/lib/jwt';

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProject: (project: CreateProjectRequest) => void;
}

export const NewProjectDialog: React.FC<NewProjectDialogProps> = ({
  open,
  onOpenChange,
  onCreateProject,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { members, loadingMembers, error, currentOrganization } = useSelector((state: RootState) => ({
    members: state.organization.members,
    loadingMembers: state.organization.loadingMembers,
    error: state.organization.error,
    currentOrganization: state.organization.currentOrganization,
  }));

  // Also get user info from auth state for fallback
  const { user } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState<Partial<ProjectFormData>>({
    ...defaultProjectFormData,
    color: projectColors[0],
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ProjectValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get organization ID with fallbacks (same as MembersTab)
  const getOrganizationId = () => {
    // Primary source: JWT token (most reliable)
    const orgIdFromToken = getOrgIdFromToken();
    
    // Fallback to Redux state
    const orgId = orgIdFromToken || 
                  currentOrganization?.slug || 
                  currentOrganization?.name || 
                  (user as any)?.organization_id;

    return orgId;
  };

  // Fetch organization members when dialog opens
  useEffect(() => {
    if (open) {
      const orgId = getOrganizationId();
      console.log('NewProjectDialog: Fetching organization members for orgId:', orgId);
      if (orgId) {
        dispatch(getOrganizationMembers(orgId));
      } else {
        console.warn('NewProjectDialog: No organization ID found');
      }
    }
  }, [open, dispatch, currentOrganization?.slug, currentOrganization?.name]);

  // Debug members data
  useEffect(() => {
    console.log('NewProjectDialog: Members state changed:', {
      members,
      loadingMembers,
      error,
      membersCount: members?.length || 0,
      membersData: members
    });
  }, [members, loadingMembers, error]);

  // Manual test function for debugging (can be removed later)
  const testOrganizationMembersAPI = async () => {
    const orgId = getOrganizationId();
    console.log('Testing organization members API with orgId:', orgId);
    
    if (!orgId) {
      console.error('No organization ID available for testing');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/v1/organizations/${orgId}/members`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API Response status:', response.status);
      console.log('API Response headers:', response.headers);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API Response data:', data);
      } else {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
      }
    } catch (error) {
      console.error('API Call failed:', error);
    }
  };

  // Add test button for debugging (remove in production)
  const showDebugButton = process.env.NODE_ENV === 'development';

  // Reset form when dialog is closed
  React.useEffect(() => {
    if (!open) {
      setFormData({
        ...defaultProjectFormData,
        color: projectColors[0],
      });
      setShowAdvanced(false);
      setShowColorPicker(false);
      setValidationErrors([]);
      setIsSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setValidationErrors([]);

    try {
      // Validate form data using Yup
      await projectValidationSchema.validate(formData, { abortEarly: false });

      // Create project data for API
      const projectData: CreateProjectRequest = {
        name: formData.name || '',
        description: formData.description || undefined,
        start_date: formData.start_date 
          ? formData.start_date.toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        end_date: formData.end_date 
          ? formData.end_date.toISOString().split('T')[0]
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        budget_amount: formData.budget_amount || 0,
        budget_currency: formData.budget_currency || 'USD',
        project_manager_id: formData.project_manager_id || undefined,
        settings: {
          color: formData.color,
          privacy: formData.privacy,
          billable: formData.billable,
          hourlyRateType: formData.hourlyRateType,
          customRate: formData.customRate,
          access: formData.access,
          inviteMembers: formData.inviteMembers,
        },
      };

      await onCreateProject(projectData);

      // Reset form on success
      setFormData({
        ...defaultProjectFormData,
        color: projectColors[0],
      });
      setShowAdvanced(false);
      setValidationErrors([]);

      onOpenChange(false);
    } catch (error) {
      if (error instanceof Error && 'inner' in error) {
        // Yup validation error
        const errors = formatValidationErrors(error as any);
        setValidationErrors(errors);
      } else {
        console.error('Error creating project:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get error message for a field
  const getFieldError = (fieldName: string): string | undefined => {
    return validationErrors.find(error => error.field === fieldName)?.message;
  };

  // Helper text for invite members dropdown summary
  const getMembersDisplayText = (): string => {
    if (loadingMembers) return "Loading members...";
    if (error) return "Error loading members";
    if (!members || members.length === 0) return "No members available";

    if (formData.inviteMembers) {
      const selected = members.find(
        (m) => m?.user?.id === formData.inviteMembers
      );
      if (selected?.user) {
        return selected.user.full_name || selected.user.email || "1 selected";
      }
      return "1 selected";
    }

    return `${members.length} member${members.length === 1 ? "" : "s"} available`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-[540px] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-800">
          <DialogTitle className="text-base font-semibold">Create new project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-0">
          {/* Global Error Display */}
          {validationErrors.length > 0 && (
            <div className="mx-6 mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-red-400 text-sm font-medium mb-2">
                <AlertCircle className="h-4 w-4" />
                Please fix the following errors:
              </div>
              <ul className="text-red-300 text-sm space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error.message}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="px-6 pb-4 space-y-4">
            {/* Project Name with Color */}
            <div className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-3 mt-4">
              {/* Color Picker */}
              <div className="relative">
                <button
                  type="button"
                  className="w-8 h-8 rounded-full cursor-pointer ring-2 ring-gray-700 hover:ring-gray-600 transition-all"
                  style={{ backgroundColor: formData.color }}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                />
                {showColorPicker && (
                  <div className="absolute top-10 left-0 bg-gray-800 border border-gray-700 rounded-lg p-3 z-50 shadow-xl">
                    <div className="grid grid-cols-5 gap-2">
                      {projectColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, color: color as any });
                            setShowColorPicker(false);
                          }}
                          className={cn(
                            "w-8 h-8 rounded-full transition-transform hover:scale-110",
                            formData.color === color && "ring-2 ring-white"
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Project Name Input */}
              <div className="flex-1">
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Project name"
                  className={cn(
                    "bg-transparent border-0 text-white placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-auto",
                    getFieldError('name') && "text-red-400"
                  )}
                  required
                />
                {getFieldError('name') && (
                  <p className="text-red-400 text-xs mt-1">{getFieldError('name')}</p>
                )}
              </div>
            </div>

            {/* Project Description */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Description
              </Label>
              <Input
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Project description"
                className={cn(
                  "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500",
                  getFieldError('description') && "border-red-500"
                )}
              />
              {getFieldError('description') && (
                <p className="text-red-400 text-xs">{getFieldError('description')}</p>
              )}
            </div>

            {/* Project Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Start Date
                </Label>
                <CalendarPicker
                  value={formData.start_date}
                  onChange={(date) => setFormData({ ...formData, start_date: date })}
                  placeholder="dd/mm/yyyy"
                  className={cn(
                    getFieldError('start_date') && "border-red-500"
                  )}
                  maxDate={formData.end_date}
                />
                {getFieldError('start_date') && (
                  <p className="text-red-400 text-xs">{getFieldError('start_date')}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  End Date
                </Label>
                <CalendarPicker
                  value={formData.end_date}
                  onChange={(date) => setFormData({ ...formData, end_date: date })}
                  placeholder="dd/mm/yyyy"
                  className={cn(
                    getFieldError('end_date') && "border-red-500"
                  )}
                  minDate={formData.start_date}
                />
                {getFieldError('end_date') && (
                  <p className="text-red-400 text-xs">{getFieldError('end_date')}</p>
                )}
              </div>
            </div>

            {/* Budget */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Budget Amount
                </Label>
                <Input
                  type="number"
                  value={formData.budget_amount || ''}
                  onChange={(e) => setFormData({ ...formData, budget_amount: Number(e.target.value) || 0 })}
                  placeholder="0"
                  className={cn(
                    "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500",
                    getFieldError('budget_amount') && "border-red-500"
                  )}
                />
                {getFieldError('budget_amount') && (
                  <p className="text-red-400 text-xs">{getFieldError('budget_amount')}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Currency
                </Label>
                <Select value={formData.budget_currency} onValueChange={(value) => setFormData({ ...formData, budget_currency: value as any })}>
                  <SelectTrigger className={cn(
                    "bg-gray-800 border-gray-700 text-white",
                    getFieldError('budget_currency') && "border-red-500"
                  )}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="USD" className="text-gray-300">USD</SelectItem>
                    <SelectItem value="EUR" className="text-gray-300">EUR</SelectItem>
                    <SelectItem value="GBP" className="text-gray-300">GBP</SelectItem>
                  </SelectContent>
                </Select>
                {getFieldError('budget_currency') && (
                  <p className="text-red-400 text-xs">{getFieldError('budget_currency')}</p>
                )}
              </div>
            </div>

            {/* Privacy Section */}
            <div className="bg-gray-800 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Privacy</span>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="text-xs">Private, visible only to project members</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Invite Members */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Invite Members
                  </Label>
                  <span className="text-xs text-gray-500">
                    {getMembersDisplayText()}
                  </span>
                </div>
                <Select 
                  value={formData.inviteMembers || ''} 
                  onValueChange={(value) => setFormData({ ...formData, inviteMembers: value })}
                  disabled={loadingMembers || !members || members.length === 0}
                >
                  <SelectTrigger className="bg-gray-900 border-gray-700 text-gray-400 h-10">
                    <SelectValue placeholder={
                      loadingMembers ? "Loading members..." : 
                      error ? "Error loading members" :
                      !members || members.length === 0 ? "No members available" :
                      "Select Team Member or Group"
                    } />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    {loadingMembers ? (
                      <div className="flex items-center justify-center p-4 text-gray-400">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Loading members...
                      </div>
                    ) : error ? (
                      <div className="flex items-center justify-center p-4 text-red-400">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        <div className="text-xs">
                          <div>Failed to load members</div>
                          <div className="text-red-300 mt-1">{error}</div>
                          <div className="text-gray-500 mt-2">
                            You can still create the project and add members later.
                          </div>
                        </div>
                      </div>
                    ) : !members || members.length === 0 ? (
                      <div className="flex items-center justify-center p-4 text-gray-400">
                        <div className="text-xs text-center">
                          <div>No members found</div>
                          <div className="text-gray-500 mt-1">
                            {members === null ? 'API returned null' : `Found ${members.length} members`}
                          </div>
                          <div className="text-gray-500 mt-2">
                            You can still create the project and add members later.
                          </div>
                        </div>
                      </div>
                    ) : (
                      members
                        .filter(member => member && member.user)
                        .map((member) => {
                          if (!member || !member.user) {
                            console.warn('Invalid member data:', member);
                            return null;
                          }
                          return (
                            <SelectItem 
                              key={member.user.id} 
                              value={member.user.id} 
                              className="text-gray-300"
                            >
                              {member.user.full_name || member.user.email}
                              {member.role && (
                                <span className="ml-2 text-xs text-gray-500">
                                  ({member.role})
                                </span>
                              )}
                            </SelectItem>
                          );
                        })
                    )}
                  </SelectContent>
                </Select>
                {(!members || members.length === 0) && !loadingMembers && (
                  <p className="text-xs text-gray-500">
                    💡 You can add members to this project after creation from the project settings.
                  </p>
                )}
                {showDebugButton && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={testOrganizationMembersAPI}
                    className="text-xs text-gray-400 border-gray-600 hover:text-white hover:border-gray-500"
                  >
                    🔧 Test API (Dev Only)
                  </Button>
                )}
              </div>

              {/* Access */}
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Access
                  </Label>
                  <Info className="w-3 h-3 text-gray-500" />
                </div>
                <Select value={formData.access} onValueChange={(value) => setFormData({ ...formData, access: value as any })}>
                  <SelectTrigger className="bg-gray-900 border-gray-700 text-gray-300 h-10">
                    <SelectValue placeholder="Regular member" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="regular" className="text-gray-300">Regular member</SelectItem>
                    <SelectItem value="admin" className="text-gray-300">Project admin</SelectItem>
                    <SelectItem value="manager" className="text-gray-300">Project manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Billable Section */}
            <div className="bg-gray-800 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Billable</span>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="text-xs">using Workspace rates (0 USD/h)</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Hourly Rate */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Hourly Rate
                </Label>
                <RadioGroup value={formData.hourlyRateType} onValueChange={(value) => setFormData({ ...formData, hourlyRateType: value as any })}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="default" id="default" className="border-gray-600 text-purple-500" />
                    <Label htmlFor="default" className="text-sm text-gray-300 cursor-pointer flex items-center gap-1">
                      Default hourly rates
                      <Info className="w-3 h-3 text-gray-500" />
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="custom" className="border-gray-600 text-purple-500" />
                    <Label htmlFor="custom" className="text-sm text-gray-300 cursor-pointer flex items-center gap-1">
                      Custom project hourly rate
                      <Info className="w-3 h-3 text-gray-500" />
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="border-t border-gray-800">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full px-6 py-3 flex items-center justify-center gap-2 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-wider hover:bg-gray-800/50"
            >
              Advanced Options
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {showAdvanced && (
              <div className="px-6 pb-4 pt-2 space-y-4 border-t border-gray-800">
                <p className="text-sm text-gray-400">Additional project settings can be configured here.</p>
              </div>
            )}
          </div>

          {/* Create Button */}
          <div className="px-6 pb-6 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-6 text-sm rounded-lg transition-all duration-200"
            >
              {isSubmitting ? 'Creating project...' : 'Create project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

