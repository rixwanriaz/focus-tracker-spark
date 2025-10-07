import React, { useState } from 'react';
import { Plus, Search, MoreHorizontal, Users, Settings, Trash2, Edit } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';

interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  permissions: string[];
  createdAt: string;
  members: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
}

const GroupsTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Mock data - this would come from API
  const groups: Group[] = [
    {
      id: '1',
      name: 'Development Team',
      description: 'Core development team members',
      memberCount: 5,
      permissions: ['read', 'write', 'admin'],
      createdAt: '2024-01-15',
      members: [
        { id: '1', name: 'John Doe' },
        { id: '2', name: 'Jane Smith' },
        { id: '3', name: 'Mike Johnson' },
        { id: '4', name: 'Sarah Wilson' },
        { id: '5', name: 'Tom Brown' },
      ],
    },
    {
      id: '2',
      name: 'Design Team',
      description: 'UI/UX designers and creative team',
      memberCount: 3,
      permissions: ['read', 'write'],
      createdAt: '2024-01-20',
      members: [
        { id: '6', name: 'Alice Cooper' },
        { id: '7', name: 'Bob Dylan' },
        { id: '8', name: 'Carol King' },
      ],
    },
  ];

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Groups</h2>
          <p className="text-gray-400 text-sm">Organize members into groups for easier management</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="groupName">Group Name</Label>
                <Input
                  id="groupName"
                  placeholder="Enter group name"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter group description"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Create Group
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search groups..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-gray-800 border-gray-700 text-white"
        />
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => (
          <Card key={group.id} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">{group.name}</CardTitle>
                    <p className="text-gray-400 text-sm">{group.description}</p>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-900 border-gray-800">
                    <DropdownMenuItem className="text-gray-300 hover:bg-gray-800">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Group
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-300 hover:bg-gray-800">
                      <Settings className="mr-2 h-4 w-4" />
                      Manage Permissions
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-400 hover:bg-gray-800">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Group
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {/* Member Avatars */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex -space-x-2">
                  {group.members.slice(0, 4).map((member, index) => (
                    <Avatar key={member.id} className="h-6 w-6 border-2 border-gray-900">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="bg-purple-600 text-white text-xs">
                        {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {group.memberCount > 4 && (
                    <div className="h-6 w-6 bg-gray-700 border-2 border-gray-900 rounded-full flex items-center justify-center text-xs text-gray-300">
                      +{group.memberCount - 4}
                    </div>
                  )}
                </div>
                <span className="text-gray-400 text-sm">
                  {group.memberCount} member{group.memberCount !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Permissions */}
              <div className="flex flex-wrap gap-1 mb-3">
                {group.permissions.map((permission) => (
                  <Badge key={permission} className="bg-purple-600 text-white text-xs">
                    {permission}
                  </Badge>
                ))}
              </div>

              {/* Created Date */}
              <div className="text-gray-400 text-xs">
                Created {new Date(group.createdAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredGroups.length === 0 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No groups found</h3>
            <p className="text-gray-400 mb-4">
              {searchTerm ? 'No groups match your search criteria.' : 'Create your first group to organize members.'}
            </p>
            {!searchTerm && (
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Create Group
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{groups.length}</div>
            <div className="text-gray-400 text-sm">Total Groups</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">
              {groups.reduce((sum, group) => sum + group.memberCount, 0)}
            </div>
            <div className="text-gray-400 text-sm">Total Members</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">
              {Math.round(groups.reduce((sum, group) => sum + group.memberCount, 0) / groups.length) || 0}
            </div>
            <div className="text-gray-400 text-sm">Avg Members per Group</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { GroupsTab };
