import React from 'react';
import { MainLayout } from '@/components/Layout';

const Goals: React.FC = () => {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-3xl font-bold">Goals</h1>
          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full font-medium">
            BETA
          </span>
        </div>
        <p className="text-gray-400">Set and track your time tracking goals.</p>
      </div>
    </MainLayout>
  );
};

export default Goals;

