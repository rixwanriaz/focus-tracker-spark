import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, UserPlus, DollarSign, Shield, Trash2, Loader2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { 
  getProjectMembers,
  addProjectMember,
  removeProjectMember
} from '@/redux/slice/projectSlice';
import { toast } from 'sonner';
import { ProjectMember } from '@/redux/api/project';
import { AddProjectMemberDialog } from './AddProjectMemberDialog';
import { UserRateSetupDialog } from './UserRateSetupDialog';

interface ProjectMembersTabProps {
  projectId: string;
}

interface MemberWithRate extends ProjectMember {
  hourly_rate?: number;
  rate_set?: boolean;
}

const ProjectMembersTab: React.FC<ProjectMembersTabProps> = ({ projectId }) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { projectMembers, loading: membersLoading } = useSelector(
    (state: RootState) => state.project
  );
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isRateSetupDialogOpen, setIsRateSetupDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(null);
  const [membersWithRates, setMembersWithRates] = useState<MemberWithRate[]>([]);

  // Load project members
  useEffect(() => {
    if (projectId) {
      dispatch(getProjectMembers(projectId));
    }
  }, [dispatch, projectId]);

  // Process members data and check for rates
  useEffect(() => {
    const processMembers = async () => {
      const processedMembers = await Promise.all(
        (projectMembers || []).map(async (member) => {
          // Check if user has a rate set for this project
          let hourly_rate = undefined;
          let rate_set = false;
          
          try {
            // This would be the API call to check user rate for project
            // For now, we'll simulate this
            // const rateResponse = await fetch(`/api/v1/projects/${projectId}/rate-resolve?for_user_id=${member.user_id}&rate_type=billable`);
            // if (rateResponse.ok) {
            //   const rateData = await rateResponse.json();
            //   hourly_rate = rateData.hourly_rate;
            //   rate_set = true;
            // }
            
            // Simulate rate check - in real implementation, this would be an API call
            hourly_rate = Math.random() > 0.5 ? Math.floor(Math.random() * 100) + 50 : undefined;
            rate_set = hourly_rate !== undefined;
          } catch (error) {
            console.log('Rate check failed for user:', member.user_id);
          }

          return {
            ...member,
            hourly_rate,
            rate_set
          };
        })
      );
      
      setMembersWithRates(processedMembers);
    };

    if (projectMembers && projectMembers.length > 0) {
      processMembers();
    }
  }, [projectMembers, projectId]);

  // Handle add member success
  const handleAddMemberSuccess = () => {
    setIsAddMemberDialogOpen(false);
    // Refresh members list
    dispatch(getProjectMembers(projectId));
  };

  // Handle remove member
  const handleRemoveMember = async (memberId: string) => {
    try {
      await dispatch(removeProjectMember({ projectId, memberId })).unwrap();
      toast.success('Member removed successfully');
      // Refresh members list
      dispatch(getProjectMembers(projectId));
    } catch (error: any) {
      toast.error(error || 'Failed to remove member');
    }
  };

  // Handle rate setup
  const handleRateSetup = (member: ProjectMember) => {
    setSelectedMember(member);
    setIsRateSetupDialogOpen(true);
  };

  // Handle rate setup success
  const handleRateSetupSuccess = () => {
    setIsRateSetupDialogOpen(false);
    setSelectedMember(null);
    // Refresh members list to show updated rates
    dispatch(getProjectMembers(projectId));
  };

  const filteredMembers = membersWithRates.filter(member =>
    member.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-600';
      case 'admin': return 'bg-blue-600';
      case 'manager': return 'bg-green-600';
      case 'contributor': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getRateBadgeColor = (rate_set: boolean) => {
    return rate_set ? 'bg-green-600' : 'bg-yellow-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Project Members</h2>
          <p className="text-gray-400 text-sm mt-1">
            {membersLoading ? 'Loading members...' : 
             `Manage team members and their project rates`}
          </p>
        </div>
        
        <Button 
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          onClick={() => setIsAddMemberDialogOpen(true)}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-purple-500/50 transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Members</p>
                <p className="text-3xl font-bold text-white">{membersWithRates.length}</p>
              </div>
              <div className="p-3 bg-purple-600/20 rounded-full">
                <UserPlus className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-green-500/50 transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Rates Set</p>
                <p className="text-3xl font-bold text-white">
                  {membersWithRates.filter(m => m.rate_set).length}
                </p>
              </div>
              <div className="p-3 bg-green-600/20 rounded-full">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-yellow-500/50 transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Pending Rates</p>
                <p className="text-3xl font-bold text-white">
                  {membersWithRates.filter(m => !m.rate_set).length}
                </p>
              </div>
              <div className="p-3 bg-yellow-600/20 rounded-full">
                <Settings className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search members by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800 focus:border-purple-500/50 transition-all duration-200"
        />
      </div>

      {/* Members Table */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
        <CardHeader className="bg-gray-950/50 border-b border-gray-800">
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-purple-400" />
            Team Members ({membersWithRates.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-7 gap-4 px-6 py-4 bg-gray-950/30 border-b border-gray-800">
              <div className="col-span-2 text-sm font-semibold text-gray-300 uppercase tracking-wider">Member</div>
              <div className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Role</div>
              <div className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Rate Status</div>
              <div className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Hourly Rate</div>
              <div className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Joined</div>
              <div className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Actions</div>
            </div>

            {/* Table Body */}
            {filteredMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="p-4 bg-gray-800/50 rounded-full mb-4">
                  <UserPlus className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {searchTerm ? 'No members found' : 'No team members yet'}
                </h3>
                <p className="text-gray-400 text-sm text-center max-w-md">
                  {searchTerm 
                    ? 'Try adjusting your search terms to find members.' 
                    : 'Start building your team by adding your first member.'
                  }
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => setIsAddMemberDialogOpen(true)}
                    className="mt-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add First Member
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-800/50">
                {filteredMembers.map((member: MemberWithRate) => (
                  <div key={member.id} className="grid grid-cols-7 gap-4 px-6 py-5 hover:bg-gray-800/30 transition-all duration-200 group">
                    <div className="col-span-2 flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-10 w-10 ring-2 ring-gray-700 group-hover:ring-purple-500/50 transition-all duration-200">
                          <AvatarImage src={undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-600 to-purple-700 text-white font-semibold">
                            {member.user?.first_name?.charAt(0)}{member.user?.last_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                      </div>
                      <div>
                        <div className="text-white font-semibold group-hover:text-purple-300 transition-colors">
                          {member.user?.first_name} {member.user?.last_name}
                        </div>
                        <div className="text-gray-400 text-sm">{member.user?.email}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Badge className={`${getRoleBadgeColor(member.role)} text-white font-medium px-3 py-1 rounded-full`}>
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center">
                      <Badge className={`${getRateBadgeColor(member.rate_set || false)} text-white font-medium px-3 py-1 rounded-full`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          member.rate_set ? 'bg-green-300' : 'bg-yellow-300'
                        }`}></div>
                        {member.rate_set ? 'Set' : 'Pending'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center text-sm text-white font-medium">
                      {member.hourly_rate ? `$${member.hourly_rate}/hr` : '-'}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-300">
                      {new Date(member.joined_at).toLocaleDateString()}
                    </div>
                    
                    <div className="flex items-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-700">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-gray-900 border-gray-700 shadow-xl">
                          <DropdownMenuItem 
                            className="text-gray-300 hover:bg-gray-800 focus:bg-gray-800"
                            onClick={() => handleRateSetup(member)}
                          >
                            <DollarSign className="mr-2 h-4 w-4" />
                            {member.rate_set ? 'Update Rate' : 'Set Rate'}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-gray-300 hover:bg-gray-800 focus:bg-gray-800">
                            <Shield className="mr-2 h-4 w-4" />
                            Change Role
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-400 hover:bg-red-900/50 focus:bg-red-900/50"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Member Dialog */}
      <AddProjectMemberDialog
        open={isAddMemberDialogOpen}
        onOpenChange={setIsAddMemberDialogOpen}
        projectId={projectId}
        onSuccess={handleAddMemberSuccess}
      />

      {/* Rate Setup Dialog */}
      {selectedMember && (
        <UserRateSetupDialog
          open={isRateSetupDialogOpen}
          onOpenChange={setIsRateSetupDialogOpen}
          projectId={projectId}
          userId={selectedMember.user_id}
          userName={`${selectedMember.user?.first_name} ${selectedMember.user?.last_name}`}
          currentRate={selectedMember.hourly_rate}
          onSuccess={handleRateSetupSuccess}
        />
      )}
    </div>
  );
};

export { ProjectMembersTab };
