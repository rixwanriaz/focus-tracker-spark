import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, UserPlus, Mail, Shield, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { 
  createInvite, 
  getOrganizationInvites, 
  revokeInvite, 
  resendInvite,
  getOrganizationMembers 
} from '@/redux/slice/organizationSlice';
import { useToast } from '@/hooks/use-toast';
import { getOrgIdFromToken } from '@/lib/jwt';

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'pending' | 'suspended';
  lastActive: string;
  avatar?: string;
  inviteId?: string;
  expiresAt?: string;
}

const MembersTab: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  
  // Redux state
  const { 
    members, 
    invitations, 
    loadingMembers, 
    loadingInvitations, 
    creatingInvite, 
    revokingInvite, 
    resendingInvite,
    error,
    currentOrganization 
  } = useSelector((state: RootState) => state.organization);
  
  // Also get user info from auth state for debugging
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'member' as 'member' | 'admin'
  });

  // Get organization ID from JWT token or state
  const getOrganizationId = () => {
    // Primary source: JWT token (most reliable)
    const orgIdFromToken = getOrgIdFromToken();
    
    // Fallback to URL params
    const urlParams = new URLSearchParams(window.location.search);
    const orgIdFromUrl = urlParams.get('orgId');
    
    // Fallback to Redux state
    const orgId = orgIdFromToken || 
                  orgIdFromUrl ||
                  currentOrganization?.slug || 
                  currentOrganization?.name || 
                  (user as any)?.organization_id;

    
    return orgId;
  };

  // Load data on component mount
  useEffect(() => {
    const orgId = getOrganizationId();
    if (orgId) {
      dispatch(getOrganizationMembers(orgId));
      dispatch(getOrganizationInvites(orgId));
    }
  }, [dispatch, currentOrganization?.slug, currentOrganization?.name]);

  // Handle invite form submission
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteForm.email.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    const orgId = getOrganizationId();
    if (!orgId) {
      toast({
        title: "Error", 
        description: "No organization found. Please ensure you're logged in and have access to an organization.",
        variant: "destructive",
      });
      return;
    }

    try {
      await dispatch(createInvite({
        orgId: orgId,
        data: {
          email: inviteForm.email.trim(),
          role: inviteForm.role
        }
      })).unwrap();

      toast({
        title: "Success",
        description: `Invitation sent to ${inviteForm.email}`,
      });

      // Reset form and close dialog
      setInviteForm({ email: '', role: 'member' });
      setIsInviteDialogOpen(false);
      
      // Refresh invitations list
      try {
        dispatch(getOrganizationInvites(orgId));
      } catch (refreshError) {
        console.error('Error refreshing invitations:', refreshError);
      }
    } catch (error: any) {
      console.error('Error creating invitation:', error);
      toast({
        title: "Error",
        description: error || "Failed to send invitation",
        variant: "destructive",
      });
    }
  };

  // Handle revoke invitation
  const handleRevokeInvite = async (inviteId: string) => {
    const orgId = getOrganizationId();
    if (!orgId) return;

    try {
      await dispatch(revokeInvite({
        orgId: orgId,
        inviteId
      })).unwrap();

      toast({
        title: "Success",
        description: "Invitation revoked successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error || "Failed to revoke invitation",
        variant: "destructive",
      });
    }
  };

  // Handle resend invitation
  const handleResendInvite = async (inviteId: string) => {
    const orgId = getOrganizationId();
    if (!orgId) return;

    try {
      await dispatch(resendInvite({
        orgId: orgId,
        inviteId
      })).unwrap();

      toast({
        title: "Success",
        description: "Invitation resent successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error || "Failed to resend invitation",
        variant: "destructive",
      });
    }
  };


  // Process members data from Redux state
  const processedMembers = (members || []).map(member => {
    if (!member || !member.user) {
      console.warn('Invalid member data:', member);
      return null;
    }
    return {
      id: member.user.id,
      name: member.user.full_name || member.user.email || 'Unknown',
      email: member.user.email || 'unknown@example.com',
      role: member.role as 'owner' | 'admin' | 'member',
      status: 'active' as 'active' | 'pending' | 'suspended',
      lastActive: 'Active', // Backend doesn't provide joined_at in this endpoint
      avatar: undefined, // API doesn't provide avatar yet
    };
  }).filter(Boolean);

  // Process pending invitations
  const pendingInvitations = (invitations || [])
    .filter(invite => invite && !invite.accepted_at && !invite.declined_at && !invite.revoked_at)
    .map(invite => ({
      id: `invite-${invite.id}`,
      name: invite.email || 'Unknown',
      email: invite.email || 'unknown@example.com',
      role: invite.role as 'owner' | 'admin' | 'member',
      status: 'pending' as 'active' | 'pending' | 'suspended',
      lastActive: 'Pending',
      avatar: undefined,
      inviteId: invite.id,
      expiresAt: invite.expires_at,
    }));

  // Combine members and pending invitations
  const allMembers = [...processedMembers, ...pendingInvitations];

  const filteredMembers = allMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-600';
      case 'admin': return 'bg-blue-600';
      case 'member': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600';
      case 'pending': return 'bg-yellow-600';
      case 'suspended': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  // Add error boundary for rendering
  try {
    return (
      <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Team Members</h2>
          <p className="text-gray-400 text-sm mt-1">
            {loadingMembers || loadingInvitations ? 'Loading members...' : 
             error ? 'Error loading members' :
             `Manage your organization members and their permissions`}
          </p>
        </div>
        
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 text-white shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-purple-400" />
                Invite New Member
              </DialogTitle>
              <p className="text-gray-400 text-sm">Send an invitation to join your organization</p>
            </DialogHeader>
            <form onSubmit={handleInviteSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-300">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="member@example.com"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800 focus:border-purple-500/50 transition-all duration-200 mt-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="role" className="text-sm font-medium text-gray-300">Role</Label>
                <Select 
                  value={inviteForm.role} 
                  onValueChange={(value: 'member' | 'admin') => setInviteForm(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white focus:bg-gray-800 focus:border-purple-500/50 transition-all duration-200 mt-2">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700 shadow-xl">
                    <SelectItem value="member" className="text-gray-300 hover:bg-gray-800 focus:bg-gray-800">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        Member
                      </div>
                    </SelectItem>
                    <SelectItem value="admin" className="text-gray-300 hover:bg-gray-800 focus:bg-gray-800">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Admin
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => {
                    setIsInviteDialogOpen(false);
                    setInviteForm({ email: '', role: 'member' });
                  }}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={creatingInvite}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                >
                  {creatingInvite ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Invitation'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-purple-500/50 transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Members</p>
                <p className="text-3xl font-bold text-white">{allMembers.length}</p>
              </div>
              <div className="p-3 bg-purple-600/20 rounded-full">
                <UserPlus className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-green-500/50 transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Active Members</p>
                <p className="text-3xl font-bold text-white">
                  {allMembers.filter(m => m.status === 'active').length}
                </p>
              </div>
              <div className="p-3 bg-green-600/20 rounded-full">
                <div className="h-6 w-6 rounded-full bg-green-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-yellow-500/50 transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Pending Invites</p>
                <p className="text-3xl font-bold text-white">
                  {pendingInvitations.length}
                </p>
              </div>
              <div className="p-3 bg-yellow-600/20 rounded-full">
                <div className="h-6 w-6 rounded-full bg-yellow-500"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search members by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800 focus:border-purple-500/50 transition-all duration-200"
        />
      </div>

      {/* Members Table */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-xl">
        <CardHeader className="bg-gray-950/50 border-b border-gray-800">
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-purple-400" />
            Team Members ({allMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-gray-950/30 border-b border-gray-800">
              <div className="col-span-2 text-sm font-semibold text-gray-300 uppercase tracking-wider">Member</div>
              <div className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Role</div>
              <div className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Status</div>
              <div className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Last Active</div>
              <div className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Actions</div>
            </div>

            {/* Table Body */}
            {filteredMembers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="p-4 bg-gray-800/50 rounded-full mb-4">
                  <UserPlus className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {searchTerm ? 'No members found' : 'No team members yet'}
                </h3>
                <p className="text-gray-400 text-sm text-center max-w-md">
                  {searchTerm 
                    ? 'Try adjusting your search terms to find members.' 
                    : 'Start building your team by inviting your first member.'
                  }
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => setIsInviteDialogOpen(true)}
                    className="mt-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite First Member
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-800/50">
                {filteredMembers.map((member: Member, index) => (
                <div key={member.id} className="grid grid-cols-6 gap-4 px-6 py-5 hover:bg-gray-800/30 transition-all duration-200 group">
                  <div className="col-span-2 flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-10 w-10 ring-2 ring-gray-700 group-hover:ring-purple-500/50 transition-all duration-200">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-600 to-purple-700 text-white font-semibold">
                          {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {member.status === 'active' && (
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                      )}
                    </div>
                    <div>
                      <div className="text-white font-semibold group-hover:text-purple-300 transition-colors">{member.name}</div>
                      <div className="text-gray-400 text-sm">{member.email}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Badge className={`${getRoleBadgeColor(member.role)} text-white font-medium px-3 py-1 rounded-full`}>
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center">
                    <Badge className={`${getStatusBadgeColor(member.status)} text-white font-medium px-3 py-1 rounded-full`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        member.status === 'active' ? 'bg-green-300' : 
                        member.status === 'pending' ? 'bg-yellow-300' : 'bg-red-300'
                      }`}></div>
                      {member.status === 'pending' ? 'Invited' : member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </Badge>
                    {member.status === 'pending' && member.expiresAt && (
                      <span className="ml-2 text-xs text-gray-400">
                        Expires {new Date(member.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-300">
                    {member.lastActive}
                  </div>
                  
                  <div className="flex items-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-700">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-900 border-gray-700 shadow-xl">
                        {member.status === 'pending' && member.inviteId ? (
                          <>
                            <DropdownMenuItem 
                              className="text-gray-300 hover:bg-gray-800 focus:bg-gray-800"
                              onClick={() => handleResendInvite(member.inviteId!)}
                              disabled={resendingInvite}
                            >
                              <Mail className="mr-2 h-4 w-4" />
                              {resendingInvite ? 'Resending...' : 'Resend Invitation'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-400 hover:bg-red-900/50 focus:bg-red-900/50"
                              onClick={() => handleRevokeInvite(member.inviteId!)}
                              disabled={revokingInvite}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {revokingInvite ? 'Revoking...' : 'Revoke Invitation'}
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <>
                            <DropdownMenuItem className="text-gray-300 hover:bg-gray-800 focus:bg-gray-800">
                              <Shield className="mr-2 h-4 w-4" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-400 hover:bg-red-900/50 focus:bg-red-900/50">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove Member
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      </div>
    );
  } catch (error) {
    console.error('Error rendering MembersTab:', error);
    return (
      <div className="space-y-6">
        <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-red-400 mb-2">⚠️ Error Loading Members</h2>
          <p className="text-red-300 mb-4">
            There was an error loading the members tab. Please refresh the page or contact support.
          </p>
          <details className="text-sm text-gray-400">
            <summary className="cursor-pointer">Error Details</summary>
            <pre className="mt-2 p-2 bg-gray-900 rounded text-xs overflow-auto">
              {error instanceof Error ? error.message : String(error)}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
};

// Error Boundary Component
class MembersTabErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('MembersTab Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="space-y-6">
          <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-red-400 mb-2">⚠️ Error Loading Members</h2>
            <p className="text-red-300 mb-4">
              There was an unexpected error in the members tab. Please refresh the page.
            </p>
            <button 
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors mr-2"
            >
              Try Again
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapped component with error boundary
const MembersTabWithErrorBoundary: React.FC = () => {
  return (
    <MembersTabErrorBoundary>
      <MembersTab />
    </MembersTabErrorBoundary>
  );
};

export { MembersTab, MembersTabWithErrorBoundary };
