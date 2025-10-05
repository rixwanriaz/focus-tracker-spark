import React from 'react';
import { MainLayout } from '@/components/Layout';

const Approvals: React.FC = () => {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <h1 className="text-3xl font-bold mb-4">Approvals</h1>
        <p className="text-gray-400">Manage time entry approvals.</p>
      </div>
    </MainLayout>
  );
};

export default Approvals;

