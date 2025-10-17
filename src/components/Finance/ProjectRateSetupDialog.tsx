import React, { useState, useEffect } from 'react';
import { DollarSign, Loader2, Info, Building } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { projectApiService } from '@/redux/api';

interface ProjectRateSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
  currentRate?: number;
  onSuccess: () => void;
}

const ProjectRateSetupDialog: React.FC<ProjectRateSetupDialogProps> = ({
  open,
  onOpenChange,
  projectId,
  projectName,
  currentRate,
  onSuccess,
}) => {
  const [hourlyRate, setHourlyRate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setHourlyRate(currentRate ? currentRate.toString() : '');
      setValidationError('');
    } else {
      setHourlyRate('');
      setValidationError('');
      setIsSubmitting(false);
    }
  }, [open, currentRate]);

  // Validate rate input
  const validateRate = (rate: string): string | null => {
    const numRate = parseFloat(rate);
    
    if (!rate.trim()) {
      return 'Please enter an hourly rate';
    }
    
    if (isNaN(numRate) || numRate <= 0) {
      return 'Rate must be greater than $0';
    }
    
    if (numRate > 1000) {
      return 'Rate seems unusually high. Please confirm this is correct.';
    }
    
    if (numRate < 10) {
      return 'Rate seems unusually low. Please confirm this is correct.';
    }
    
    return null;
  };

  // Handle input change with validation
  const handleRateChange = (value: string) => {
    setHourlyRate(value);
    const error = validateRate(value);
    setValidationError(error || '');
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const error = validateRate(hourlyRate);
    if (error) {
      setValidationError(error);
      return;
    }

    setIsSubmitting(true);

    try {
      await projectApiService.setMyRate(projectId, parseFloat(hourlyRate));

      toast.success(
        `Your rate for ${projectName} has been ${currentRate ? 'updated' : 'set'} to $${parseFloat(hourlyRate)}/hour`
      );
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error setting user rate:', error);
      toast.error(error?.message || 'Failed to set hourly rate. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isUpdate = currentRate !== undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 text-white shadow-2xl max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-400" />
            {isUpdate ? 'Update Project Rate' : 'Set Project Rate'}
          </DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            <Building className="h-4 w-4 text-purple-400" />
            <p className="text-gray-400 text-sm">{projectName}</p>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Rate Display (if updating) */}
          {isUpdate && currentRate && (
            <Card className="bg-blue-600/20 border-blue-500/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-400" />
                  <div>
                    <p className="text-blue-300 text-sm font-medium">Current Rate</p>
                    <p className="text-white font-semibold">${currentRate}/hour</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rate Input */}
          <div>
            <Label htmlFor="hourlyRate" className="text-sm font-medium text-gray-300">
              Hourly Rate (USD)
            </Label>
            <div className="relative mt-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400 sm:text-sm">$</span>
              </div>
              <Input
                id="hourlyRate"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={hourlyRate}
                onChange={(e) => handleRateChange(e.target.value)}
                className={`pl-7 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800 focus:border-green-500/50 transition-all duration-200 ${
                  validationError ? 'border-red-500 focus:border-red-500' : ''
                }`}
                required
              />
            </div>
            {validationError && (
              <p className="text-red-400 text-xs mt-1">{validationError}</p>
            )}
          </div>

          {/* Rate Guidelines */}
          <Alert className="bg-gray-800/50 border-gray-700">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-gray-300 text-sm">
              <div className="space-y-1">
                <p><strong>Rate Guidelines:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>This rate applies only to the <strong>{projectName}</strong> project</li>
                  <li>Rate will be used for billing all your time tracked on this project</li>
                  <li>You can update this rate anytime</li>
                  <li>Rate changes apply to new time entries only</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          {/* Rate Examples */}
          <div>
            <Label className="text-sm font-medium text-gray-300 mb-2 block">Quick Rate Selection</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleRateChange('25')}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white text-xs"
              >
                Junior: $25/hr
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleRateChange('50')}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white text-xs"
              >
                Mid-level: $50/hr
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleRateChange('75')}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white text-xs"
              >
                Senior: $75/hr
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleRateChange('100')}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white text-xs"
              >
                Expert: $100/hr
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting || !!validationError || !hourlyRate.trim()}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUpdate ? 'Updating...' : 'Setting...'}
                </>
              ) : (
                <>
                  <DollarSign className="mr-2 h-4 w-4" />
                  {isUpdate ? 'Update Rate' : 'Set Rate'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export { ProjectRateSetupDialog };
