import React from 'react';
import { MainLayout } from '@/components/Layout';

const Reports: React.FC = () => {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <h1 className="text-3xl font-bold mb-4">Reports</h1>
        <p className="text-gray-400">View and analyze your time tracking reports.</p>
      </div>
    </MainLayout>
  );
};

export default Reports;

