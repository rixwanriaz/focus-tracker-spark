import React, { useState, useEffect } from 'react';
import { UserPlus, Loader2, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { addProjectMember } from '@/redux/slice/projectSlice';
import { toast } from 'sonner';
import { AddMemberRequest } from '@/redux/api/project';

interface AddProjectMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSuccess: () => void;
}

interface OrganizationUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
}

const AddProjectMemberDialog: React.FC<AddProjectMemberDialogProps> = ({
  open,
  onOpenChange,
  projectId,
  onSuccess,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state - get organization members
  const { members } = useSelector((state: RootState) => state.organization);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<OrganizationUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('contributor');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Process organization members to get available users
  const availableUsers = (members || [])
    .filter(member => member.user && member.user.id)
    .map(member => {
      // Handle different user name formats (full_name vs first_name/last_name)
      const fullName = member.user.full_name || '';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      return {
        id: member.user.id,
        email: member.user.email || '',
        first_name: firstName,
        last_name: lastName,
        role: member.role || 'contributor',
        is_active: true,
      };
    })
    .filter(user => 
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setSelectedUser(null);
      setSelectedRole('contributor');
      setIsSubmitting(false);
    }
  }, [open]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) {
      toast.error('Please select a user to add');
      return;
    }

    setIsSubmitting(true);

    try {
      const addMemberData: AddMemberRequest = {
        user_id: selectedUser.id,
        role: selectedRole,
      };

      await dispatch(addProjectMember({ 
        projectId, 
        data: addMemberData 
      })).unwrap();

      toast.success(`${selectedUser.first_name} ${selectedUser.last_name} added to project successfully`);
      onSuccess();
    } catch (error: any) {
      toast.error(error || 'Failed to add member to project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-600';
      case 'admin': return 'bg-blue-600';
      case 'manager': return 'bg-green-600';
      case 'contributor': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 text-white shadow-2xl max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-purple-400" />
            Add Team Member
          </DialogTitle>
          <p className="text-gray-400 text-sm">Add a member from your organization to this project</p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Search */}
          <div>
            <Label htmlFor="search" className="text-sm font-medium text-gray-300">Search Members</Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800 focus:border-purple-500/50 transition-all duration-200"
              />
            </div>
          </div>

          {/* Available Users List */}
          <div>
            <Label className="text-sm font-medium text-gray-300">Available Members</Label>
            <div className="mt-2 max-h-48 overflow-y-auto space-y-2 bg-gray-800/30 rounded-lg p-3">
              {availableUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p>No available members found</p>
                  <p className="text-xs mt-1">Try adjusting your search terms</p>
                </div>
              ) : (
                availableUsers.map((user) => (
                  <Card 
                    key={user.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedUser?.id === user.id 
                        ? 'bg-purple-600/20 border-purple-500/50' 
                        : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50'
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-600 to-purple-700 text-white text-xs">
                            {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="text-white font-medium">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-gray-400 text-sm">{user.email}</div>
                        </div>
                        <Badge className={`${getRoleBadgeColor(user.role)} text-white text-xs`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Selected User Display */}
          {selectedUser && (
            <div>
              <Label className="text-sm font-medium text-gray-300">Selected Member</Label>
              <Card className="mt-2 bg-purple-600/20 border-purple-500/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-purple-700 text-white">
                        {selectedUser.first_name.charAt(0)}{selectedUser.last_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-white font-semibold">
                        {selectedUser.first_name} {selectedUser.last_name}
                      </div>
                      <div className="text-gray-300 text-sm">{selectedUser.email}</div>
                    </div>
                    <Badge className={`${getRoleBadgeColor(selectedUser.role)} text-white`}>
                      {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Project Role Selection */}
          {selectedUser && (
            <div>
              <Label htmlFor="role" className="text-sm font-medium text-gray-300">Project Role</Label>
              <Select 
                value={selectedRole} 
                onValueChange={setSelectedRole}
              >
                <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white focus:bg-gray-800 focus:border-purple-500/50 transition-all duration-200 mt-2">
                  <SelectValue placeholder="Select project role" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 shadow-xl">
                  <SelectItem value="contributor" className="text-gray-300 hover:bg-gray-800 focus:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">Contributor</div>
                        <div className="text-xs text-gray-400">Track time, complete tasks, view details</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="manager" className="text-gray-300 hover:bg-gray-800 focus:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">Manager</div>
                        <div className="text-xs text-gray-400">Manage settings, add/remove members, view financials</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400 mt-1">
                Project role determines permissions within this project
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!selectedUser || isSubmitting}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Member
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { AddProjectMemberDialog };
