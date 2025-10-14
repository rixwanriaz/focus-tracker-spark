import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Edit, Trash2, Building, FolderOpen, Users } from 'lucide-react';
import type { RateOut } from '@/redux/api/finance';

interface BillableRatesTableProps {
  rates: RateOut[];
  loading: boolean;
  selectedScope: string;
  onEditRate?: (rate: RateOut) => void;
  onDeleteRate?: (rate: RateOut) => void;
}

const BillableRatesTable: React.FC<BillableRatesTableProps> = ({
  rates,
  loading,
  selectedScope,
  onEditRate,
  onDeleteRate,
}) => {
  const getScopeIcon = (scope: string) => {
    switch (scope) {
      case 'organization': return <Building className="w-4 h-4" />;
      case 'project': return <FolderOpen className="w-4 h-4" />;
      case 'user': return <Users className="w-4 h-4" />;
      case 'client': return <Users className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getScopeLabel = (scope: string) => {
    switch (scope) {
      case 'organization': return 'Organization Default';
      case 'project': return 'Project Specific';
      case 'user': return 'User Specific';
      case 'client': return 'Client Specific';
      default: return scope;
    }
  };

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <DollarSign className="w-5 h-5" />
            {getScopeLabel(selectedScope)} Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (rates.length === 0) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <DollarSign className="w-5 h-5" />
            {getScopeLabel(selectedScope)} Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-400">
            <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No rates configured for {selectedScope}</p>
            <p className="text-sm">Create your first rate to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <DollarSign className="w-5 h-5" />
          {getScopeLabel(selectedScope)} Rates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rates.map((rate) => (
            <div
              key={rate.id}
              className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-700 rounded-lg">
                  {getScopeIcon(rate.scope)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">
                      {formatCurrency(rate.hourly_rate, rate.currency)}/hour
                    </span>
                    <Badge 
                      variant={rate.rate_type === 'billable' ? 'default' : 'secondary'}
                      className={rate.rate_type === 'billable' ? 'bg-green-600' : 'bg-gray-600'}
                    >
                      {rate.rate_type}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-400">
                    {rate.scope_id ? `ID: ${rate.scope_id}` : 'Default rate'}
                    {rate.effective_from && (
                      <span className="ml-2">
                        • From: {new Date(rate.effective_from).toLocaleDateString()}
                      </span>
                    )}
                    {rate.effective_to && (
                      <span className="ml-2">
                        • To: {new Date(rate.effective_to).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                  onClick={() => onEditRate?.(rate)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-red-400"
                  onClick={() => onDeleteRate?.(rate)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BillableRatesTable;
