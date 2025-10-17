import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  WorkspacesTab,
  MembersTabWithErrorBoundary
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
            <TabsList className="grid w-full grid-cols-2 bg-gray-900 border border-gray-800">
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
            </TabsList>

            <TabsContent value="workspaces" className="mt-6">
              <WorkspacesTab />
            </TabsContent>

            <TabsContent value="members" className="mt-6">
              <MembersTabWithErrorBoundary />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default Organization;