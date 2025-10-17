import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { getOrgIdFromToken } from '@/lib/jwt';
import { getOrganization } from '@/redux/slice/organizationSlice';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Clock,
  BarChart3,
  CheckSquare,
  FolderOpen,
  Users,
  UsersRound,
  FileText,
  Tag,
  Target,
  Link,
  Settings,
  CreditCard,
  Building,
  Terminal,
  DollarSign
} from 'lucide-react';
import SidebarItem from './SidebarItem';
import SectionHeader from './SectionHeader';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  activeItem?: string;
  onNavigate?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isCollapsed, 
  setIsCollapsed, 
  activeItem = 'Timer',
  onNavigate
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

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  // Get user and organization data from Redux
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentOrganization } = useSelector((state: RootState) => state.organization);

  // Fetch organization details on mount using org ID from token
  useEffect(() => {
    const orgId = getOrgIdFromToken();
    if (orgId && !currentOrganization) {
      dispatch(getOrganization(orgId));
    }
  }, [dispatch, currentOrganization]);

  // Helper function to get user initials
  const getUserInitials = () => {
    if (!user) return 'U';
    const firstInitial = user.first_name?.charAt(0)?.toUpperCase() || '';
    const lastInitial = user.last_name?.charAt(0)?.toUpperCase() || '';
    return firstInitial + lastInitial || user.email?.charAt(0)?.toUpperCase() || 'U';
  };

  // Helper function to get user display name
  const getUserDisplayName = () => {
    if (!user) return 'User';
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return user.email || 'User';
  };

  // Helper function to get organization display name (truncated)
  const getOrganizationDisplayName = () => {
    if (!currentOrganization?.name) return 'Workspace';
    const orgName = currentOrganization.name.toUpperCase();
    // Truncate if too long
    return orgName.length > 20 ? orgName.substring(0, 17) + '...' : orgName;
  };

  const sidebarItems = {
    track: [
      { icon: Clock, label: 'Timer', path: '/timer' }
    ],
    analyze: [
      { icon: BarChart3, label: 'Reports', path: '/reports' },
      // { icon: CheckSquare, label: 'Approvals', path: '/approvals' }
    ],
    manage: [
      { icon: FolderOpen, label: 'Projects', path: '/projects' },
      // { icon: Users, label: 'Clients', path: '/clients' },
      { icon: UsersRound, label: 'Members', path: '/organization?tab=members' },
      { icon: DollarSign, label: 'Billable rates', path: '/billable-rates' },
      { icon: FileText, label: 'Invoices', path: '/invoices' },
      // { icon: Tag, label: 'Tags', path: '/tags' },
      // { icon: Target, label: 'Goals', beta: true, path: '/goals' },
      // { icon: Link, label: 'Integrations', path: '/integrations' }
    ],
    admin: [
      // { icon: CreditCard, label: 'Subscription', path: '/subscription' },
      { icon: Building, label: 'Organization', path: '/organization' },
      { icon: Settings, label: 'Settings', path: '/settings' },
      { icon: Terminal, label: 'Admin Console', path: '/admin-console' }
    ]
  };

  // Determine active item based on current route
  const getActiveLabel = () => {
    const allItems = [
      ...sidebarItems.track,
      ...sidebarItems.analyze,
      ...sidebarItems.manage,
      ...sidebarItems.admin
    ];
    const currentItem = allItems.find(item => item.path === location.pathname);
    return currentItem?.label || activeItem;
  };

  const currentActiveItem = getActiveLabel();

  const handleNavigate = (path: string) => {
    navigate(path);
    onNavigate?.(); // Close mobile menu if provided
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-gray-950 border-r border-gray-800 transition-all duration-300 flex flex-col h-full`}>
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
                <div className="text-xs text-gray-400 truncate">{getOrganizationDisplayName()}</div>
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
            <SidebarItem 
              key={idx} 
              item={item} 
              isActive={item.label === currentActiveItem} 
              onClick={() => handleNavigate(item.path)}
            />
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
            <SidebarItem 
              key={idx} 
              item={item} 
              isActive={item.label === currentActiveItem} 
              onClick={() => handleNavigate(item.path)}
            />
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
            <SidebarItem 
              key={idx} 
              item={item} 
              isActive={item.label === currentActiveItem} 
              onClick={() => handleNavigate(item.path)}
            />
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
            <SidebarItem 
              key={idx} 
              item={item} 
              isActive={item.label === currentActiveItem} 
              onClick={() => handleNavigate(item.path)}
            />
          ))}
        </div>
      </div>

      {/* Sidebar Toggle & Profile */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
              {getUserInitials()}
            </div>
            {!isCollapsed && <span className="ml-3 text-sm font-medium text-gray-300">{getUserDisplayName()}</span>}
          </div>
          {/* Only show collapse button when not on mobile (when onNavigate is not provided) */}
          {!onNavigate && (
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)} 
              className="text-gray-400 hover:text-gray-200 transition-colors p-1 hover:bg-gray-800 rounded-lg"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
