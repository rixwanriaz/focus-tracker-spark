import React from 'react';
import { MainLayout } from '@/components/Layout';
import { UserProjectRates } from '@/components/Finance';

const BillableRates: React.FC = () => {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Project Rates</h1>
            <p className="text-gray-400">Set your hourly rates for each project you're working on</p>
          </div>

          {/* User Project Rates Component */}
          <UserProjectRates />
        </div>
      </div>
    </MainLayout>
  );
};

export default BillableRates;

