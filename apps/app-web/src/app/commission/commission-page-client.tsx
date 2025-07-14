'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatPrice } from '@/lib/utils';
import { TrendingUp, Users, Gift, QrCode } from 'lucide-react';
import CommissionNetwork from '@/components/commission/commission-network';
import CommissionHistory from '@/components/commission/commission-history';
import ReferralLink from '@/components/commission/referral-link';
import CommissionStructure from '@/components/commission/commission-structure';

interface CommissionPageClientProps {
  user: any;
  processedCommissions: any[];
  totalEarnings: number;
  referralLink: string;
  products?: any[];
  achievements?: any[];
}

export default function CommissionPageClient({
  user,
  processedCommissions,
  totalEarnings,
  referralLink,
  products = [],
  achievements = [],
}: CommissionPageClientProps) {
  // Calculate user sales from commissions
  const userSales = processedCommissions
    .filter(c => c.relationshipLevel === 0) // Direct sales only
    .reduce((sum, c) => sum + (c.amount / (c.commissionRate / 100)), 0);
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-2xl font-bold">
              {formatPrice(totalEarnings)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {processedCommissions.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-2xl font-bold">
              {user?.downlines?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Direct downline members
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Points Balance
            </CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Earned from indirect sales
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referral Link</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="text-sm font-medium truncate">
              {referralLink ? 'Ready to share' : 'Not available'}
            </div>
            <p className="text-xs text-muted-foreground">
              Scan QR code to join
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Tabs defaultValue="network" className="space-y-4">
          <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
            <TabsTrigger
              value="network"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium"
            >
              Network
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium"
            >
              Commission History
            </TabsTrigger>
            <TabsTrigger
              value="structure"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium"
            >
              Commission Structure
            </TabsTrigger>
            <TabsTrigger
              value="referral"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium"
            >
              Referral Program
            </TabsTrigger>
          </TabsList>

          <TabsContent value="network" className="space-y-4 mt-2">
            <CommissionNetwork
              upline={user?.upline || null}
              downlines={user?.downlines || []}
              referralLink={referralLink}
              currentUser={user}
              userSales={userSales}
              commissions={processedCommissions}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-2">
            <CommissionHistory commissions={processedCommissions} />
          </TabsContent>

          <TabsContent value="structure" className="space-y-4 mt-2">
            <CommissionStructure products={products} achievements={achievements} />
          </TabsContent>

          <TabsContent value="referral" className="space-y-4 mt-2">
            <ReferralLink referralLink={referralLink} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
