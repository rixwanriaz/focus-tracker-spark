import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  Users, 
  Edit, 
  Trash2, 
  Mail, 
  Phone,
  MapPin,
  DollarSign,
  Calendar,
  Search,
  Filter,
  Building,
  User,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { financeApiService } from '@/redux/api/finance';
import { projectApiService } from '@/redux/api/project';

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  billing_info?: {
    currency: string;
    payment_terms: string;
    tax_id?: string;
    billing_address?: string;
  };
  status: 'active' | 'inactive' | 'prospect';
  created_at: string;
  updated_at: string;
  total_projects: number;
  total_revenue: number;
  outstanding_balance: number;
}

interface ClientFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  currency: string;
  payment_terms: string;
  tax_id?: string;
  status: 'active' | 'inactive' | 'prospect';
}

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    currency: 'USD',
    payment_terms: '30',
    tax_id: '',
    status: 'active',
  });

  // Mock data for demonstration
  const mockClients: Client[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john@acmecorp.com',
      phone: '+1 (555) 123-4567',
      company: 'Acme Corporation',
      address: {
        street: '123 Business St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'US',
      },
      billing_info: {
        currency: 'USD',
        payment_terms: '30',
        tax_id: '12-3456789',
        billing_address: '123 Business St, New York, NY 10001',
      },
      status: 'active',
      created_at: '2024-01-01',
      updated_at: '2024-01-15',
      total_projects: 3,
      total_revenue: 15750.00,
      outstanding_balance: 5250.00,
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@techstart.io',
      phone: '+1 (555) 987-6543',
      company: 'TechStart Inc',
      address: {
        street: '456 Innovation Ave',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105',
        country: 'US',
      },
      billing_info: {
        currency: 'USD',
        payment_terms: '15',
        tax_id: '98-7654321',
        billing_address: '456 Innovation Ave, San Francisco, CA 94105',
      },
      status: 'active',
      created_at: '2024-01-10',
      updated_at: '2024-01-20',
      total_projects: 2,
      total_revenue: 8400.00,
      outstanding_balance: 8400.00,
    },
    {
      id: '3',
      name: 'Michael Chen',
      email: 'michael@globalsolutions.com',
      phone: '+1 (555) 456-7890',
      company: 'Global Solutions',
      address: {
        street: '789 Global Blvd',
        city: 'Chicago',
        state: 'IL',
        zip: '60601',
        country: 'US',
      },
      billing_info: {
        currency: 'USD',
        payment_terms: '45',
        tax_id: '45-6789012',
        billing_address: '789 Global Blvd, Chicago, IL 60601',
      },
      status: 'inactive',
      created_at: '2023-12-01',
      updated_at: '2024-01-05',
      total_projects: 1,
      total_revenue: 2100.00,
      outstanding_balance: 2100.00,
    },
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];
  const paymentTerms = ['15', '30', '45', '60'];
  const countries = ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP'];

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const clientsData = await clientApiService.listClients();
      setClients(mockClients);
    } catch (error) {
      console.error('Failed to load clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual client creation API call
      const newClient: Client = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          country: formData.country,
        },
        billing_info: {
          currency: formData.currency,
          payment_terms: formData.payment_terms,
          tax_id: formData.tax_id,
        },
        status: formData.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        total_projects: 0,
        total_revenue: 0,
        outstanding_balance: 0,
      };
      
      setClients(prev => [newClient, ...prev]);
      setCreateDialogOpen(false);
      resetForm();
      toast.success('Client created successfully');
    } catch (error: any) {
      console.error('Failed to create client:', error);
      toast.error(error?.response?.data?.detail || 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone || '',
      company: client.company || '',
      street: client.address?.street || '',
      city: client.address?.city || '',
      state: client.address?.state || '',
      zip: client.address?.zip || '',
      country: client.address?.country || 'US',
      currency: client.billing_info?.currency || 'USD',
      payment_terms: client.billing_info?.payment_terms || '30',
      tax_id: client.billing_info?.tax_id || '',
      status: client.status,
    });
    setEditDialogOpen(true);
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClient || !formData.name || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual client update API call
      const updatedClient: Client = {
        ...selectedClient,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          country: formData.country,
        },
        billing_info: {
          currency: formData.currency,
          payment_terms: formData.payment_terms,
          tax_id: formData.tax_id,
        },
        status: formData.status,
        updated_at: new Date().toISOString(),
      };
      
      setClients(prev => prev.map(client => 
        client.id === selectedClient.id ? updatedClient : client
      ));
      setEditDialogOpen(false);
      setSelectedClient(null);
      resetForm();
      toast.success('Client updated successfully');
    } catch (error: any) {
      console.error('Failed to update client:', error);
      toast.error(error?.response?.data?.detail || 'Failed to update client');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'US',
      currency: 'USD',
      payment_terms: '30',
      tax_id: '',
      status: 'active',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-600 text-white',
      inactive: 'bg-gray-600 text-white',
      prospect: 'bg-blue-600 text-white',
    };
    return variants[status as keyof typeof variants] || 'bg-gray-600 text-white';
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const filteredClients = clients.filter(client => {
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const totalRevenue = clients.reduce((sum, client) => sum + client.total_revenue, 0);
  const totalOutstanding = clients.reduce((sum, client) => sum + client.outstanding_balance, 0);
  const activeClients = clients.filter(client => client.status === 'active').length;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Clients</h1>
              <p className="text-gray-400">Manage your clients and their billing information</p>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-pink-500 hover:bg-pink-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Client
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Client</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateClient} className="space-y-4">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-gray-800 border-gray-700"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="bg-gray-800 border-gray-700"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          className="bg-gray-800 border-gray-700"
                        />
                      </div>
                      <div>
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                          className="bg-gray-800 border-gray-700"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Address</h3>
                    <div>
                      <Label htmlFor="street">Street Address</Label>
                      <Input
                        id="street"
                        value={formData.street}
                        onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                          className="bg-gray-800 border-gray-700"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                          className="bg-gray-800 border-gray-700"
                        />
                      </div>
                      <div>
                        <Label htmlFor="zip">ZIP Code</Label>
                        <Input
                          id="zip"
                          value={formData.zip}
                          onChange={(e) => setFormData(prev => ({ ...prev, zip: e.target.value }))}
                          className="bg-gray-800 border-gray-700"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Select
                        value={formData.country}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map(country => (
                            <SelectItem key={country} value={country}>{country}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Billing Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Billing Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="currency">Currency</Label>
                        <Select
                          value={formData.currency}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {currencies.map(currency => (
                              <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="payment_terms">Payment Terms (days)</Label>
                        <Select
                          value={formData.payment_terms}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, payment_terms: value }))}
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentTerms.map(term => (
                              <SelectItem key={term} value={term}>{term} days</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="tax_id">Tax ID</Label>
                      <Input
                        id="tax_id"
                        value={formData.tax_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, tax_id: e.target.value }))}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="prospect">Prospect</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCreateDialogOpen(false)}
                      className="border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-pink-500 hover:bg-pink-600 text-white"
                    >
                      {loading ? 'Creating...' : 'Create Client'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Clients</p>
                    <p className="text-2xl font-bold text-white">{clients.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Clients</p>
                    <p className="text-2xl font-bold text-white">{activeClients}</p>
                  </div>
                  <User className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(totalRevenue, 'USD')}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Outstanding</p>
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(totalOutstanding, 'USD')}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 border-gray-700"
              />
            </div>
          </div>

          {/* Clients Table */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="w-5 h-5" />
                Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No clients found</p>
                  <p className="text-sm">Add your first client to get started</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="text-gray-300">Client</TableHead>
                      <TableHead className="text-gray-300">Company</TableHead>
                      <TableHead className="text-gray-300">Contact</TableHead>
                      <TableHead className="text-gray-300">Projects</TableHead>
                      <TableHead className="text-gray-300">Revenue</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => (
                      <TableRow key={client.id} className="border-gray-800">
                        <TableCell>
                          <div>
                            <div className="text-white font-medium">{client.name}</div>
                            <div className="text-gray-400 text-sm">{client.email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {client.company || '—'}
                        </TableCell>
                        <TableCell>
                          <div className="text-gray-300">
                            {client.phone && (
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="w-3 h-3" />
                                {client.phone}
                              </div>
                            )}
                            {client.address?.city && (
                              <div className="flex items-center gap-1 text-sm">
                                <MapPin className="w-3 h-3" />
                                {client.address.city}, {client.address.state}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {client.total_projects}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-white font-medium">
                              {formatCurrency(client.total_revenue, client.billing_info?.currency || 'USD')}
                            </div>
                            {client.outstanding_balance > 0 && (
                              <div className="text-orange-400 text-sm">
                                Outstanding: {formatCurrency(client.outstanding_balance, client.billing_info?.currency || 'USD')}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(client.status)}>
                            {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-gray-400 hover:text-white"
                              onClick={() => handleEditClient(client)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                              <Mail className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-400">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Client Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateClient} className="space-y-4">
            {/* Same form fields as create dialog */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_name">Name *</Label>
                  <Input
                    id="edit_name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-gray-800 border-gray-700"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_email">Email *</Label>
                  <Input
                    id="edit_email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-gray-800 border-gray-700"
                    required
                  />
                </div>
              </div>
              {/* Include all other form fields here - shortened for brevity */}
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-pink-500 hover:bg-pink-600 text-white"
              >
                {loading ? 'Updating...' : 'Update Client'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Clients;

