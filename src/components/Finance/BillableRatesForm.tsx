import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarPicker } from '@/components/ui/calendar-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RateFormData {
  scope: 'user' | 'project' | 'client' | 'default';
  scope_id?: string;
  rate_type: 'billable' | 'cost';
  currency: string;
  hourly_rate: number;
  effective_from?: Date;
  effective_to?: Date;
}

interface BillableRatesFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: RateFormData;
  setFormData: React.Dispatch<React.SetStateAction<RateFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  title?: string;
  submitLabel?: string;
}

const BillableRatesForm: React.FC<BillableRatesFormProps> = ({
  open,
  onOpenChange,
  formData,
  setFormData,
  onSubmit,
  loading,
  title = "Create New Rate",
  submitLabel = "Create Rate",
}) => {
  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md sm:max-w-lg w-[95vw] max-h-[85vh] overflow-y-auto pb-8">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
          {/* Scope and Rate Type - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="scope" className="text-sm font-medium">Scope</Label>
              <Select
                value={formData.scope}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, scope: value }))}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 h-10 sm:h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="default" className="text-gray-300">Default</SelectItem>
                  <SelectItem value="project" className="text-gray-300">Project</SelectItem>
                  <SelectItem value="user" className="text-gray-300">User</SelectItem>
                  <SelectItem value="client" className="text-gray-300">Client</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate_type" className="text-sm font-medium">Rate Type</Label>
              <Select
                value={formData.rate_type}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, rate_type: value }))}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 h-10 sm:h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="billable" className="text-gray-300">Billable</SelectItem>
                  <SelectItem value="cost" className="text-gray-300">Cost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Currency and Hourly Rate - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency" className="text-sm font-medium">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 h-10 sm:h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {currencies.map(currency => (
                    <SelectItem key={currency} value={currency} className="text-gray-300">{currency}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hourly_rate" className="text-sm font-medium">Hourly Rate</Label>
              <Input
                id="hourly_rate"
                type="number"
                min="0"
                value={formData.hourly_rate}
                onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: parseFloat(e.target.value) }))}
                className="bg-gray-800 border-gray-700 h-10 sm:h-11"
                placeholder="0"
              />
            </div>
          </div>

          {/* Effective Dates - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="effective_from" className="text-sm font-medium">Effective From</Label>
              <CalendarPicker
                value={formData.effective_from}
                onChange={(date) => setFormData(prev => ({ ...prev, effective_from: date }))}
                placeholder="dd/mm/yyyy"
                maxDate={formData.effective_to}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="effective_to" className="text-sm font-medium">Effective To</Label>
              <CalendarPicker
                value={formData.effective_to}
                onChange={(date) => setFormData(prev => ({ ...prev, effective_to: date }))}
                placeholder="dd/mm/yyyy"
                minDate={formData.effective_from}
              />
            </div>
          </div>

          {/* Action Buttons - Responsive Layout */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 sm:pt-6 pb-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 h-10 sm:h-11 order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-pink-500 hover:bg-pink-600 text-white h-10 sm:h-11 order-1 sm:order-2"
            >
              {loading ? 'Processing...' : submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BillableRatesForm;
