import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useRef } from 'react';
import { RootState, AppDispatch } from '@/redux/store';
import { fetchUserPermissions } from '@/redux/slice/authSlice';

/**
 * Hook for managing user permissions and conditional UI rendering
 */
export const usePermissions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const hasFetchedPermissions = useRef(false);
  const { permissions, permissionsLoading, isAuthenticated } = useSelector(
    (state: RootState) => ({
      permissions: state.auth.permissions,
      permissionsLoading: state.auth.permissionsLoading,
      isAuthenticated: state.auth.isAuthenticated,
    })
  );

  // Fetch permissions when user is authenticated and permissions are not loaded
  useEffect(() => {
    if (isAuthenticated && !permissions && !permissionsLoading && !hasFetchedPermissions.current) {
      hasFetchedPermissions.current = true;
      dispatch(fetchUserPermissions());
    }
    
    // Reset the flag when user logs out
    if (!isAuthenticated) {
      hasFetchedPermissions.current = false;
    }
  }, [isAuthenticated, permissions, permissionsLoading]);

  /**
   * Check if user has a specific permission
   * @param permission - The permission to check (e.g., "projects:read", "tasks:write")
   * @returns boolean indicating if user has the permission
   */
  const hasPermission = (permission: string): boolean => {
    if (!permissions) return false;
    
    // Check for wildcard permission (full access)
    if (permissions.includes('*')) return true;
    
    // Check for specific permission
    return permissions.includes(permission);
  };

  /**
   * Check if user has any of the specified permissions
   * @param permissionList - Array of permissions to check
   * @returns boolean indicating if user has any of the permissions
   */
  const hasAnyPermission = (permissionList: string[]): boolean => {
    if (!permissions) return false;
    
    // Check for wildcard permission (full access)
    if (permissions.includes('*')) return true;
    
    // Check if any permission in the list is granted
    return permissionList.some(permission => permissions.includes(permission));
  };

  /**
   * Check if user has all of the specified permissions
   * @param permissionList - Array of permissions to check
   * @returns boolean indicating if user has all permissions
   */
  const hasAllPermissions = (permissionList: string[]): boolean => {
    if (!permissions) return false;
    
    // Check for wildcard permission (full access)
    if (permissions.includes('*')) return true;
    
    // Check if all permissions in the list are granted
    return permissionList.every(permission => permissions.includes(permission));
  };

  /**
   * Check if user is a superuser/admin
   * @returns boolean indicating if user is a superuser
   */
  const isSuperUser = (): boolean => {
    return hasPermission('*');
  };

  /**
   * Check if user can update their own profile
   * @returns boolean indicating if user can update their profile
   */
  const canUpdateProfile = (): boolean => {
    return hasPermission('users:profile:update:self');
  };

  /**
   * Check if user can read projects
   * @returns boolean indicating if user can read projects
   */
  const canReadProjects = (): boolean => {
    return hasPermission('projects:read');
  };

  /**
   * Check if user can write projects
   * @returns boolean indicating if user can write projects
   */
  const canWriteProjects = (): boolean => {
    return hasPermission('projects:write');
  };

  /**
   * Check if user can read tasks
   * @returns boolean indicating if user can read tasks
   */
  const canReadTasks = (): boolean => {
    return hasPermission('tasks:read');
  };

  /**
   * Check if user can write tasks
   * @returns boolean indicating if user can write tasks
   */
  const canWriteTasks = (): boolean => {
    return hasPermission('tasks:write');
  };

  /**
   * Check if user can read time entries
   * @returns boolean indicating if user can read time entries
   */
  const canReadTime = (): boolean => {
    return hasPermission('time:read');
  };

  /**
   * Check if user can write time entries
   * @returns boolean indicating if user can write time entries
   */
  const canWriteTime = (): boolean => {
    return hasPermission('time:write');
  };

  /**
   * Check if user can admin time entries (approve, adjust, etc.)
   * @returns boolean indicating if user can admin time entries
   */
  const canAdminTime = (): boolean => {
    return hasPermission('time:admin');
  };

  /**
   * Check if user can read finance data
   * @returns boolean indicating if user can read finance data
   */
  const canReadFinance = (): boolean => {
    return hasPermission('finance:read');
  };

  /**
   * Check if user can write finance data
   * @returns boolean indicating if user can write finance data
   */
  const canWriteFinance = (): boolean => {
    return hasPermission('finance:write');
  };

  /**
   * Check if user can manage invites
   * @returns boolean indicating if user can manage invites
   */
  const canManageInvites = (): boolean => {
    return hasPermission('invites:manage');
  };

  /**
   * Check if user can manage organization
   * @returns boolean indicating if user can manage organization
   */
  const canManageOrg = (): boolean => {
    return hasPermission('org:manage');
  };

  /**
   * Check if user can update any user's profile
   * @returns boolean indicating if user can update any profile
   */
  const canUpdateAnyProfile = (): boolean => {
    return hasPermission('users:profile:update:any');
  };

  /**
   * Check if user is an admin (has org management permissions)
   * @returns boolean indicating if user is an admin
   */
  const isAdmin = (): boolean => {
    return hasAnyPermission(['org:manage', 'invites:manage', 'users:profile:update:any']);
  };

  /**
   * Check if user is a freelancer (limited permissions)
   * @returns boolean indicating if user is a freelancer
   */
  const isFreelancer = (): boolean => {
    return hasAllPermissions(['projects:read', 'tasks:read', 'tasks:write', 'time:read', 'time:write', 'users:profile:update:self']) &&
           !hasAnyPermission(['org:manage', 'invites:manage', 'users:profile:update:any', 'finance:read', 'finance:write']);
  };

  return {
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
  };
};
