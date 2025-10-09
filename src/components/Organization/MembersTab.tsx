import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, UserPlus, Mail, Shield, Trash2 } from 'lucide-react';
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
import { organizationApiService } from '@/redux/api/organization';
import { authApiService } from '@/redux/api/auth';

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'pending' | 'suspended';
  lastActive: string;
  avatar?: string;
}

const MembersTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [membersData, setMembersData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  // Mock data fallback - this would come from API
  const mockMembers: Member[] = [
    {
      id: '1',
      name: 'Rixwan Riaz123',
      email: 'rixwan@example.com',
      role: 'owner',
      status: 'active',
      lastActive: '2 hours ago',
    },
    {
      id: '2',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      status: 'active',
      lastActive: '1 day ago',
    },
    {
      id: '3',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'member',
      status: 'pending',
      lastActive: 'Never',
    },
  ];

  // Use API data if available, otherwise fallback to mock data
  const members = membersData?.members?.map(member => ({
    id: member.id,
    name: `${member.user.first_name || ''} ${member.user.last_name || ''}`.trim() || member.user.email,
    email: member.user.email,
    role: member.role as 'owner' | 'admin' | 'member',
    status: 'active' as 'active' | 'pending' | 'suspended',
    lastActive: new Date(member.joined_at).toLocaleDateString(),
    avatar: undefined, // API doesn't provide avatar yet
  })) || mockMembers;

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-600';
      case 'admin': return 'bg-blue-600';
      case 'member': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600';
      case 'pending': return 'bg-yellow-600';
      case 'suspended': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Team Members</h2>
          <p className="text-gray-400 text-sm mt-1">
            {isLoading ? 'Loading members...' : 
             error ? 'Error loading members' :
             `Manage your organization members and their permissions`}
          </p>
        </div>
        
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 text-white shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-purple-400" />
                Invite New Member
              </DialogTitle>
              <p className="text-gray-400 text-sm">Send an invitation to join your organization</p>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-300">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="member@example.com"
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800 focus:border-purple-500/50 transition-all duration-200 mt-2"
                />
              </div>
              <div>
                <Label htmlFor="role" className="text-sm font-medium text-gray-300">Role</Label>
                <Select>
                  <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white focus:bg-gray-800 focus:border-purple-500/50 transition-all duration-200 mt-2">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700 shadow-xl">
                    <SelectItem value="member" className="text-gray-300 hover:bg-gray-800 focus:bg-gray-800">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        Member
                      </div>
                    </SelectItem>
                    <SelectItem value="admin" className="text-gray-300 hover:bg-gray-800 focus:bg-gray-800">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Admin
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsInviteDialogOpen(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all duration-200">
                  Send Invitation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-purple-500/50 transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Members</p>
                <p className="text-3xl font-bold text-white">{members.length}</p>
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
                <p className="text-sm font-medium text-gray-400">Active Members</p>
                <p className="text-3xl font-bold text-white">
                  {members.filter(m => m.status === 'active').length}
                </p>
              </div>
              <div className="p-3 bg-green-600/20 rounded-full">
                <div className="h-6 w-6 rounded-full bg-green-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-yellow-500/50 transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Pending Invites</p>
                <p className="text-3xl font-bold text-white">
                  {members.filter(m => m.status === 'pending').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-600/20 rounded-full">
                <div className="h-6 w-6 rounded-full bg-yellow-500"></div>
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
            Team Members ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-gray-950/30 border-b border-gray-800">
              <div className="col-span-2 text-sm font-semibold text-gray-300 uppercase tracking-wider">Member</div>
              <div className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Role</div>
              <div className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Status</div>
              <div className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Last Active</div>
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
                    : 'Start building your team by inviting your first member.'
                  }
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => setIsInviteDialogOpen(true)}
                    className="mt-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite First Member
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-800/50">
                {filteredMembers.map((member, index) => (
                <div key={member.id} className="grid grid-cols-6 gap-4 px-6 py-5 hover:bg-gray-800/30 transition-all duration-200 group">
                  <div className="col-span-2 flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-10 w-10 ring-2 ring-gray-700 group-hover:ring-purple-500/50 transition-all duration-200">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-600 to-purple-700 text-white font-semibold">
                          {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {member.status === 'active' && (
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                      )}
                    </div>
                    <div>
                      <div className="text-white font-semibold group-hover:text-purple-300 transition-colors">{member.name}</div>
                      <div className="text-gray-400 text-sm">{member.email}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Badge className={`${getRoleBadgeColor(member.role)} text-white font-medium px-3 py-1 rounded-full`}>
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center">
                    <Badge className={`${getStatusBadgeColor(member.status)} text-white font-medium px-3 py-1 rounded-full`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        member.status === 'active' ? 'bg-green-300' : 
                        member.status === 'pending' ? 'bg-yellow-300' : 'bg-red-300'
                      }`}></div>
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-300">
                    {member.lastActive}
                  </div>
                  
                  <div className="flex items-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-700">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-900 border-gray-700 shadow-xl">
                        <DropdownMenuItem className="text-gray-300 hover:bg-gray-800 focus:bg-gray-800">
                          <Mail className="mr-2 h-4 w-4" />
                          Resend Invitation
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-gray-300 hover:bg-gray-800 focus:bg-gray-800">
                          <Shield className="mr-2 h-4 w-4" />
                          Change Role
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-400 hover:bg-red-900/50 focus:bg-red-900/50">
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

    </div>
  );
};

export { MembersTab };
