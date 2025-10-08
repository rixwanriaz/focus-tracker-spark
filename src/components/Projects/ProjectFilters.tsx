import React from 'react';
import { ChevronDown, User, Users, DollarSign, FileText, Layout, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ProjectFiltersProps {
  showArchived: boolean;
  onShowArchivedChange: (show: boolean) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  activeFilters?: {
    client?: string;
    member?: string;
    billable?: boolean;
    projectName?: string;
    template?: string;
  };
}

export const ProjectFilters: React.FC<ProjectFiltersProps> = ({
  showArchived,
  onShowArchivedChange,
  searchQuery = '',
  onSearchChange,
  activeFilters = {},
}) => {
  const filterOptions = [
    { key: 'all', label: 'Show All' },
    { key: 'all-except-archived', label: 'Show All, except Archived' },
    { key: 'active', label: 'Show Active only' },
    { key: 'archived', label: 'Show Archived only' },
  ];

  const currentFilter = showArchived ? 'all' : 'all-except-archived';

  return (
    <div className="flex items-center gap-4 px-6 py-4 bg-gray-950 border-b border-gray-800">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="pl-10 bg-gray-900 border-gray-800 text-gray-300 placeholder-gray-500 focus:border-purple-600 focus:ring-purple-600"
        />
      </div>

      {/* Show Filter Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            {filterOptions.find(opt => opt.key === currentFilter)?.label}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-gray-900 border-gray-800">
          {filterOptions.map((option) => (
            <DropdownMenuItem
              key={option.key}
              onClick={() => onShowArchivedChange(option.key === 'all')}
              className="text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Filters Label */}
      <span className="text-sm text-gray-500 uppercase font-semibold">Filters:</span>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          className={`bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white ${
            activeFilters.client ? 'border-purple-600 text-purple-400' : ''
          }`}
        >
          <User className="mr-2 h-4 w-4" />
          Client
        </Button>

        <Button
          variant="outline"
          size="sm"
          className={`bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white ${
            activeFilters.member ? 'border-purple-600 text-purple-400' : ''
          }`}
        >
          <Users className="mr-2 h-4 w-4" />
          Member
        </Button>

        <Button
          variant="outline"
          size="sm"
          className={`bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white ${
            activeFilters.billable !== undefined ? 'border-purple-600 text-purple-400' : ''
          }`}
        >
          <DollarSign className="mr-2 h-4 w-4" />
          Billable
        </Button>

        <Button
          variant="outline"
          size="sm"
          className={`bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white ${
            activeFilters.projectName ? 'border-purple-600 text-purple-400' : ''
          }`}
        >
          <FileText className="mr-2 h-4 w-4" />
          Project name
        </Button>

        <Button
          variant="outline"
          size="sm"
          className={`bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white ${
            activeFilters.template ? 'border-purple-600 text-purple-400' : ''
          }`}
        >
          <Layout className="mr-2 h-4 w-4" />
          Template
        </Button>
      </div>
    </div>
  );
};

