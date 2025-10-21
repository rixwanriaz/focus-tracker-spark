import React from 'react';
import { MainLayout } from '@/components/Layout';
import { MembersTabWithErrorBoundary } from '@/components/Organization';

const Members: React.FC = () => {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-950 text-white">
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold">Members</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your organization members and permissions</p>
        </div>

        {/* Members Content */}
        <div className="px-6 py-6">
          <MembersTabWithErrorBoundary />
        </div>
      </div>
    </MainLayout>
  );
};

export default Members;

