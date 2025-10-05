import React, { useState } from 'react';
import { MainLayout } from '@/components/Layout';
import { MembersTable, InviteMemberDialog, Member } from '@/components/Members';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, UserPlus, Filter } from 'lucide-react';

const Members: React.FC = () => {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [accessFilter, setAccessFilter] = useState('all');
  
  // Sample data - showing current user
  const [members, setMembers] = useState<Member[]>([
    {
      id: '1',
      name: 'Rixwan Riaz123',
      email: 'rixwan@example.com',
      accessRights: 'Organization Owner',
      status: 'active',
      workHours: 0,
      cost: 0,
    },
  ]);

  const handleInviteMember = (newMember: Omit<Member, 'id' | 'workHours' | 'cost'>) => {
    const member: Member = {
      ...newMember,
      id: String(Date.now()),
      workHours: 0,
      cost: 0,
    };
    setMembers([...members, member]);
  };

  // For demonstration, show empty state when no members (except during initial render)
  const displayMembers = members.length === 1 ? [] : members;

  const filteredMembers = displayMembers.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    const matchesAccess = accessFilter === 'all' || member.accessRights === accessFilter;
    
    return matchesSearch && matchesStatus && matchesAccess;
  });

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-950 text-white">
        {/* Top Navigation Tabs */}
        <div className="border-b border-gray-800 bg-gray-900">
          <div className="px-8">
            <nav className="flex gap-6 items-center">
              <button className="px-4 py-4 text-sm font-medium text-gray-400 hover:text-white transition-colors">
                Organization
              </button>
              <button className="px-4 py-4 text-sm font-medium text-gray-400 hover:text-white transition-colors">
                Workspaces
              </button>
              <button className="px-4 py-4 text-sm font-medium text-white border-b-2 border-purple-500">
                Members
              </button>
              <button className="px-4 py-4 text-sm font-medium text-gray-400 hover:text-white transition-colors">
                Groups
              </button>
              <button className="px-4 py-4 text-sm font-medium text-gray-400 hover:text-white transition-colors">
                Settings
              </button>
              <button className="px-4 py-4 text-sm font-medium text-gray-400 hover:text-white transition-colors">
                Subscription
              </button>
              <button className="px-4 py-4 text-sm font-medium text-gray-400 hover:text-white transition-colors">
                Audit Log
              </button>
              
              {/* Invite Button - Right Aligned */}
              <div className="ml-auto">
                <Button
                  onClick={() => setInviteDialogOpen(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite members
                </Button>
              </div>
            </nav>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="px-8 py-6 space-y-6">
          <div className="flex items-center gap-4">
            {/* Show Status Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Show</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] bg-gray-900 border-gray-800 text-white h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="all" className="text-gray-300">All</SelectItem>
                  <SelectItem value="active" className="text-gray-300">Active</SelectItem>
                  <SelectItem value="inactive" className="text-gray-300">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filters Label */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Filters:
              </span>
            </div>

            {/* Access Filter */}
            <Button
              variant="outline"
              className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 h-9"
            >
              <Filter className="w-3 h-3 mr-2" />
              Access
            </Button>

            {/* Search - Right Aligned */}
            <div className="ml-auto relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search members..."
                className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 pl-10 h-9"
              />
            </div>
          </div>

          {/* Members Table */}
          <MembersTable
            members={filteredMembers}
          />
        </div>

        {/* Invite Member Dialog */}
        <InviteMemberDialog
          open={inviteDialogOpen}
          onOpenChange={setInviteDialogOpen}
          onInviteMember={handleInviteMember}
        />
      </div>
    </MainLayout>
  );
};

export default Members;

