import React, { useState } from 'react';
import { MainLayout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Wallet } from 'lucide-react';
import Invoices from './Invoices';
import Payouts from './Payouts';

const Financials: React.FC = () => {
  const [activeTab, setActiveTab] = useState('invoices');

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Financials
            </h1>
            <p className="text-gray-400">Manage invoices and payouts in one place</p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-gray-900 border border-gray-800 p-1.5 rounded-xl shadow-lg inline-flex">
              <TabsTrigger 
                value="invoices" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white text-gray-400 px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 font-semibold"
              >
                <FileText className="w-4 h-4" />
                Invoices
              </TabsTrigger>
              <TabsTrigger 
                value="payouts" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white text-gray-400 px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 font-semibold"
              >
                <Wallet className="w-4 h-4" />
                Payouts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="invoices" className="mt-0">
              <Invoices />
            </TabsContent>

            <TabsContent value="payouts" className="mt-0">
              <Payouts />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default Financials;

