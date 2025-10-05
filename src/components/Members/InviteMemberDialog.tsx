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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Mail, Shield, Info } from 'lucide-react';
import { Member } from './MembersTable';

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInviteMember: (member: Omit<Member, 'id' | 'workHours' | 'cost'>) => void;
}

export const InviteMemberDialog: React.FC<InviteMemberDialogProps> = ({
  open,
  onOpenChange,
  onInviteMember,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    accessRights: 'Regular member',
    rate: '',
    groups: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) return;

    onInviteMember({
      name: formData.name,
      email: formData.email,
      accessRights: formData.accessRights,
      rate: formData.rate ? parseFloat(formData.rate) : undefined,
      groups: formData.groups,
      status: 'active',
    });

    // Reset form
    setFormData({
      name: '',
      email: '',
      accessRights: 'Regular member',
      rate: '',
      groups: [],
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-[540px] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-800">
          <DialogTitle className="text-base font-semibold">Invite new member</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-0">
          <div className="px-6 pb-4 space-y-4">
            {/* Member Information */}
            <div className="bg-gray-800 rounded-lg p-4 space-y-4 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Member Information
                </span>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Full Name
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 h-10"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Email Address
                </Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="member@example.com"
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 h-10"
                  required
                />
                <p className="text-xs text-gray-500">
                  An invitation will be sent to this email address
                </p>
              </div>
            </div>

            {/* Access Rights */}
            <div className="bg-gray-800 rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Access & Permissions
                </span>
              </div>

              {/* Access Level */}
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Access Rights
                  </Label>
                  <Info className="w-3 h-3 text-gray-500" />
                </div>
                <Select 
                  value={formData.accessRights} 
                  onValueChange={(value) => setFormData({ ...formData, accessRights: value })}
                >
                  <SelectTrigger className="bg-gray-900 border-gray-700 text-gray-300 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="Organization Owner" className="text-gray-300">
                      Organization Owner
                    </SelectItem>
                    <SelectItem value="Admin" className="text-gray-300">
                      Admin
                    </SelectItem>
                    <SelectItem value="Regular member" className="text-gray-300">
                      Regular member
                    </SelectItem>
                    <SelectItem value="Project Manager" className="text-gray-300">
                      Project Manager
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Determines what actions this member can perform
                </p>
              </div>

              {/* Hourly Rate */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Hourly Rate (Optional)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                    placeholder="0.00"
                    className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 h-10 pl-7"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">/h</span>
                </div>
              </div>

              {/* Groups */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Add to Groups (Optional)
                </Label>
                <Select>
                  <SelectTrigger className="bg-gray-900 border-gray-700 text-gray-500 h-10">
                    <SelectValue placeholder="Select groups" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="dev" className="text-gray-300">
                      Development Team
                    </SelectItem>
                    <SelectItem value="design" className="text-gray-300">
                      Design Team
                    </SelectItem>
                    <SelectItem value="marketing" className="text-gray-300">
                      Marketing Team
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Send Invitation Button */}
          <div className="px-6 pb-6 pt-2">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-6 text-sm rounded-lg"
            >
              <Mail className="w-4 h-4 mr-2" />
              Send invitation
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

