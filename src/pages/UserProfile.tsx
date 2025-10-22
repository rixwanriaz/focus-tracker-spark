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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, Save, X, User, Mail, Shield, Building, Copy, Check, Loader2, Camera, LogOut, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/usePermissions';
import PermissionGate from '@/components/ui/PermissionGate';
import { getUserRolesFromToken } from '@/lib/jwt';
import { authApiService } from '@/redux/api/auth';

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
  const [showPasswordResetDialog, setShowPasswordResetDialog] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
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

  const handlePasswordReset = async () => {
    if (!resetEmail || !resetEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setResettingPassword(true);
      await authApiService.requestPasswordReset({ email: resetEmail });
      toast.success('Password reset email sent! Please check your inbox.');
      setShowPasswordResetDialog(false);
    } catch (err: any) {
      console.error('Password reset error:', err);
      toast.error(err?.response?.data?.detail || 'Failed to send password reset email');
    } finally {
      setResettingPassword(false);
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
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
            <div className="relative px-6 py-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                {/* Avatar */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <Avatar className="relative h-28 w-28 border-4 border-gray-900 shadow-2xl ring-4 ring-purple-500/20">
                    <AvatarImage src={user.profile_picture_url || undefined} />
                    <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                      {getInitials(user.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-sm">
                      <Camera className="h-7 w-7 text-white" />
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 space-y-3 pb-2">
                  <div>
                    <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      {user.full_name || 'No name set'}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <div className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors">
                        <Mail className="h-4 w-4" />
                        <span className="text-sm font-medium">{user.email}</span>
                      </div>
                      {user.email_verified && (
                        <Badge className="gap-1.5 bg-green-900/50 text-green-400 border-green-800 hover:bg-green-900/70 transition-all">
                          <Check className="h-3.5 w-3.5" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Role Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={`${getUserRoleColor()} text-white gap-1.5 px-3 py-1.5 font-semibold shadow-lg hover:scale-105 transition-transform`}>
                      <Shield className="h-4 w-4" />
                      {getUserRole()}
                    </Badge>
                    
                    {/* Show additional roles if user has multiple */}
                    {userRoles.length > 1 && userRoles.slice(1).map((role, idx) => (
                      <Badge key={idx} className="gap-1.5 px-3 py-1.5 bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600 transition-colors">
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </Badge>
                    ))}
                    
                    {user.organization_id && (
                      <Badge className="gap-1.5 px-3 py-1.5 bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-750 transition-colors">
                        <Building className="h-4 w-4" />
                        Organization Member
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          
            <div className="space-y-6 px-6 pb-6 border-t border-gray-800/50 pt-6 bg-gradient-to-b from-gray-900/50 to-transparent">
              {/* Profile Form */}
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-900/30 rounded-lg border border-purple-800/30">
                    <User className="h-5 w-5 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Personal Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2 group">
                    <Label htmlFor="full_name" className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">
                      Full Name
                    </Label>
                    {isEditing ? (
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                        placeholder="Enter your full name"
                        className="bg-gray-800/80 border-gray-700 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:bg-gray-800 transition-all"
                      />
                    ) : (
                      <div className="px-4 py-2.5 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:bg-gray-800 hover:border-gray-700 transition-all">
                        <p className="text-sm text-white font-medium">
                          {user.full_name || 'No name set'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 group">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">
                      Email Address
                    </Label>
                    <div className="px-4 py-2.5 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:bg-gray-800 hover:border-gray-700 transition-all">
                      <p className="text-sm text-white font-medium">{user.email}</p>
                    </div>
                    <p className="text-xs text-gray-500 italic flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Email cannot be changed
                    </p>
                  </div>

                  <div className="space-y-2 group">
                    <Label htmlFor="preferred_locale" className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">
                      Preferred Locale
                    </Label>
                    {isEditing ? (
                      <Input
                        id="preferred_locale"
                        value={formData.preferred_locale}
                        onChange={(e) => handleInputChange('preferred_locale', e.target.value)}
                        placeholder="e.g., en-US, es-ES"
                        className="bg-gray-800/80 border-gray-700 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:bg-gray-800 transition-all"
                      />
                    ) : (
                      <div className="px-4 py-2.5 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:bg-gray-800 hover:border-gray-700 transition-all">
                        <p className="text-sm text-white font-medium">
                          {user.preferred_locale || 'Not set'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 group">
                    <Label htmlFor="profile_picture_url" className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">
                      Profile Picture URL
                    </Label>
                    {isEditing ? (
                      <Input
                        id="profile_picture_url"
                        value={formData.profile_picture_url}
                        onChange={(e) => handleInputChange('profile_picture_url', e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        className="bg-gray-800/80 border-gray-700 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:bg-gray-800 transition-all"
                      />
                    ) : (
                      <div className="px-4 py-2.5 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:bg-gray-800 hover:border-gray-700 transition-all">
                        <p className="text-sm text-white font-medium truncate">
                          {user.profile_picture_url || 'No profile picture'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-800/50">
                  <Button 
                    onClick={handleCancel}
                    className="sm:w-auto w-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 hover:scale-105 transition-transform shadow-lg"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={profileLoading}
                    className="sm:w-auto w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:scale-105 transition-transform shadow-lg"
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
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
            <div className="px-6 py-5 border-b border-gray-800/50 bg-gradient-to-r from-gray-900 to-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-900/30 rounded-lg border border-purple-800/30">
                  <Shield className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Account Details</h3>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Your account information and settings
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Email Verified */}
                <div className="space-y-3 p-5 rounded-xl bg-gradient-to-br from-gray-800/80 to-gray-800/50 border border-gray-700/50 hover:border-gray-700 transition-all hover:shadow-lg group">
                  <Label className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">Email Status</Label>
                  <div className="flex items-center gap-3">
                    {user.email_verified ? (
                      <>
                        <div className="p-2 bg-green-900/30 rounded-lg border border-green-800/50">
                          <Check className="h-5 w-5 text-green-400" />
                        </div>
                        <span className="text-base font-semibold text-green-400">Verified</span>
                      </>
                    ) : (
                      <>
                        <div className="p-2 bg-yellow-900/30 rounded-lg border border-yellow-800/50">
                          <X className="h-5 w-5 text-yellow-400" />
                        </div>
                        <span className="text-base font-semibold text-yellow-400">Not Verified</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Organization */}
                <div className="space-y-3 p-5 rounded-xl bg-gradient-to-br from-gray-800/80 to-gray-800/50 border border-gray-700/50 hover:border-gray-700 transition-all hover:shadow-lg group">
                  <Label className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">Organization</Label>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-900/30 rounded-lg border border-purple-800/50">
                      <Building className="h-5 w-5 text-purple-400" />
                    </div>
                    <span className="text-base font-semibold text-white">
                      {user.organization_id ? 'Team Organization' : 'Individual Account'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Password Reset Section */}
              <div className="mt-6 pt-6 border-t border-gray-800/50">
                <div className="space-y-4 p-5 rounded-xl bg-gradient-to-br from-gray-800/50 to-transparent border border-gray-700/30">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-900/20 rounded-lg border border-orange-800/30 mt-0.5">
                      <KeyRound className="h-5 w-5 text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <Label className="text-sm font-semibold text-white">Password Security</Label>
                      <p className="text-xs text-gray-400 mt-1">
                        Request a password reset link to be sent to your email
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setResetEmail(user?.email || '');
                      setShowPasswordResetDialog(true);
                    }}
                    variant="outline"
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white border-gray-700 hover:scale-105 transition-transform shadow-md hover:shadow-lg"
                  >
                    <KeyRound className="mr-2 h-5 w-5" />
                    Request Password Reset
                  </Button>
                </div>
              </div>

              {/* Logout Section - Separate */}
              <div className="mt-6 pt-6 border-t border-gray-800/50">
                <div className="p-5 rounded-xl bg-gradient-to-br from-red-900/10 to-transparent border border-red-800/20">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-red-900/20 rounded-lg border border-red-800/30">
                      <LogOut className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <Label className="text-sm font-semibold text-white">Session Management</Label>
                      <p className="text-xs text-gray-400 mt-1">
                        Sign out from your account on this device
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    variant="destructive"
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white hover:scale-105 transition-transform shadow-lg"
                  >
                    {loggingOut ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Logging out...
                      </>
                    ) : (
                      <>
                        <LogOut className="mr-2 h-5 w-5" />
                        Logout from Account
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Password Reset Dialog */}
        <Dialog open={showPasswordResetDialog} onOpenChange={setShowPasswordResetDialog}>
          <DialogContent className="bg-gray-900 border-gray-800 text-white shadow-2xl sm:max-w-md">
            <DialogHeader className="space-y-3">
              <DialogTitle className="flex items-center gap-3 text-xl">
                <div className="p-2.5 bg-purple-900/30 rounded-xl border border-purple-800/50">
                  <KeyRound className="h-6 w-6 text-purple-400" />
                </div>
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent font-bold">
                  Reset Password
                </span>
              </DialogTitle>
              <DialogDescription className="text-gray-400 text-sm leading-relaxed">
                A secure password reset link will be sent to your registered email address.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-6 space-y-5">
              <div className="space-y-3">
                <Label htmlFor="reset-email" className="text-sm font-medium text-gray-300">
                  Email Address
                </Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="bg-gray-800/80 border-gray-700 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 h-11 transition-all"
                  disabled={resettingPassword}
                />
              </div>
              
              <div className="p-4 bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-800/50 rounded-xl">
                <div className="flex gap-3">
                  <div className="p-2 bg-blue-900/30 rounded-lg border border-blue-800/50 flex-shrink-0">
                    <Mail className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm font-semibold text-blue-300">
                      Check your email inbox
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      You will receive an email with instructions to reset your password. 
                      The link will be valid for <span className="text-blue-400 font-medium">24 hours</span>.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-3">
              <Button
                onClick={() => setShowPasswordResetDialog(false)}
                variant="outline"
                className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700 hover:scale-105 transition-transform"
                disabled={resettingPassword}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePasswordReset}
                disabled={resettingPassword}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:scale-105 transition-transform shadow-lg"
              >
                {resettingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-5 w-5" />
                    Send Reset Link
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default UserProfile;
