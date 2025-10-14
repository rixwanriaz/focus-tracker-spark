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
  FileText, 
  Download, 
  Send, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import { financeApiService } from '@/redux/api/finance';
import { projectApiService } from '@/redux/api/project';
import type { ProjectFinancialsOut } from '@/redux/api/finance';
import type { Project } from '@/redux/api/project';

interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  client_name: string;
  project_id?: string;
  project_name?: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  created_at: string;
  sent_at?: string;
  paid_at?: string;
  items: InvoiceItem[];
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceFormData {
  client_id: string;
  project_id?: string;
  due_date: string;
  currency: string;
  notes?: string;
}

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectFinancials, setProjectFinancials] = useState<Record<string, ProjectFinancialsOut>>({});
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<InvoiceFormData>({
    client_id: '',
    project_id: '',
    due_date: '',
    currency: 'USD',
    notes: '',
  });

  // Mock data for demonstration
  const mockInvoices: Invoice[] = [
    {
      id: '1',
      invoice_number: 'INV-2024-001',
      client_id: 'client-1',
      client_name: 'Acme Corporation',
      project_id: 'project-1',
      project_name: 'Website Redesign',
      amount: 5250.00,
      currency: 'USD',
      status: 'paid',
      due_date: '2024-01-15',
      created_at: '2024-01-01',
      sent_at: '2024-01-01',
      paid_at: '2024-01-10',
      items: [
        { id: '1', description: 'Design & Development', quantity: 35, rate: 150, amount: 5250 },
      ],
    },
    {
      id: '2',
      invoice_number: 'INV-2024-002',
      client_id: 'client-2',
      client_name: 'TechStart Inc',
      project_id: 'project-2',
      project_name: 'Mobile App Development',
      amount: 8400.00,
      currency: 'USD',
      status: 'sent',
      due_date: '2024-02-15',
      created_at: '2024-01-15',
      sent_at: '2024-01-15',
      items: [
        { id: '2', description: 'Mobile App Development', quantity: 60, rate: 140, amount: 8400 },
      ],
    },
    {
      id: '3',
      invoice_number: 'INV-2024-003',
      client_id: 'client-3',
      client_name: 'Global Solutions',
      project_id: 'project-3',
      project_name: 'API Integration',
      amount: 2100.00,
      currency: 'USD',
      status: 'overdue',
      due_date: '2024-01-30',
      created_at: '2024-01-01',
      sent_at: '2024-01-01',
      items: [
        { id: '3', description: 'API Development & Integration', quantity: 15, rate: 140, amount: 2100 },
      ],
    },
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];
  const statuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load projects
      const projectsData = await projectApiService.getProjects();
      setProjects(projectsData);
      
      // Load financial data for each project
      const financialsPromises = projectsData.map(async (project) => {
        try {
          const financials = await financeApiService.getProjectFinancials(project.id);
          return { projectId: project.id, financials };
        } catch (error) {
          console.error(`Failed to load financials for project ${project.id}:`, error);
          return null;
        }
      });
      
      const financialsResults = await Promise.all(financialsPromises);
      const financialsMap: Record<string, ProjectFinancialsOut> = {};
      financialsResults.forEach(result => {
        if (result) {
          financialsMap[result.projectId] = result.financials;
        }
      });
      setProjectFinancials(financialsMap);
      
      // Set mock invoices for now
      setInvoices(mockInvoices);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_id || !formData.due_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual invoice creation API call
      toast.success('Invoice creation will be implemented with backend API');
      setCreateDialogOpen(false);
      setFormData({
        client_id: '',
        project_id: '',
        due_date: '',
        currency: 'USD',
        notes: '',
      });
    } catch (error: any) {
      console.error('Failed to create invoice:', error);
      toast.error(error?.response?.data?.detail || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'sent': return <Send className="w-4 h-4 text-blue-500" />;
      case 'overdue': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'draft': return <Edit className="w-4 h-4 text-gray-500" />;
      case 'cancelled': return <Trash2 className="w-4 h-4 text-gray-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: 'bg-green-600 text-white',
      sent: 'bg-blue-600 text-white',
      overdue: 'bg-red-600 text-white',
      draft: 'bg-gray-600 text-white',
      cancelled: 'bg-gray-500 text-white',
    };
    return variants[status as keyof typeof variants] || 'bg-gray-600 text-white';
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesStatus = selectedStatus === 'all' || invoice.status === selectedStatus;
    const matchesSearch = searchTerm === '' || 
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.project_name && invoice.project_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const totalOutstanding = invoices
    .filter(inv => inv.status === 'sent' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalPaid = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Invoices</h1>
              <p className="text-gray-400">Create and manage invoices for your clients</p>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-pink-500 hover:bg-pink-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Invoice</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateInvoice} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="client_id">Client *</Label>
                      <Select
                        value={formData.client_id}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="client-1">Acme Corporation</SelectItem>
                          <SelectItem value="client-2">TechStart Inc</SelectItem>
                          <SelectItem value="client-3">Global Solutions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="project_id">Project</Label>
                      <Select
                        value={formData.project_id}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, project_id: value }))}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue placeholder="Select project (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map(project => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="due_date">Due Date *</Label>
                      <Input
                        id="due_date"
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                        className="bg-gray-800 border-gray-700"
                        required
                      />
                    </div>
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
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      className="bg-gray-800 border-gray-700"
                      placeholder="Additional notes for the invoice"
                    />
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
                      {loading ? 'Creating...' : 'Create Invoice'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Outstanding</p>
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(totalOutstanding, 'USD')}
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Paid</p>
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(totalPaid, 'USD')}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Invoices</p>
                    <p className="text-2xl font-bold text-white">{invoices.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40 bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 border-gray-700"
              />
            </div>
          </div>

          {/* Invoices Table */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <FileText className="w-5 h-5" />
                Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                </div>
              ) : filteredInvoices.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No invoices found</p>
                  <p className="text-sm">Create your first invoice to get started</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="text-gray-300">Invoice #</TableHead>
                      <TableHead className="text-gray-300">Client</TableHead>
                      <TableHead className="text-gray-300">Project</TableHead>
                      <TableHead className="text-gray-300">Amount</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Due Date</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id} className="border-gray-800">
                        <TableCell className="text-white font-medium">
                          {invoice.invoice_number}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {invoice.client_name}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {invoice.project_name || '—'}
                        </TableCell>
                        <TableCell className="text-white font-medium">
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(invoice.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(invoice.status)}
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {new Date(invoice.due_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                              <Send className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                              <Download className="w-4 h-4" />
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
    </MainLayout>
  );
};

export default Invoices;

