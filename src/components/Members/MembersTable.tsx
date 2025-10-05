import React, { useState } from 'react';
import { ArrowUpDown, MoreVertical } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface Member {
  id: string;
  name: string;
  email: string;
  rate?: number;
  cost?: number;
  workHours?: number;
  accessRights: string;
  groups?: string[];
  avatar?: string;
  status: 'active' | 'inactive';
}

interface MembersTableProps {
  members: Member[];
  onMemberSelect?: (memberId: string) => void;
  selectedMembers?: string[];
}

type SortField = 'name' | 'rate' | 'cost' | 'workHours';
type SortDirection = 'asc' | 'desc';

export const MembersTable: React.FC<MembersTableProps> = ({
  members,
  onMemberSelect,
  selectedMembers = [],
}) => {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedMembers = [...members].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'rate':
        comparison = (a.rate || 0) - (b.rate || 0);
        break;
      case 'cost':
        comparison = (a.cost || 0) - (b.cost || 0);
        break;
      case 'workHours':
        comparison = (a.workHours || 0) - (b.workHours || 0);
        break;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (members.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-950 border-b border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          <div className="col-span-3 flex items-center gap-2">
            <ArrowUpDown className="h-3 w-3" />
            NAME
          </div>
          <div className="col-span-2">RATE</div>
          <div className="col-span-2">COST</div>
          <div className="col-span-2">WORK HOURS</div>
          <div className="col-span-2 flex items-center gap-1">
            ACCESS RIGHTS
            <div className="w-4 h-4 rounded-full bg-gray-700 flex items-center justify-center text-[10px]">
              i
            </div>
          </div>
          <div className="col-span-1">GROUPS</div>
        </div>

        {/* Empty State */}
        <div className="px-6 py-20 text-center">
          <div className="flex justify-center mb-8">
            <svg width="180" height="140" viewBox="0 0 180 140" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Left person */}
              <ellipse cx="50" cy="90" rx="20" ry="25" fill="#6B5B95" />
              <circle cx="50" cy="55" r="18" fill="#C4A57B" />
              
              {/* Middle person */}
              <ellipse cx="90" cy="95" rx="22" ry="28" fill="#6B5B95" />
              <circle cx="90" cy="58" r="20" fill="#D4A574" />
              
              {/* Right person */}
              <ellipse cx="130" cy="90" rx="20" ry="25" fill="#6B5B95" />
              <circle cx="130" cy="55" r="18" fill="#E4A0C7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Invite more members to this Organization
          </h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Use this page to invite more users to your workspace
            <br />
            and later manage their access rights.
          </p>
          <div className="flex flex-col items-center gap-4">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Invite members
            </Button>
            <button className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                <line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
              Book a demo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-950 border-b border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        <div className="col-span-3 flex items-center gap-2">
          <button
            onClick={() => handleSort('name')}
            className="flex items-center gap-1 hover:text-gray-300 transition-colors"
          >
            <ArrowUpDown className="h-3 w-3" />
            NAME
          </button>
        </div>
        
        <div className="col-span-2 flex items-center gap-2">
          <button
            onClick={() => handleSort('rate')}
            className="flex items-center gap-1 hover:text-gray-300 transition-colors"
          >
            RATE
          </button>
        </div>
        
        <div className="col-span-2 flex items-center gap-2">
          <button
            onClick={() => handleSort('cost')}
            className="flex items-center gap-1 hover:text-gray-300 transition-colors"
          >
            COST
          </button>
        </div>
        
        <div className="col-span-2 flex items-center gap-2">
          <button
            onClick={() => handleSort('workHours')}
            className="flex items-center gap-1 hover:text-gray-300 transition-colors"
          >
            WORK HOURS
          </button>
        </div>
        
        <div className="col-span-2 flex items-center gap-1">
          ACCESS RIGHTS
          <div className="w-4 h-4 rounded-full bg-gray-700 flex items-center justify-center text-[10px] cursor-help">
            i
          </div>
        </div>
        
        <div className="col-span-1">GROUPS</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-800">
        {sortedMembers.map((member) => (
          <div
            key={member.id}
            className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-800/50 transition-colors"
          >
            <div className="col-span-3 flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-purple-600 text-white text-xs">
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="text-sm text-white font-medium truncate">
                  {member.name}
                </div>
              </div>
            </div>
            
            <div className="col-span-2 flex items-center text-sm text-gray-400">
              {member.rate ? `$${member.rate}/h` : '-'}
            </div>
            
            <div className="col-span-2 flex items-center text-sm text-gray-400">
              {member.cost ? `$${member.cost}` : '-'}
            </div>
            
            <div className="col-span-2 flex items-center text-sm text-white">
              {member.workHours ? `${member.workHours} h` : '-'}
            </div>
            
            <div className="col-span-2 flex items-center">
              <Badge 
                variant="secondary" 
                className="bg-gray-800 text-gray-300 hover:bg-gray-800 border-0 px-3 py-1"
              >
                {member.accessRights}
              </Badge>
            </div>
            
            <div className="col-span-1 flex items-center justify-between">
              <span className="text-sm text-gray-400">
                {member.groups && member.groups.length > 0 ? member.groups.length : '-'}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-white"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                  <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-700">
                    Edit member
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-700">
                    Change access
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-700">
                    Remove member
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

