import React, { useState } from 'react';
import { Search, Filter, Download, Eye, User, Calendar, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failed' | 'warning';
}

const AuditLogTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUser, setFilterUser] = useState('all');
  const [filterAction, setFilterAction] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data - this would come from API
  const auditLogs: AuditLogEntry[] = [
    {
      id: '1',
      timestamp: '2024-01-20T10:30:00Z',
      user: {
        id: '1',
        name: 'Rixwan Riaz123',
        email: 'rixwan@example.com',
      },
      action: 'login',
      resource: 'Authentication',
      details: 'User logged in successfully',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'success',
    },
    {
      id: '2',
      timestamp: '2024-01-20T09:15:00Z',
      user: {
        id: '2',
        name: 'John Doe',
        email: 'john@example.com',
      },
      action: 'create',
      resource: 'Project',
      details: 'Created project "New Website Design"',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      status: 'success',
    },
    {
      id: '3',
      timestamp: '2024-01-20T08:45:00Z',
      user: {
        id: '3',
        name: 'Jane Smith',
        email: 'jane@example.com',
      },
      action: 'update',
      resource: 'Member',
      details: 'Updated member permissions for Sarah Wilson',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      status: 'success',
    },
    {
      id: '4',
      timestamp: '2024-01-19T16:20:00Z',
      user: {
        id: '1',
        name: 'Rixwan Riaz123',
        email: 'rixwan@example.com',
      },
      action: 'delete',
      resource: 'Project',
      details: 'Deleted project "Old Project"',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'success',
    },
    {
      id: '5',
      timestamp: '2024-01-19T14:30:00Z',
      user: {
        id: '4',
        name: 'Mike Johnson',
        email: 'mike@example.com',
      },
      action: 'login',
      resource: 'Authentication',
      details: 'Failed login attempt - invalid password',
      ipAddress: '192.168.1.103',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      status: 'failed',
    },
  ];

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUser = filterUser === 'all' || log.user.id === filterUser;
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;

    return matchesSearch && matchesUser && matchesAction && matchesStatus;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-600';
      case 'failed': return 'bg-red-600';
      case 'warning': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'create': return 'bg-blue-600';
      case 'update': return 'bg-purple-600';
      case 'delete': return 'bg-red-600';
      case 'login': return 'bg-green-600';
      case 'logout': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Audit Log</h2>
          <p className="text-gray-400 text-sm">Track all organization activities and changes</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>

            {/* User Filter */}
            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="all" className="text-gray-300">All Users</SelectItem>
                <SelectItem value="1" className="text-gray-300">Rixwan Riaz123</SelectItem>
                <SelectItem value="2" className="text-gray-300">John Doe</SelectItem>
                <SelectItem value="3" className="text-gray-300">Jane Smith</SelectItem>
                <SelectItem value="4" className="text-gray-300">Mike Johnson</SelectItem>
              </SelectContent>
            </Select>

            {/* Action Filter */}
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="all" className="text-gray-300">All Actions</SelectItem>
                <SelectItem value="login" className="text-gray-300">Login</SelectItem>
                <SelectItem value="logout" className="text-gray-300">Logout</SelectItem>
                <SelectItem value="create" className="text-gray-300">Create</SelectItem>
                <SelectItem value="update" className="text-gray-300">Update</SelectItem>
                <SelectItem value="delete" className="text-gray-300">Delete</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="all" className="text-gray-300">All Status</SelectItem>
                <SelectItem value="success" className="text-gray-300">Success</SelectItem>
                <SelectItem value="failed" className="text-gray-300">Failed</SelectItem>
                <SelectItem value="warning" className="text-gray-300">Warning</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-0">
          <div className="overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-950 border-b border-gray-800">
              <div className="col-span-2 text-sm font-semibold text-gray-400 uppercase">User</div>
              <div className="col-span-2 text-sm font-semibold text-gray-400 uppercase">Action</div>
              <div className="col-span-3 text-sm font-semibold text-gray-400 uppercase">Details</div>
              <div className="col-span-2 text-sm font-semibold text-gray-400 uppercase">Timestamp</div>
              <div className="col-span-2 text-sm font-semibold text-gray-400 uppercase">Status</div>
              <div className="col-span-1 text-sm font-semibold text-gray-400 uppercase">Actions</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-800">
              {filteredLogs.map((log) => (
                <div key={log.id} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-800/50 transition-colors">
                  <div className="col-span-2 flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={log.user.avatar} />
                      <AvatarFallback className="bg-purple-600 text-white text-xs">
                        {log.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-white font-medium text-sm">{log.user.name}</div>
                      <div className="text-gray-400 text-xs">{log.user.email}</div>
                    </div>
                  </div>
                  
                  <div className="col-span-2 flex items-center gap-2">
                    <Badge className={`${getActionBadgeColor(log.action)} text-white text-xs`}>
                      {log.action}
                    </Badge>
                    <span className="text-gray-300 text-sm">{log.resource}</span>
                  </div>
                  
                  <div className="col-span-3 text-sm text-gray-300">
                    {log.details}
                  </div>
                  
                  <div className="col-span-2 text-sm text-gray-400">
                    {formatTimestamp(log.timestamp)}
                  </div>
                  
                  <div className="col-span-2 flex items-center">
                    <Badge className={`${getStatusBadgeColor(log.status)} text-white text-xs`}>
                      {log.status}
                    </Badge>
                  </div>
                  
                  <div className="col-span-1 flex items-center">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredLogs.length === 0 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-12 text-center">
            <Activity className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No audit logs found</h3>
            <p className="text-gray-400 mb-4">
              {searchTerm || filterUser !== 'all' || filterAction !== 'all' || filterStatus !== 'all'
                ? 'No logs match your current filters.'
                : 'Audit logs will appear here as users perform actions.'}
            </p>
            {(searchTerm || filterUser !== 'all' || filterAction !== 'all' || filterStatus !== 'all') && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterUser('all');
                  setFilterAction('all');
                  setFilterStatus('all');
                }}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{auditLogs.length}</div>
            <div className="text-gray-400 text-sm">Total Events</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {auditLogs.filter(log => log.status === 'success').length}
            </div>
            <div className="text-gray-400 text-sm">Successful</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {auditLogs.filter(log => log.status === 'failed').length}
            </div>
            <div className="text-gray-400 text-sm">Failed</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {new Set(auditLogs.map(log => log.user.id)).size}
            </div>
            <div className="text-gray-400 text-sm">Active Users</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { AuditLogTab };
