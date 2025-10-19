import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { fetchUserProfile, updateUserProfile } from '@/redux/slice/authSlice';
import { MainLayout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit, Save, X, User, Mail, Shield, Building } from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/usePermissions';
import PermissionGate from '@/components/ui/PermissionGate';

const UserProfile: React.FC = () => {
  const dispatch = useDispatch();
  const { user, profileLoading, error } = useSelector((state: RootState) => ({
    user: state.auth.user,
    profileLoading: state.auth.profileLoading,
    error: state.auth.error,
  }));

  const { 
    canUpdateProfile, 
    isSuperUser, 
    isAdmin, 
    isFreelancer,
    canManageOrg,
    canReadFinance,
    canAdminTime
  } = usePermissions();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    preferred_locale: '',
    profile_picture_url: '',
  });

  // Load user profile on component mount
  useEffect(() => {
    if (!user) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, user]);

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        preferred_locale: user.preferred_locale || '',
        profile_picture_url: user.profile_picture_url || '',
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await dispatch(updateUserProfile(formData)).unwrap();
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        preferred_locale: user.preferred_locale || '',
        profile_picture_url: user.profile_picture_url || '',
      });
    }
    setIsEditing(false);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getUserRole = () => {
    if (isSuperUser()) return 'Owner/Super User';
    if (isAdmin()) return 'Admin';
    if (isFreelancer()) return 'Freelancer';
    return 'Member';
  };

  const getUserRoleColor = () => {
    if (isSuperUser()) return 'bg-purple-600';
    if (isAdmin()) return 'bg-blue-600';
    if (isFreelancer()) return 'bg-green-600';
    return 'bg-gray-600';
  };

  if (profileLoading && !user) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Failed to load user profile</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>
          <PermissionGate permission="users:profile:update:self">
            <Button
              variant={isEditing ? "outline" : "default"}
              onClick={() => setIsEditing(!isEditing)}
              disabled={profileLoading}
            >
              {isEditing ? (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </>
              )}
            </Button>
          </PermissionGate>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.profile_picture_url || undefined} />
                <AvatarFallback className="text-lg">
                  {getInitials(user.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <CardTitle className="text-2xl">
                  {user.full_name || 'No name set'}
                </CardTitle>
                <CardDescription className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                  {user.email_verified && (
                    <Badge variant="secondary" className="ml-2">
                      Verified
                    </Badge>
                  )}
                </CardDescription>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Shield className="h-4 w-4" />
                    <span>{getUserRole()}</span>
                  </div>
                  {user.organization_id && (
                    <div className="flex items-center space-x-1">
                      <Building className="h-4 w-4" />
                      <span>Organization Member</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Separator />
            
            {/* Profile Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {user.full_name || 'No name set'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <p className="text-sm text-muted-foreground">
                  {user.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferred_locale">Preferred Locale</Label>
                {isEditing ? (
                  <Input
                    id="preferred_locale"
                    value={formData.preferred_locale}
                    onChange={(e) => handleInputChange('preferred_locale', e.target.value)}
                    placeholder="e.g., en-US, es-ES"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {user.preferred_locale || 'Not set'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile_picture_url">Profile Picture URL</Label>
                {isEditing ? (
                  <Input
                    id="profile_picture_url"
                    value={formData.profile_picture_url}
                    onChange={(e) => handleInputChange('profile_picture_url', e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {user.profile_picture_url || 'No profile picture'}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={profileLoading}>
                  {profileLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Account Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">User ID</Label>
                <p className="text-sm text-muted-foreground font-mono">
                  {user.id}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Email Verified</Label>
                <p className="text-sm text-muted-foreground">
                  {user.email_verified ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">User Role</Label>
                <div className="flex items-center space-x-2">
                  <Badge className={getUserRoleColor()}>
                    {getUserRole()}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Organization</Label>
                <p className="text-sm text-muted-foreground">
                  {user.organization_id ? 'Team Organization' : 'Individual Account'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default UserProfile;
