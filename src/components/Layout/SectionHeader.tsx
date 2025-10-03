import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  isCollapsed?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  expanded, 
  onToggle, 
  isCollapsed = false 
}) => {
  if (isCollapsed) return null;
  
  return (
    <div 
      className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase cursor-pointer flex items-center justify-between hover:text-gray-400 transition-colors"
      onClick={onToggle}
    >
      <span>{title}</span>
      <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? '' : '-rotate-90'}`} />
    </div>
  );
};

export default SectionHeader;
