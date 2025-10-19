import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionGateProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  showLoading?: boolean;
}

/**
 * Component for conditional rendering based on user permissions
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  showLoading = true,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, permissionsLoading } = usePermissions();

  // Show loading state if permissions are still being fetched
  if (permissionsLoading && showLoading) {
    return <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>;
  }

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions) {
    if (requireAll) {
      hasAccess = hasAllPermissions(permissions);
    } else {
      hasAccess = hasAnyPermission(permissions);
    }
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGate;
