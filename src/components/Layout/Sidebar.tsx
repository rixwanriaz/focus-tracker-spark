import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Clock,
  BarChart3,
  CheckSquare,
  FolderOpen,
  Users,
  FileText,
  Tag,
  Target,
  Link,
  Settings,
  CreditCard,
  Building,
  Terminal
} from 'lucide-react';
import SidebarItem from './SidebarItem';
import SectionHeader from './SectionHeader';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  activeItem?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isCollapsed, 
  setIsCollapsed, 
  activeItem = 'Timer' 
}) => {
  const [expandedSections, setExpandedSections] = useState({
    analyze: true,
    manage: true,
    admin: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const sidebarItems = {
    track: [
      { icon: Clock, label: 'Timer' }
    ],
    analyze: [
      { icon: BarChart3, label: 'Reports' },
      { icon: CheckSquare, label: 'Approvals' }
    ],
    manage: [
      { icon: FolderOpen, label: 'Projects' },
      { icon: Users, label: 'Clients' },
      { icon: FileText, label: 'Invoices' },
      { icon: Tag, label: 'Tags' },
      { icon: Target, label: 'Goals', beta: true },
      { icon: Link, label: 'Integrations' }
    ],
    admin: [
      { icon: CreditCard, label: 'Subscription' },
      { icon: Building, label: 'Organization' },
      { icon: Settings, label: 'Settings' },
      { icon: Terminal, label: 'Admin Console' }
    ]
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-gray-950 border-r border-gray-800 transition-all duration-300 flex flex-col`}>
      {/* Logo/Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <Clock className="w-4 h-4 text-white" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-white">Workspace</div>
                <div className="text-xs text-gray-400 truncate">RIZWAN RIAZ123'S O...</div>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <ChevronDown className="w-4 h-4 text-gray-500 cursor-pointer hover:text-gray-300 transition-colors" />
          )}
        </div>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Track Section */}
        <div className="p-2">
          {!isCollapsed && (
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Track</div>
          )}
          {sidebarItems.track.map((item, idx) => (
            <SidebarItem key={idx} item={item} isActive={item.label === activeItem} />
          ))}
        </div>

        {/* Analyze Section */}
        <div className="p-2">
          <SectionHeader 
            title="Analyze" 
            expanded={expandedSections.analyze} 
            onToggle={() => toggleSection('analyze')}
            isCollapsed={isCollapsed}
          />
          {expandedSections.analyze && sidebarItems.analyze.map((item, idx) => (
            <SidebarItem key={idx} item={item} isActive={item.label === activeItem} />
          ))}
        </div>

        {/* Manage Section */}
        <div className="p-2">
          <SectionHeader 
            title="Manage" 
            expanded={expandedSections.manage} 
            onToggle={() => toggleSection('manage')}
            isCollapsed={isCollapsed}
          />
          {expandedSections.manage && sidebarItems.manage.map((item, idx) => (
            <SidebarItem key={idx} item={item} isActive={item.label === activeItem} />
          ))}
        </div>

        {/* Show More */}
        {!isCollapsed && expandedSections.manage && (
          <div className="px-5 py-2">
            <button className="text-gray-500 text-sm hover:text-gray-300 flex items-center transition-colors group">
              <ChevronDown className="w-3 h-3 mr-2 group-hover:text-gray-300" />
              Show more
            </button>
          </div>
        )}

        {/* Admin Section */}
        <div className="p-2">
          {!isCollapsed && (
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</div>
          )}
          {sidebarItems.admin.map((item, idx) => (
            <SidebarItem key={idx} item={item} isActive={item.label === activeItem} />
          ))}
        </div>
      </div>

      {/* Sidebar Toggle & Profile */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
              R
            </div>
            {!isCollapsed && <span className="ml-3 text-sm font-medium text-gray-300">PROFILE</span>}
          </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="text-gray-400 hover:text-gray-200 transition-colors p-1 hover:bg-gray-800 rounded-lg"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
