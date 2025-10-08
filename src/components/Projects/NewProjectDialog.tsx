import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, ChevronDown, ChevronUp, DollarSign, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreateProjectRequest } from '@/redux/api';

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProject: (project: CreateProjectRequest) => void;
}

const projectColors = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981',
  '#14b8a6', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'
];

export const NewProjectDialog: React.FC<NewProjectDialogProps> = ({
  open,
  onOpenChange,
  onCreateProject,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    budget_amount: 0,
    budget_currency: 'USD',
    project_manager_id: '',
    color: projectColors[0],
    privacy: 'private',
    inviteMembers: '',
    access: 'regular',
    billable: true,
    hourlyRateType: 'default',
    customRate: '',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    // Create project data for API
    const projectData: CreateProjectRequest = {
      name: formData.name,
      description: formData.description,
      start_date: formData.start_date || new Date().toISOString().split('T')[0],
      end_date: formData.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      budget_amount: formData.budget_amount,
      budget_currency: formData.budget_currency,
      project_manager_id: formData.project_manager_id || '7e7d7a2c-c09f-4e6f-b682-ca3ca920e522', // Default manager ID
    };

    onCreateProject(projectData);

    // Reset form
    setFormData({
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      budget_amount: 0,
      budget_currency: 'USD',
      project_manager_id: '',
      color: projectColors[0],
      privacy: 'private',
      inviteMembers: '',
      access: 'regular',
      billable: true,
      hourlyRateType: 'default',
      customRate: '',
    });
    setShowAdvanced(false);

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-[540px] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-800">
          <DialogTitle className="text-base font-semibold">Create new project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-0">
          <div className="px-6 pb-4 space-y-4">
            {/* Project Name with Color */}
            <div className="flex items-center gap-3 bg-gray-800 rounded-lg px-4 py-3 mt-4">
              {/* Color Picker */}
              <div className="relative">
                <button
                  type="button"
                  className="w-8 h-8 rounded-full cursor-pointer ring-2 ring-gray-700 hover:ring-gray-600 transition-all"
                  style={{ backgroundColor: formData.color }}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                />
                {showColorPicker && (
                  <div className="absolute top-10 left-0 bg-gray-800 border border-gray-700 rounded-lg p-3 z-50 shadow-xl">
                    <div className="grid grid-cols-5 gap-2">
                      {projectColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, color });
                            setShowColorPicker(false);
                          }}
                          className={cn(
                            "w-8 h-8 rounded-full transition-transform hover:scale-110",
                            formData.color === color && "ring-2 ring-white"
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Project Name Input */}
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Project name"
                className="flex-1 bg-transparent border-0 text-white placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-auto"
                required
              />
            </div>

            {/* Project Description */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Description
              </Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Project description"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>

            {/* Project Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Start Date
                </Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  End Date
                </Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>

            {/* Budget */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Budget Amount
                </Label>
                <Input
                  type="number"
                  value={formData.budget_amount}
                  onChange={(e) => setFormData({ ...formData, budget_amount: Number(e.target.value) })}
                  placeholder="0"
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Currency
                </Label>
                <Select value={formData.budget_currency} onValueChange={(value) => setFormData({ ...formData, budget_currency: value })}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="USD" className="text-gray-300">USD</SelectItem>
                    <SelectItem value="EUR" className="text-gray-300">EUR</SelectItem>
                    <SelectItem value="GBP" className="text-gray-300">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Privacy Section */}
            <div className="bg-gray-800 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Privacy</span>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="text-xs">Private, visible only to project members</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Invite Members */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Invite Members
                </Label>
                <Select value={formData.inviteMembers} onValueChange={(value) => setFormData({ ...formData, inviteMembers: value })}>
                  <SelectTrigger className="bg-gray-900 border-gray-700 text-gray-400 h-10">
                    <SelectValue placeholder="Select Team Member or Group" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="member1" className="text-gray-300">Team Member 1</SelectItem>
                    <SelectItem value="member2" className="text-gray-300">Team Member 2</SelectItem>
                    <SelectItem value="group1" className="text-gray-300">Development Team</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Access */}
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Access
                  </Label>
                  <Info className="w-3 h-3 text-gray-500" />
                </div>
                <Select value={formData.access} onValueChange={(value) => setFormData({ ...formData, access: value })}>
                  <SelectTrigger className="bg-gray-900 border-gray-700 text-gray-300 h-10">
                    <SelectValue placeholder="Regular member" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="regular" className="text-gray-300">Regular member</SelectItem>
                    <SelectItem value="admin" className="text-gray-300">Project admin</SelectItem>
                    <SelectItem value="manager" className="text-gray-300">Project manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Billable Section */}
            <div className="bg-gray-800 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Billable</span>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="text-xs">using Workspace rates (0 USD/h)</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Hourly Rate */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Hourly Rate
                </Label>
                <RadioGroup value={formData.hourlyRateType} onValueChange={(value) => setFormData({ ...formData, hourlyRateType: value })}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="default" id="default" className="border-gray-600 text-purple-500" />
                    <Label htmlFor="default" className="text-sm text-gray-300 cursor-pointer flex items-center gap-1">
                      Default hourly rates
                      <Info className="w-3 h-3 text-gray-500" />
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="custom" className="border-gray-600 text-purple-500" />
                    <Label htmlFor="custom" className="text-sm text-gray-300 cursor-pointer flex items-center gap-1">
                      Custom project hourly rate
                      <Info className="w-3 h-3 text-gray-500" />
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="border-t border-gray-800">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full px-6 py-3 flex items-center justify-center gap-2 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-wider hover:bg-gray-800/50"
            >
              Advanced Options
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {showAdvanced && (
              <div className="px-6 pb-4 pt-2 space-y-4 border-t border-gray-800">
                <p className="text-sm text-gray-400">Additional project settings can be configured here.</p>
              </div>
            )}
          </div>

          {/* Create Button */}
          <div className="px-6 pb-6 pt-2">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-6 text-sm rounded-lg"
            >
              Create project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

