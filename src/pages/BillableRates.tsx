import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks';
import { 
  createRate, 
  fetchRates, 
  clearRatesError 
} from '@/redux/slice/financeSlice';
import { 
  BillableRatesTable, 
  BillableRatesForm, 
  RateResolutionInfo 
} from '@/components/Finance';
import type { RateCreate, RateOut } from '@/redux/api/finance';

interface RateFormData {
  scope: 'user' | 'project' | 'client' | 'organization';
  scope_id?: string;
  rate_type: 'billable' | 'internal';
  currency: string;
  hourly_rate: number;
  effective_from?: string;
  effective_to?: string;
}

const BillableRates: React.FC = () => {
  const dispatch = useAppDispatch();
  const { rates, ratesLoading, ratesError } = useAppSelector((state) => state.finance);
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedScope, setSelectedScope] = useState<'organization' | 'project' | 'user' | 'client'>('organization');
  
  const [formData, setFormData] = useState<RateFormData>({
    scope: 'organization',
    rate_type: 'billable',
    currency: 'USD',
    hourly_rate: 0,
  });

  useEffect(() => {
    loadRates();
  }, [selectedScope]);

  const loadRates = async () => {
    dispatch(fetchRates({ scope: selectedScope }));
  };

  const handleCreateRate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.hourly_rate || formData.hourly_rate <= 0) {
      toast.error('Please enter a valid hourly rate');
      return;
    }

    try {
      const result = await dispatch(createRate(formData)).unwrap();
      setCreateDialogOpen(false);
      setFormData({
        scope: 'organization',
        rate_type: 'billable',
        currency: 'USD',
        hourly_rate: 0,
      });
      toast.success('Rate created successfully');
      // Refresh rates list
      dispatch(fetchRates({ scope: selectedScope }));
    } catch (error: any) {
      console.error('Failed to create rate:', error);
      toast.error(error || 'Failed to create rate');
    }
  };

  const handleEditRate = (rate: RateOut) => {
    // TODO: Implement edit functionality when API endpoint is available
    toast.info('Edit functionality will be available when the backend API endpoint is implemented');
  };

  const handleDeleteRate = (rate: RateOut) => {
    // TODO: Implement delete functionality when API endpoint is available
    toast.info('Delete functionality will be available when the backend API endpoint is implemented');
  };

  // Clear error when component unmounts or scope changes
  useEffect(() => {
    return () => {
      dispatch(clearRatesError());
    };
  }, [dispatch, selectedScope]);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Billable Rates</h1>
              <p className="text-gray-400">Configure billable rates for projects, users, and clients</p>
            </div>
            <Button 
              className="bg-pink-500 hover:bg-pink-600 text-white"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Rate
            </Button>
          </div>

          {/* Tabs for different scopes */}
          <Tabs value={selectedScope} onValueChange={(value: any) => setSelectedScope(value)}>
            <TabsList className="bg-gray-800 border-gray-700">
              <TabsTrigger value="organization" className="data-[state=active]:bg-pink-500">
                Organization
              </TabsTrigger>
              <TabsTrigger value="project" className="data-[state=active]:bg-pink-500">
                Projects
              </TabsTrigger>
              <TabsTrigger value="user" className="data-[state=active]:bg-pink-500">
                Users
              </TabsTrigger>
              <TabsTrigger value="client" className="data-[state=active]:bg-pink-500">
                Clients
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedScope} className="mt-6">
              <BillableRatesTable
                rates={rates}
                loading={ratesLoading}
                selectedScope={selectedScope}
                onEditRate={handleEditRate}
                onDeleteRate={handleDeleteRate}
              />
            </TabsContent>
          </Tabs>

          {/* Rate Resolution Info */}
          <RateResolutionInfo />
        </div>
      </div>

      {/* Create Rate Dialog */}
      <BillableRatesForm
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleCreateRate}
        loading={ratesLoading}
      />
    </MainLayout>
  );
};

export default BillableRates;

