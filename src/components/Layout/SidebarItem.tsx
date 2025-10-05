import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
  item: {
    icon: LucideIcon;
    label: string;
    beta?: boolean;
    path: string;
  };
  isActive: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ item, isActive, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group ${
        isActive 
          ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25' 
          : 'hover:bg-gray-800 text-gray-300 hover:text-white'
      }`}>
      <item.icon className={`w-5 h-5 transition-colors ${
        isActive 
          ? 'text-white' 
          : 'text-gray-400 group-hover:text-gray-300'
      }`} />
      <span className="ml-3 flex items-center">
        {item.label}
        {item.beta && (
          <span className="ml-2 text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full font-medium">
            BETA
          </span>
        )}
      </span>
    </div>
  );
};

export default SidebarItem;
