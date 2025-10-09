import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Folder, Users, UserCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RootState, AppDispatch } from '@/redux/store';
import { getOrganizationMembers } from '@/redux/slice/organizationSlice';

interface Workspace {
  id: string;
  name: string;
  admins: string[];
  members: number;
  groups: number;
}

const WorkspacesTab: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Get data from Redux store
  const { currentOrganization, members, loadingMembers } = useSelector(
    (state: RootState) => state.organization
  );
  const { user } = useSelector((state: RootState) => state.auth);

  // Load organization members when component mounts
  useEffect(() => {
    if (currentOrganization?.slug) {
      dispatch(getOrganizationMembers(currentOrganization.slug));
    }
  }, [dispatch, currentOrganization?.slug]);

  // Get current user's name
  const getCurrentUserName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    } else if (user?.first_name) {
      return user.first_name;
    } else if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Current User';
  };

  // Get admin members (you can customize this logic based on your role system)
  const getAdminMembers = () => {
    const currentUserName = getCurrentUserName();
    return [`${currentUserName} (you)`];
  };

  // Create workspace data from organization data
  const workspaces: Workspace[] = currentOrganization ? [
    {
      id: currentOrganization.slug,
      name: currentOrganization.name,
      admins: getAdminMembers(),
      members: members.length,
      groups: 0, // You can add groups logic later
    },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Workspaces Table */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-0">
          <div className="overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-3 gap-4 px-6 py-4 bg-gray-950 border-b border-gray-800">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase">
                <Folder className="h-4 w-4" />
                Name
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase">
                <UserCheck className="h-4 w-4" />
                Admins
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase">
                <Users className="h-4 w-4" />
                Members
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-800">
              {loadingMembers ? (
                <div className="px-6 py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading organization data...</p>
                </div>
              ) : workspaces.length > 0 ? (
                workspaces.map((workspace) => (
                  <div key={workspace.id} className="grid grid-cols-3 gap-4 px-6 py-4 hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                        <Folder className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-white font-medium">{workspace.name}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-300">
                      {workspace.admins.map((admin, index) => (
                        <span key={index}>
                          {admin}
                          {index < workspace.admins.length - 1 && ', '}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-300">
                      {workspace.members} member{workspace.members !== 1 ? 's' : ''}, {workspace.groups} group{workspace.groups !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center">
                  <Folder className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                  <p className="text-gray-400">No organization data available</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Membership Section */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Membership</h3>
          <Button 
            variant="destructive" 
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Leave & Close Organization
          </Button>
        </CardContent>
      </Card>

      {/* Enterprise Feature Promotion */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-8 text-center">
          {/* Illustration */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              {/* House illustration */}
              <div className="w-32 h-24 bg-gray-700 rounded-lg relative">
                {/* Geometric shapes inside house */}
                <div className="absolute top-2 left-2 w-4 h-4 bg-purple-500 rounded-sm"></div>
                <div className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full"></div>
                <div className="absolute bottom-2 left-2 w-5 h-5 bg-purple-400 transform rotate-45"></div>
                <div className="absolute bottom-2 right-2 w-3 h-3 bg-white rounded-sm"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-purple-300 rounded-full"></div>
              </div>
              
              {/* Person illustration */}
              <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
                <div className="w-8 h-12 bg-pink-500 rounded-full relative">
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-pink-400 rounded-full"></div>
                  <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-purple-500 rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-4">
            Manage multiple Workspaces under one Organization
          </h2>
          
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Control all the users, access rights and billing of multiple Workspaces under one central Organization with the Multiple Workspaces feature, available on our Enterprise plan. Learn more about Organizations or get in touch directly.
          </p>

          <div className="flex justify-center gap-4">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              Contact us
            </Button>
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              Learn more
            </Button>
          </div>

          {/* Feedback button */}
          <div className="absolute bottom-4 right-4">
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700">
              <span className="text-lg">😊</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { WorkspacesTab };
