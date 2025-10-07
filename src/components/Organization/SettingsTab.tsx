import React, { useState } from 'react';
import { Save, Building, Globe, Shield, Bell, Palette, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const SettingsTab: React.FC = () => {
  const [settings, setSettings] = useState({
    // Organization Settings
    organizationName: 'Focus Tracker Organization',
    organizationEmail: 'admin@focustracker.com',
    organizationWebsite: 'https://focustracker.com',
    organizationDescription: 'A productivity-focused organization dedicated to efficient project management.',
    
    // General Settings
    timezone: 'UTC-5',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12-hour',
    language: 'en',
    
    // Security Settings
    requireTwoFactor: false,
    sessionTimeout: '8',
    passwordPolicy: 'medium',
    allowGuestAccess: false,
    
    // Notification Settings
    emailNotifications: true,
    slackNotifications: false,
    weeklyReports: true,
    projectUpdates: true,
    
    // Appearance Settings
    theme: 'dark',
    accentColor: 'purple',
    compactMode: false,
  });

  const handleSave = () => {
    // This would save settings to API
    console.log('Saving settings:', settings);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Settings</h2>
          <p className="text-gray-400 text-sm">Configure your organization preferences</p>
        </div>
        <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white">
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      {/* Organization Settings */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Building className="h-5 w-5" />
            Organization Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="orgName">Organization Name</Label>
              <Input
                id="orgName"
                value={settings.organizationName}
                onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="orgEmail">Organization Email</Label>
              <Input
                id="orgEmail"
                type="email"
                value={settings.organizationEmail}
                onChange={(e) => setSettings({ ...settings, organizationEmail: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="orgWebsite">Website</Label>
            <Input
              id="orgWebsite"
              value={settings.organizationWebsite}
              onChange={(e) => setSettings({ ...settings, organizationWebsite: e.target.value })}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          
          <div>
            <Label htmlFor="orgDescription">Description</Label>
            <Textarea
              id="orgDescription"
              value={settings.organizationDescription}
              onChange={(e) => setSettings({ ...settings, organizationDescription: e.target.value })}
              className="bg-gray-800 border-gray-700 text-white"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Globe className="h-5 w-5" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={settings.timezone} onValueChange={(value) => setSettings({ ...settings, timezone: value })}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="UTC-5" className="text-gray-300">UTC-5 (EST)</SelectItem>
                  <SelectItem value="UTC-8" className="text-gray-300">UTC-8 (PST)</SelectItem>
                  <SelectItem value="UTC+0" className="text-gray-300">UTC+0 (GMT)</SelectItem>
                  <SelectItem value="UTC+1" className="text-gray-300">UTC+1 (CET)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="language">Language</Label>
              <Select value={settings.language} onValueChange={(value) => setSettings({ ...settings, language: value })}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="en" className="text-gray-300">English</SelectItem>
                  <SelectItem value="es" className="text-gray-300">Spanish</SelectItem>
                  <SelectItem value="fr" className="text-gray-300">French</SelectItem>
                  <SelectItem value="de" className="text-gray-300">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select value={settings.dateFormat} onValueChange={(value) => setSettings({ ...settings, dateFormat: value })}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="MM/DD/YYYY" className="text-gray-300">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY" className="text-gray-300">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD" className="text-gray-300">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="timeFormat">Time Format</Label>
              <Select value={settings.timeFormat} onValueChange={(value) => setSettings({ ...settings, timeFormat: value })}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="12-hour" className="text-gray-300">12-hour (AM/PM)</SelectItem>
                  <SelectItem value="24-hour" className="text-gray-300">24-hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="twoFactor">Require Two-Factor Authentication</Label>
              <p className="text-gray-400 text-sm">Enforce 2FA for all organization members</p>
            </div>
            <Switch
              id="twoFactor"
              checked={settings.requireTwoFactor}
              onCheckedChange={(checked) => setSettings({ ...settings, requireTwoFactor: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="guestAccess">Allow Guest Access</Label>
              <p className="text-gray-400 text-sm">Allow external users to access projects</p>
            </div>
            <Switch
              id="guestAccess"
              checked={settings.allowGuestAccess}
              onCheckedChange={(checked) => setSettings({ ...settings, allowGuestAccess: checked })}
            />
          </div>
          
          <div>
            <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
            <Select value={settings.sessionTimeout} onValueChange={(value) => setSettings({ ...settings, sessionTimeout: value })}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="1" className="text-gray-300">1 hour</SelectItem>
                <SelectItem value="4" className="text-gray-300">4 hours</SelectItem>
                <SelectItem value="8" className="text-gray-300">8 hours</SelectItem>
                <SelectItem value="24" className="text-gray-300">24 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <p className="text-gray-400 text-sm">Receive notifications via email</p>
            </div>
            <Switch
              id="emailNotifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="slackNotifications">Slack Notifications</Label>
              <p className="text-gray-400 text-sm">Send notifications to Slack channels</p>
            </div>
            <Switch
              id="slackNotifications"
              checked={settings.slackNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, slackNotifications: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="weeklyReports">Weekly Reports</Label>
              <p className="text-gray-400 text-sm">Send weekly progress reports</p>
            </div>
            <Switch
              id="weeklyReports"
              checked={settings.weeklyReports}
              onCheckedChange={(checked) => setSettings({ ...settings, weeklyReports: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="projectUpdates">Project Updates</Label>
              <p className="text-gray-400 text-sm">Notify on project status changes</p>
            </div>
            <Switch
              id="projectUpdates"
              checked={settings.projectUpdates}
              onCheckedChange={(checked) => setSettings({ ...settings, projectUpdates: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Palette className="h-5 w-5" />
            Appearance Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="theme">Theme</Label>
              <Select value={settings.theme} onValueChange={(value) => setSettings({ ...settings, theme: value })}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="dark" className="text-gray-300">Dark</SelectItem>
                  <SelectItem value="light" className="text-gray-300">Light</SelectItem>
                  <SelectItem value="auto" className="text-gray-300">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="accentColor">Accent Color</Label>
              <Select value={settings.accentColor} onValueChange={(value) => setSettings({ ...settings, accentColor: value })}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="purple" className="text-gray-300">Purple</SelectItem>
                  <SelectItem value="blue" className="text-gray-300">Blue</SelectItem>
                  <SelectItem value="green" className="text-gray-300">Green</SelectItem>
                  <SelectItem value="red" className="text-gray-300">Red</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="compactMode">Compact Mode</Label>
              <p className="text-gray-400 text-sm">Use compact interface layout</p>
            </div>
            <Switch
              id="compactMode"
              checked={settings.compactMode}
              onCheckedChange={(checked) => setSettings({ ...settings, compactMode: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { SettingsTab };
