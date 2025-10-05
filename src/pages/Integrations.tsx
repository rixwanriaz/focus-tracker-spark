import React from 'react';
import { MainLayout } from '@/components/Layout';

const Integrations: React.FC = () => {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <h1 className="text-3xl font-bold mb-4">Integrations</h1>
        <p className="text-gray-400">Connect with your favorite tools and services.</p>
      </div>
    </MainLayout>
  );
};

export default Integrations;

