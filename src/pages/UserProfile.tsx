import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { fetchUserProfile, updateUserProfile, logoutUser, logout } from '@/redux/slice/authSlice';
import { MainLayout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit, Save, X, User, Mail, Shield, Building, Copy, Check, Loader2, Camera, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/usePermissions';
import PermissionGate from '@/components/ui/PermissionGate';
import { getUserRolesFromToken } from '@/lib/jwt';

const UserProfile: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, profileLoading, error, refreshToken } = useAppSelector((state) => ({
    user: state.auth.user,
    profileLoading: state.auth.profileLoading,
    error: state.auth.error,
    refreshToken: state.auth.refreshToken,
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
  const [copiedId, setCopiedId] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [loggingOut, setLoggingOut] = useState(false);
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

  // Load roles from token
  useEffect(() => {
    const roles = getUserRolesFromToken();
    setUserRoles(roles);
  }, [user]);

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

  const handleCopyId = async () => {
    if (user?.id) {
      try {
        await navigator.clipboard.writeText(user.id);
        setCopiedId(true);
        toast.success('User ID copied to clipboard');
        setTimeout(() => setCopiedId(false), 2000);
      } catch (err) {
        toast.error('Failed to copy User ID');
      }
    }
  };

  const handleLogout = async () => {
    if (!refreshToken) {
      // If no refresh token, just clear state and redirect
      dispatch(logout());
      navigate('/login');
      return;
    }

    try {
      setLoggingOut(true);
      await dispatch(logoutUser(refreshToken)).unwrap();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      // Even if API call fails, clear local state and redirect
      dispatch(logout());
      navigate('/login');
      toast.info('Logged out locally');
    } finally {
      setLoggingOut(false);
    }
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
    // Check if user is superuser from profile data
    if (user?.is_superuser) return 'Owner/Super User';
    
    // Check roles from token
    if (userRoles.includes('admin') || userRoles.includes('owner')) return 'Admin';
    if (userRoles.includes('freelancer')) return 'Freelancer';
    if (userRoles.includes('member')) return 'Member';
    
    // Fallback - capitalize first role or default to Member
    return userRoles.length > 0 
      ? userRoles[0].charAt(0).toUpperCase() + userRoles[0].slice(1) 
      : 'Member';
  };

  const getUserRoleColor = () => {
    // Check if user is superuser from profile data
    if (user?.is_superuser) return 'bg-purple-600';
    
    // Check roles from token
    if (userRoles.includes('admin') || userRoles.includes('owner')) return 'bg-blue-600';
    if (userRoles.includes('freelancer')) return 'bg-green-600';
    
    return 'bg-gray-600';
  };

  if (profileLoading && !user) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-950">
          <div className="px-6 py-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-800 rounded w-48"></div>
              <div className="h-64 bg-gray-900 rounded-lg border border-gray-800"></div>
              <div className="h-48 bg-gray-900 rounded-lg border border-gray-800"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="rounded-full bg-red-900/20 p-4">
              <User className="h-12 w-12 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-white">Failed to Load Profile</h3>
            <p className="text-gray-400">Unable to retrieve your profile information</p>
            <Button 
              onClick={() => dispatch(fetchUserProfile())} 
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Loader2 className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-950 text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-gray-800">
          <div>
            <h1 className="text-2xl font-bold text-white">Profile</h1>
            <p className="text-gray-400 text-sm mt-1">
              Manage your account settings and preferences
            </p>
          </div>
          <PermissionGate permission="users:profile:update:self">
            <Button
              onClick={() => setIsEditing(!isEditing)}
              disabled={profileLoading}
              className={isEditing 
                ? "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700" 
                : "bg-purple-600 hover:bg-purple-700 text-white"
              }
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
        <div className="px-6 py-6">
          <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            {/* Cover/Header with gradient */}
            <div className="h-24 bg-gradient-to-r from-purple-700 via-purple-500"></div>
            
            <div className="relative px-6 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-12">
                {/* Avatar */}
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-4 border-gray-900 shadow-xl">
                    <AvatarImage src={user.profile_picture_url || undefined} />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                      {getInitials(user.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 space-y-2 pb-2">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {user.full_name || 'No name set'}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Mail className="h-4 w-4" />
                        <span className="text-sm">{user.email}</span>
                      </div>
                      {user.email_verified && (
                        <Badge className="gap-1 bg-green-900/50 text-green-400 border-green-800 hover:bg-green-900/70">
                          <Check className="h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Role Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={`${getUserRoleColor()} text-white gap-1.5 px-3 py-1`}>
                      <Shield className="h-3.5 w-3.5" />
                      {getUserRole()}
                    </Badge>
                    
                    {/* Show additional roles if user has multiple */}
                    {userRoles.length > 1 && userRoles.slice(1).map((role, idx) => (
                      <Badge key={idx} className="gap-1.5 px-3 py-1 bg-gray-700 text-gray-200 border-gray-600">
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </Badge>
                    ))}
                    
                    {user.organization_id && (
                      <Badge className="gap-1.5 px-3 py-1 bg-gray-800 text-gray-300 border-gray-700">
                        <Building className="h-3.5 w-3.5" />
                        Organization Member
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          
            <div className="space-y-6 px-6 pb-6 border-t border-gray-800 pt-6">
              {/* Profile Form */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-500" />
                  <h3 className="text-lg font-semibold text-white">Personal Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-sm font-medium text-gray-400">
                      Full Name
                    </Label>
                    {isEditing ? (
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                        placeholder="Enter your full name"
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:ring-purple-500 focus:border-purple-500"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-800 rounded-md border border-gray-700">
                        <p className="text-sm text-white">
                          {user.full_name || 'No name set'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-400">
                      Email Address
                    </Label>
                    <div className="px-3 py-2 bg-gray-800 rounded-md border border-gray-700">
                      <p className="text-sm text-white">{user.email}</p>
                    </div>
                    <p className="text-xs text-gray-500 italic">
                      Email cannot be changed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferred_locale" className="text-sm font-medium text-gray-400">
                      Preferred Locale
                    </Label>
                    {isEditing ? (
                      <Input
                        id="preferred_locale"
                        value={formData.preferred_locale}
                        onChange={(e) => handleInputChange('preferred_locale', e.target.value)}
                        placeholder="e.g., en-US, es-ES"
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:ring-purple-500 focus:border-purple-500"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-800 rounded-md border border-gray-700">
                        <p className="text-sm text-white">
                          {user.preferred_locale || 'Not set'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profile_picture_url" className="text-sm font-medium text-gray-400">
                      Profile Picture URL
                    </Label>
                    {isEditing ? (
                      <Input
                        id="profile_picture_url"
                        value={formData.profile_picture_url}
                        onChange={(e) => handleInputChange('profile_picture_url', e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:ring-purple-500 focus:border-purple-500"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-800 rounded-md border border-gray-700">
                        <p className="text-sm text-white truncate">
                          {user.profile_picture_url || 'No profile picture'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-800">
                  <Button 
                    onClick={handleCancel}
                    className="sm:w-auto w-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={profileLoading}
                    className="sm:w-auto w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {profileLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="px-6 pb-6">
          <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-500" />
                <h3 className="text-lg font-semibold text-white">Account Details</h3>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Your account information and settings
              </p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email Verified */}
                <div className="space-y-2 p-4 rounded-lg bg-gray-800 border border-gray-700">
                  <Label className="text-sm font-medium text-gray-400">Email Status</Label>
                  <div className="flex items-center gap-2">
                    {user.email_verified ? (
                      <>
                        <div className="p-1 bg-green-900/30 rounded-full">
                          <Check className="h-4 w-4 text-green-500" />
                        </div>
                        <span className="text-sm font-medium text-green-400">Verified</span>
                      </>
                    ) : (
                      <>
                        <div className="p-1 bg-yellow-900/30 rounded-full">
                          <X className="h-4 w-4 text-yellow-500" />
                        </div>
                        <span className="text-sm font-medium text-yellow-400">Not Verified</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Organization */}
                <div className="space-y-2 p-4 rounded-lg bg-gray-800 border border-gray-700">
                  <Label className="text-sm font-medium text-gray-400">Organization</Label>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium text-white">
                      {user.organization_id ? 'Team Organization' : 'Individual Account'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Logout Section - Separate */}
              <div className="mt-6 pt-6 border-t border-gray-800">
                <Button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  variant="destructive"
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  {loggingOut ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging out...
                    </>
                  ) : (
                    <>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout from Account
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserProfile;
