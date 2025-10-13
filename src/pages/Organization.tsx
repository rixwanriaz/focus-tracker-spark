import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  WorkspacesTab,
  MembersTabWithErrorBoundary,
  GroupsTab,
  SettingsTab,
  SubscriptionTab,
  AuditLogTab
} from '@/components/Organization';

const Organization: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('workspaces');

  // Handle URL parameter to set active tab
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-950 text-white">
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold">Organization</h1>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-7 bg-gray-900 border border-gray-800">
              <TabsTrigger 
                value="organization" 
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                Organization
              </TabsTrigger>
              <TabsTrigger 
                value="workspaces" 
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                Workspaces
              </TabsTrigger>
              <TabsTrigger 
                value="members" 
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                Members
              </TabsTrigger>
              <TabsTrigger 
                value="groups" 
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                Groups
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                Settings
              </TabsTrigger>
              <TabsTrigger 
                value="subscription" 
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                Subscription
              </TabsTrigger>
              <TabsTrigger 
                value="audit-log" 
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                Audit Log
              </TabsTrigger>
            </TabsList>

            <TabsContent value="organization" className="mt-6">
              <div className="bg-gray-900 rounded-lg border border-gray-800 p-8 text-center">
                <h2 className="text-xl font-semibold mb-4">Organization Overview</h2>
                <p className="text-gray-400">Manage your organization settings and preferences.</p>
              </div>
            </TabsContent>

            <TabsContent value="workspaces" className="mt-6">
              <WorkspacesTab />
            </TabsContent>

            <TabsContent value="members" className="mt-6">
              <MembersTabWithErrorBoundary />
            </TabsContent>

            <TabsContent value="groups" className="mt-6">
              <GroupsTab />
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <SettingsTab />
            </TabsContent>

            <TabsContent value="subscription" className="mt-6">
              <SubscriptionTab />
            </TabsContent>

            <TabsContent value="audit-log" className="mt-6">
              <AuditLogTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default Organization;