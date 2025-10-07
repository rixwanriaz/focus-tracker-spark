import React, { useState } from 'react';
import { Check, CreditCard, Calendar, Users, Zap, Crown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    members: number;
    projects: number;
    storage: string;
  };
  popular?: boolean;
}

const SubscriptionTab: React.FC = () => {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');

  // Mock data - this would come from API
  const currentPlan = {
    name: 'Pro',
    price: 12,
    interval: 'month' as const,
    nextBilling: '2024-02-15',
    usage: {
      members: 8,
      projects: 15,
      storage: 2.5, // GB
    },
    limits: {
      members: 10,
      projects: 25,
      storage: 5, // GB
    },
  };

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      interval: 'month',
      features: [
        'Up to 3 projects',
        'Up to 2 team members',
        'Basic time tracking',
        'Email support',
      ],
      limits: {
        members: 2,
        projects: 3,
        storage: '1 GB',
      },
    },
    {
      id: 'pro',
      name: 'Pro',
      price: billingInterval === 'month' ? 12 : 120,
      interval: billingInterval,
      features: [
        'Unlimited projects',
        'Up to 10 team members',
        'Advanced time tracking',
        'Project templates',
        'Priority support',
        'API access',
      ],
      limits: {
        members: 10,
        projects: 999,
        storage: '5 GB',
      },
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: billingInterval === 'month' ? 25 : 250,
      interval: billingInterval,
      features: [
        'Everything in Pro',
        'Unlimited team members',
        'Advanced analytics',
        'Custom integrations',
        'SSO & SAML',
        'Dedicated support',
        'Custom branding',
      ],
      limits: {
        members: 999,
        projects: 999,
        storage: '50 GB',
      },
    },
  ];

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Subscription</h2>
          <p className="text-gray-400 text-sm">Manage your subscription and billing</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={billingInterval === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setBillingInterval('month')}
            className={billingInterval === 'month' ? 'bg-purple-600 hover:bg-purple-700' : 'border-gray-600 text-gray-300'}
          >
            Monthly
          </Button>
          <Button
            variant={billingInterval === 'year' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setBillingInterval('year')}
            className={billingInterval === 'year' ? 'bg-purple-600 hover:bg-purple-700' : 'border-gray-600 text-gray-300'}
          >
            Yearly
            <Badge className="ml-2 bg-green-600 text-white text-xs">Save 17%</Badge>
          </Button>
        </div>
      </div>

      {/* Current Plan */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Crown className="h-5 w-5" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">{currentPlan.name}</h3>
              <p className="text-gray-400">
                ${currentPlan.price}/{currentPlan.interval} • Next billing: {currentPlan.nextBilling}
              </p>
            </div>
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              <CreditCard className="mr-2 h-4 w-4" />
              Manage Billing
            </Button>
          </div>

          {/* Usage Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Team Members</span>
                <span className="text-sm text-white">
                  {currentPlan.usage.members}/{currentPlan.limits.members}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(currentPlan.usage.members, currentPlan.limits.members)} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Projects</span>
                <span className="text-sm text-white">
                  {currentPlan.usage.projects}/{currentPlan.limits.projects}
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(currentPlan.usage.projects, currentPlan.limits.projects)} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Storage</span>
                <span className="text-sm text-white">
                  {currentPlan.usage.storage}GB/{currentPlan.limits.storage}GB
                </span>
              </div>
              <Progress 
                value={getUsagePercentage(currentPlan.usage.storage, currentPlan.limits.storage)} 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors relative ${
                plan.popular ? 'ring-2 ring-purple-600' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-600 text-white">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-white">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-white">
                  ${plan.price}
                  <span className="text-lg text-gray-400">/{plan.interval}</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-300">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <div className="pt-4">
                  <Button 
                    className={`w-full ${
                      plan.id === 'pro' 
                        ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                        : 'bg-gray-800 hover:bg-gray-700 text-white'
                    }`}
                    disabled={plan.id === 'pro'} // Current plan
                  >
                    {plan.id === 'pro' ? 'Current Plan' : 'Upgrade'}
                    {plan.id !== 'pro' && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5" />
            Billing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: '2024-01-15', amount: '$12.00', status: 'Paid', invoice: 'INV-001' },
              { date: '2023-12-15', amount: '$12.00', status: 'Paid', invoice: 'INV-002' },
              { date: '2023-11-15', amount: '$12.00', status: 'Paid', invoice: 'INV-003' },
            ].map((payment, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-b-0">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-white font-medium">{payment.date}</div>
                    <div className="text-gray-400 text-sm">{payment.invoice}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-white font-medium">{payment.amount}</div>
                  <Badge className="bg-green-600 text-white">{payment.status}</Badge>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enterprise Contact */}
      <Card className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-800">
        <CardContent className="p-6 text-center">
          <Zap className="h-12 w-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Need Enterprise Features?</h3>
          <p className="text-gray-400 mb-4">
            Get custom solutions, dedicated support, and advanced security features for large organizations.
          </p>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            Contact Sales
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export { SubscriptionTab };
