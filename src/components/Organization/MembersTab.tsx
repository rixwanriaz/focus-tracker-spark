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
          <h2 className="text-xl font-semibold text-white">Members</h2>
          <p className="text-gray-400 text-sm">
            {isLoading ? 'Loading members...' : 
             error ? 'Error loading members' :
             `Manage organization members and their permissions`}
          </p>
        </div>
        
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>Invite New Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="member@example.com"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="member" className="text-gray-300">Member</SelectItem>
                    <SelectItem value="admin" className="text-gray-300">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Send Invitation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="text-sm text-gray-300">
              <p><strong>Debug Info:</strong></p>
              <p>Data Source: {membersData ? 'API' : 'Mock Data'}</p>
              <p>Members Count: {members?.length || 0}</p>
              {error && <p className="text-red-400">Error: {JSON.stringify(error)}</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-gray-800 border-gray-700 text-white"
        />
      </div>

      {/* Members Table */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-0">
          <div className="overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-gray-950 border-b border-gray-800">
              <div className="col-span-2 text-sm font-semibold text-gray-400 uppercase">Member</div>
              <div className="text-sm font-semibold text-gray-400 uppercase">Role</div>
              <div className="text-sm font-semibold text-gray-400 uppercase">Status</div>
              <div className="text-sm font-semibold text-gray-400 uppercase">Last Active</div>
              <div className="text-sm font-semibold text-gray-400 uppercase">Actions</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-800">
              {filteredMembers.map((member) => (
                <div key={member.id} className="grid grid-cols-6 gap-4 px-6 py-4 hover:bg-gray-800/50 transition-colors">
                  <div className="col-span-2 flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="bg-purple-600 text-white text-xs">
                        {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-white font-medium">{member.name}</div>
                      <div className="text-gray-400 text-sm">{member.email}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Badge className={`${getRoleBadgeColor(member.role)} text-white`}>
                      {member.role}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center">
                    <Badge className={`${getStatusBadgeColor(member.status)} text-white`}>
                      {member.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-300">
                    {member.lastActive}
                  </div>
                  
                  <div className="flex items-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-900 border-gray-800">
                        <DropdownMenuItem className="text-gray-300 hover:bg-gray-800">
                          <Mail className="mr-2 h-4 w-4" />
                          Resend Invitation
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-gray-300 hover:bg-gray-800">
                          <Shield className="mr-2 h-4 w-4" />
                          Change Role
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-400 hover:bg-gray-800">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{members.length}</div>
            <div className="text-gray-400 text-sm">Total Members</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">
              {members.filter(m => m.status === 'active').length}
            </div>
            <div className="text-gray-400 text-sm">Active Members</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">
              {members.filter(m => m.status === 'pending').length}
            </div>
            <div className="text-gray-400 text-sm">Pending Invitations</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { MembersTab };
