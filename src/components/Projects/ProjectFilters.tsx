import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ProjectFiltersProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const ProjectFilters: React.FC<ProjectFiltersProps> = ({
  searchQuery = '',
  onSearchChange,
}) => {
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
    </div>
  );
};

