# User Profile Management System

This document describes the implementation of the user profile management system with permission-based conditional UI rendering.

## Overview

The user profile system provides:
- User profile viewing and editing
- Permission-based conditional UI rendering
- Integration with the existing Redux store
- Clean, maintainable code architecture

## Components

### 1. API Integration (`src/redux/api/auth.ts`)

Updated to include user profile endpoints:
- `getUserProfile()` - Fetch current user profile
- `updateUserProfile(data)` - Update user profile
- `getUserPermissions()` - Fetch user permissions

**Types:**
```typescript
interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  email_verified: boolean;
  is_superuser: boolean;
  organization_id?: string;
  preferred_locale?: string;
  profile_picture_url?: string;
}

interface UpdateUserProfileRequest {
  full_name?: string;
  preferred_locale?: string;
  profile_picture_url?: string;
}

interface UserPermissions {
  permissions: string[];
}
```

### 2. Redux State Management (`src/redux/slice/authSlice.ts`)

Enhanced auth slice with:
- User profile state management
- Permission state management
- Async thunks for profile operations
- Loading states for better UX

**New State Fields:**
```typescript
interface AuthState {
  // ... existing fields
  user?: UserProfile;
  permissions?: string[];
  profileLoading: boolean;
  permissionsLoading: boolean;
}
```

**New Async Thunks:**
- `fetchUserProfile()` - Load user profile
- `updateUserProfile(data)` - Update user profile
- `fetchUserPermissions()` - Load user permissions

### 3. Permission System (`src/hooks/usePermissions.ts`)

Custom hook for permission management:

```typescript
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
} = usePermissions();
```

**Methods:**
- `hasPermission(permission)` - Check single permission
- `hasAnyPermission(permissions[])` - Check if user has any permission
- `hasAllPermissions(permissions[])` - Check if user has all permissions
- `isSuperUser()` - Check if user has wildcard permission
- Specific permission checks for common operations

### 4. Permission Gate Component (`src/components/ui/PermissionGate.tsx`)

Conditional rendering component:

```typescript
<PermissionGate 
  permission="projects:write"
  fallback={<div>Access denied</div>}
>
  <Button>Create Project</Button>
</PermissionGate>

<PermissionGate 
  permissions={["projects:read", "projects:write"]}
  requireAll={true}
>
  <Button>Full Project Access</Button>
</PermissionGate>
```

**Props:**
- `permission` - Single permission to check
- `permissions` - Array of permissions to check
- `requireAll` - Require all permissions (default: false)
- `fallback` - Component to show when permission denied
- `showLoading` - Show loading state (default: true)

### 5. User Profile Page (`src/pages/UserProfile.tsx`)

Complete user profile management page with:
- Profile viewing with avatar
- Inline editing capabilities
- Permission-based edit access
- Account information display
- Loading and error states

**Features:**
- Click-to-edit interface
- Form validation
- Success/error notifications
- Responsive design
- Permission-based UI elements

### 6. Navigation Integration (`src/components/Layout/Sidebar.tsx`)

Updated sidebar with:
- Clickable profile section
- Navigation to profile page
- Updated user data structure
- Improved user display

## Usage Examples

### Basic Permission Checking

```typescript
import { usePermissions } from '@/hooks/usePermissions';

const MyComponent = () => {
  const { 
    hasPermission, 
    canWriteProjects, 
    canAdminTime, 
    canManageOrg,
    isAdmin,
    isFreelancer 
  } = usePermissions();
  
  return (
    <div>
      {hasPermission('projects:write') && (
        <Button>Create Project</Button>
      )}
      
      {canWriteProjects() && (
        <Button>Edit Project</Button>
      )}
      
      {canAdminTime() && (
        <Button variant="outline">Approve Time</Button>
      )}
      
      {canManageOrg() && (
        <Button variant="destructive">Manage Organization</Button>
      )}
      
      {isAdmin() && (
        <div>Admin Panel</div>
      )}
      
      {isFreelancer() && (
        <div>Freelancer Dashboard</div>
      )}
    </div>
  );
};
```

### Conditional Rendering with PermissionGate

```typescript
import PermissionGate from '@/components/ui/PermissionGate';

const ProjectActions = () => {
  return (
    <div>
      <PermissionGate permission="projects:read">
        <Button variant="outline">View Projects</Button>
      </PermissionGate>
      
      <PermissionGate permission="projects:write">
        <Button>Create Project</Button>
      </PermissionGate>
      
      <PermissionGate permission="time:admin">
        <Button variant="outline">Approve Time</Button>
      </PermissionGate>
      
      <PermissionGate permission="org:manage">
        <Button variant="destructive">Manage Organization</Button>
      </PermissionGate>
      
      <PermissionGate 
        permissions={["finance:read", "finance:write"]}
        requireAll={true}
        fallback={<div>Finance access required</div>}
      >
        <Button variant="secondary">Finance Management</Button>
      </PermissionGate>
    </div>
  );
};
```

### Profile Management

```typescript
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserProfile, updateUserProfile } from '@/redux/slice/authSlice';

const ProfileComponent = () => {
  const dispatch = useDispatch();
  const { user, profileLoading } = useSelector(state => state.auth);
  
  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);
  
  const handleUpdate = async (data) => {
    try {
      await dispatch(updateUserProfile(data)).unwrap();
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Update failed');
    }
  };
  
  return (
    <div>
      {profileLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <h1>{user?.full_name || 'No name'}</h1>
          <p>{user?.email}</p>
        </div>
      )}
    </div>
  );
};
```

## Permission Types

Based on the API documentation, the system supports:

### Wildcard Permission
- `["*"]` - Full access (super users, owners)

### Specific Permissions

**Owner/Super User:**
- `["*"]` - Full access to everything

**Admin:**
- `finance:read` - Read finance data
- `finance:write` - Write finance data
- `invites:manage` - Manage organization invites
- `org:manage` - Manage organization settings
- `projects:read` - Read projects
- `projects:write` - Write projects
- `tasks:read` - Read tasks
- `tasks:write` - Write tasks
- `time:admin` - Admin time entries (approve, adjust)
- `time:read` - Read time entries
- `time:write` - Write time entries
- `users:profile:update:any` - Update any user's profile
- `users:profile:update:self` - Update own profile

**Freelancer:**
- `projects:read` - Read projects
- `tasks:read` - Read tasks
- `tasks:write` - Write tasks
- `time:read` - Read time entries
- `time:write` - Write time entries
- `users:profile:update:self` - Update own profile

## API Endpoints

The system integrates with these endpoints:

- `GET /api/v1/users/me` - Get current user profile
- `PATCH /api/v1/users/me` - Update user profile
- `GET /api/v1/users/me/permissions` - Get user permissions

## Error Handling

The system includes comprehensive error handling:
- API error messages
- Loading states
- Fallback UI components
- Toast notifications for user feedback

## Best Practices

1. **Always check permissions before showing UI elements**
2. **Use PermissionGate for conditional rendering**
3. **Provide meaningful fallbacks for restricted content**
4. **Handle loading states gracefully**
5. **Use specific permission checks when possible**
6. **Test with different permission sets**

## Testing

The system is designed to be easily testable:
- Mock permission states
- Test conditional rendering
- Verify API integration
- Test error scenarios

## Future Enhancements

Potential improvements:
- Role-based UI themes
- Advanced permission inheritance
- Permission caching
- Real-time permission updates
- Permission analytics
