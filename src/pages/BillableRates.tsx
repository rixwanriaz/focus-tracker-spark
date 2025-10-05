import React from 'react';
import { MainLayout } from '@/components/Layout';

const BillableRates: React.FC = () => {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <h1 className="text-3xl font-bold mb-4">Billable Rates</h1>
        <p className="text-gray-400">Configure billable rates for projects and members.</p>
      </div>
    </MainLayout>
  );
};

export default BillableRates;

