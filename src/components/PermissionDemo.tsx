import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { usePermissions } from '@/hooks/usePermissions';
import PermissionGate from '@/components/ui/PermissionGate';
import { 
  Shield, 
  User, 
  FolderOpen, 
  CheckSquare, 
  Clock, 
  Settings,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

/**
 * Demo component showcasing permission-based UI rendering
 * This component demonstrates how to use the permission system
 */
const PermissionDemo: React.FC = () => {
  const {
    permissions,
    permissionsLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isSuperUser,
    canUpdateProfile,
    canReadProjects,
    canWriteProjects,
    canReadTasks,
    canWriteTasks,
    canReadTime,
    canWriteTime,
    canAdminTime,
    canReadFinance,
    canWriteFinance,
    canManageInvites,
    canManageOrg,
    canUpdateAnyProfile,
    isAdmin,
    isFreelancer,
  } = usePermissions();

  if (permissionsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Permission System Demo</h1>
        <p className="text-muted-foreground">
          This component demonstrates how to use the permission-based UI system
        </p>
      </div>

      {/* Current Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Current Permissions</span>
          </CardTitle>
          <CardDescription>
            Your current permission set and status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Permission Array:</h4>
            <div className="flex flex-wrap gap-2">
              {permissions?.map((permission, index) => (
                <Badge key={index} variant="secondary">
                  {permission}
                </Badge>
              )) || <Badge variant="outline">No permissions loaded</Badge>}
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {isSuperUser() ? '✓' : '✗'}
              </div>
              <div className="text-sm text-muted-foreground">Owner/Super User</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {isAdmin() ? '✓' : '✗'}
              </div>
              <div className="text-sm text-muted-foreground">Admin</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {isFreelancer() ? '✓' : '✗'}
              </div>
              <div className="text-sm text-muted-foreground">Freelancer</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {canUpdateProfile() ? '✓' : '✗'}
              </div>
              <div className="text-sm text-muted-foreground">Update Profile</div>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {canReadProjects() ? '✓' : '✗'}
              </div>
              <div className="text-sm text-muted-foreground">Read Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {canWriteProjects() ? '✓' : '✗'}
              </div>
              <div className="text-sm text-muted-foreground">Write Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {canAdminTime() ? '✓' : '✗'}
              </div>
              <div className="text-sm text-muted-foreground">Admin Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {canManageOrg() ? '✓' : '✗'}
              </div>
              <div className="text-sm text-muted-foreground">Manage Org</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permission Gates Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Gates Examples</CardTitle>
          <CardDescription>
            Components that show/hide based on permissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Single Permission Check */}
          <div>
            <h4 className="font-medium mb-2">Single Permission Check:</h4>
            <PermissionGate permission="projects:read">
              <Button variant="outline" className="mr-2">
                <Eye className="mr-2 h-4 w-4" />
                View Projects
              </Button>
            </PermissionGate>
            <PermissionGate permission="projects:write">
              <Button variant="outline" className="mr-2">
                <Edit className="mr-2 h-4 w-4" />
                Edit Projects
              </Button>
            </PermissionGate>
            <PermissionGate permission="projects:delete">
              <Button variant="destructive" className="mr-2">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Projects
              </Button>
            </PermissionGate>
          </div>

          <Separator />

          {/* Multiple Permissions (Any) */}
          <div>
            <h4 className="font-medium mb-2">Multiple Permissions (Any):</h4>
            <PermissionGate permissions={["projects:write", "projects:delete"]}>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Project Management
              </Button>
            </PermissionGate>
            <p className="text-sm text-muted-foreground mt-1">
              Shows if user has ANY of: projects:write OR projects:delete
            </p>
          </div>

          <Separator />

          {/* Multiple Permissions (All) */}
          <div>
            <h4 className="font-medium mb-2">Multiple Permissions (All):</h4>
            <PermissionGate permissions={["projects:read", "projects:write"]} requireAll>
              <Button variant="outline">
                <FolderOpen className="mr-2 h-4 w-4" />
                Full Project Access
              </Button>
            </PermissionGate>
            <p className="text-sm text-muted-foreground mt-1">
              Shows if user has ALL of: projects:read AND projects:write
            </p>
          </div>

          <Separator />

          {/* Custom Fallback */}
          <div>
            <h4 className="font-medium mb-2">Custom Fallback:</h4>
            <PermissionGate 
              permission="admin:access" 
              fallback={
                <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">
                    Admin access required
                  </p>
                </div>
              }
            >
              <Button variant="outline">
                <Shield className="mr-2 h-4 w-4" />
                Admin Panel
              </Button>
            </PermissionGate>
          </div>
        </CardContent>
      </Card>

      {/* Feature Access Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Access Matrix</CardTitle>
          <CardDescription>
            Overview of what features are accessible based on permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Profile Management</h4>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm">View Profile</span>
                  <Badge variant={canUpdateProfile() ? "default" : "secondary"}>
                    {canUpdateProfile() ? "Allowed" : "Restricted"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Edit Profile</span>
                  <Badge variant={canUpdateProfile() ? "default" : "secondary"}>
                    {canUpdateProfile() ? "Allowed" : "Restricted"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Project Management</h4>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm">View Projects</span>
                  <Badge variant={canReadProjects() ? "default" : "secondary"}>
                    {canReadProjects() ? "Allowed" : "Restricted"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Create Projects</span>
                  <Badge variant={canWriteProjects() ? "default" : "secondary"}>
                    {canWriteProjects() ? "Allowed" : "Restricted"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Task Management</h4>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm">View Tasks</span>
                  <Badge variant={canReadTasks() ? "default" : "secondary"}>
                    {canReadTasks() ? "Allowed" : "Restricted"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Create Tasks</span>
                  <Badge variant={canWriteTasks() ? "default" : "secondary"}>
                    {canWriteTasks() ? "Allowed" : "Restricted"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Time Tracking</h4>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm">View Time</span>
                  <Badge variant={canReadTime() ? "default" : "secondary"}>
                    {canReadTime() ? "Allowed" : "Restricted"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Log Time</span>
                  <Badge variant={canWriteTime() ? "default" : "secondary"}>
                    {canWriteTime() ? "Allowed" : "Restricted"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Admin Time</span>
                  <Badge variant={canAdminTime() ? "default" : "secondary"}>
                    {canAdminTime() ? "Allowed" : "Restricted"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Finance Management</h4>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm">View Finance</span>
                  <Badge variant={canReadFinance() ? "default" : "secondary"}>
                    {canReadFinance() ? "Allowed" : "Restricted"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Manage Finance</span>
                  <Badge variant={canWriteFinance() ? "default" : "secondary"}>
                    {canWriteFinance() ? "Allowed" : "Restricted"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Organization Management</h4>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Manage Organization</span>
                  <Badge variant={canManageOrg() ? "default" : "secondary"}>
                    {canManageOrg() ? "Allowed" : "Restricted"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Manage Invites</span>
                  <Badge variant={canManageInvites() ? "default" : "secondary"}>
                    {canManageInvites() ? "Allowed" : "Restricted"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Update Any Profile</span>
                  <Badge variant={canUpdateAnyProfile() ? "default" : "secondary"}>
                    {canUpdateAnyProfile() ? "Allowed" : "Restricted"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionDemo;
