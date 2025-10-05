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
import { Project } from './ProjectsTable';

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProject: (project: Omit<Project, 'id'>) => void;
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

    onCreateProject({
      name: formData.name,
      timeStatus: 0,
      billableStatus: formData.billable ? 'billable' : 'non-billable',
      team: formData.inviteMembers ? [formData.inviteMembers] : [],
      pinned: false,
      archived: false,
      color: formData.color,
    });

    // Reset form
    setFormData({
      name: '',
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

