'use client';

import React from 'react';
import { useCommission } from './commission-provider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Users,
  TrendingUp,
  Gift,
  QrCode,
  DollarSign,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import CommissionNetwork from './commission-network';
import CommissionHistory from './commission-history';
import ReferralLink from './referral-link';
import CommissionStructure from './commission-structure';

function CommissionDashboard() {
  const {
    upline,
    downlines,
    commissions,
    points,
    referralLink,
    totalEarnings,
    isLoading,
    error,
    refreshCommissionData,
  } = useCommission();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading commission data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => refreshCommissionData()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(totalEarnings)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {commissions.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{downlines.length}</div>
            <p className="text-xs text-muted-foreground">
              Direct downline members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Points Balance
            </CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{points}</div>
            <p className="text-xs text-muted-foreground">
              Earned from indirect sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referral Link</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium truncate">
              {referralLink ? 'Ready to share' : 'Not available'}
            </div>
            <p className="text-xs text-muted-foreground">
              Scan QR code to join
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="network" className="space-y-4">
        <div className="block md:hidden">
          <TabsList className="grid grid-cols-2 gap-2 bg-transparent p-0 h-auto">
            <TabsTrigger
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-auto py-2"
              value="network"
            >
              Network
            </TabsTrigger>
            <TabsTrigger
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-auto py-2"
              value="history"
            >
              Commission History
            </TabsTrigger>
            <TabsTrigger
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-auto py-2"
              value="structure"
            >
              Commission Structure
            </TabsTrigger>
            <TabsTrigger
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-auto py-2"
              value="referral"
            >
              Referral Program
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="hidden md:block">
          <TabsList>
            <TabsTrigger value="network">Network</TabsTrigger>
            <TabsTrigger value="history">Commission History</TabsTrigger>
            <TabsTrigger value="structure">Commission Structure</TabsTrigger>
            <TabsTrigger value="referral">Referral Program</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="network" className="space-y-4">
          <CommissionNetwork upline={upline} downlines={downlines} />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <CommissionHistory commissions={commissions} />
        </TabsContent>

        <TabsContent value="structure" className="space-y-4">
          <CommissionStructure />
        </TabsContent>

        <TabsContent value="referral" className="space-y-4">
          <ReferralLink referralLink={referralLink} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Export the component without authentication protection
// We're using server-side authentication in the page component instead
export default CommissionDashboard;
