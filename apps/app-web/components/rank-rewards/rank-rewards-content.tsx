'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Award,
  Gift,
  Star,
  TrendingUp,
  Users,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import RankVisualization from './rank-visualization';
import { cn } from '@/lib/utils';

export default function RankRewardsContent() {
  const { user, isLoading: authLoading } = useAuth();

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-[#e6f7fa] to-[#c5edf3] dark:from-gray-900 dark:to-gray-800 rounded-xl border border-[#c5edf3] dark:border-gray-700 overflow-hidden shadow-sm">
        <Tabs defaultValue="ranks" className="w-full">
          <div className="px-6 pt-6 pb-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  Membership Program
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Track your progress and earn exclusive rewards
                </p>
              </div>

              <div className="flex items-center gap-2 self-start">
                <TabsList className="h-10 bg-white/80 dark:bg-gray-800/80 p-1 rounded-lg shadow-sm">
                  <TabsTrigger
                    value="ranks"
                    className="px-5 h-8 text-sm font-medium data-[state=active]:bg-[#0C99B4] data-[state=active]:text-white dark:data-[state=active]:bg-[#0a7b91] rounded-md transition-all"
                  >
                    <Award className="mr-2 h-4 w-4" />
                    <span>Ranks</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="rewards"
                    className="px-5 h-8 text-sm font-medium data-[state=active]:bg-[#0C99B4] data-[state=active]:text-white dark:data-[state=active]:bg-[#0a7b91] rounded-md transition-all"
                  >
                    <Gift className="mr-2 h-4 w-4" />
                    <span>Rewards</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
          </div>

          <TabsContent value="ranks" className="animate-in fade-in-50">
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <RankOverview />
                </div>
                <div className="lg:col-span-2">
                  <RankBenefits />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rewards" className="animate-in fade-in-50">
            <div className="px-6 pb-6">
              <RewardsOverview />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function RankOverview() {
  // Mock data - in a real app, this would come from an API
  const currentRank = 'Gold';
  const nextRank = 'Platinum';
  const pointsToNextRank = 250;
  const totalPoints = 750;
  const requiredPoints = 1000;
  const progress = Math.round((totalPoints / requiredPoints) * 100);

  return (
    <div className="h-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-500 rounded-full opacity-20 animate-pulse"></div>
              <div className="relative p-2 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full">
                <Award className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium">{currentRank} Member</h3>
              <p className="text-xs text-gray-500">Since May 2025</p>
            </div>
          </div>
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-medium">
            {currentRank}
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Progress to {nextRank}
            </span>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {totalPoints} / {requiredPoints}
            </span>
          </div>
          <div className="relative pt-1">
            <Progress
              value={progress}
              className="h-2 bg-gray-200 dark:bg-gray-700"
            />
            <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2">
              <div className="w-3 h-3 rounded-full bg-yellow-500 border-2 border-white dark:border-gray-900"></div>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium text-yellow-600 dark:text-yellow-400">
              {pointsToNextRank}
            </span>{' '}
            more points to reach {nextRank}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-3.5 w-3.5 text-yellow-500" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Total Points
              </span>
            </div>
            <p className="text-xl font-bold mt-1 text-yellow-600 dark:text-yellow-400">
              {totalPoints}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors">
            <div className="flex items-center space-x-2">
              <Users className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Network Size
              </span>
            </div>
            <p className="text-xl font-bold mt-1 text-blue-600 dark:text-blue-400">
              7
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RankBenefits() {
  const ranks = [
    {
      name: 'Bronze',
      colorClass: {
        icon: 'text-amber-700',
        bg: 'bg-amber-100',
        border: 'border-amber-200',
        activeBorder: 'border-amber-500',
        activeBg: 'bg-amber-50',
        text: 'text-amber-700',
        darkBg: 'dark:bg-amber-900/30',
        darkText: 'dark:text-amber-400',
        darkBorder: 'dark:border-amber-800/50',
      },
      icon: <Award className="h-4 w-4" />,
      benefits: [
        '5% discount on all products',
        'Access to basic health content',
        'Standard shipping rates',
        '10% commission on direct sales',
      ],
      pointsRequired: 0,
    },
    {
      name: 'Silver',
      colorClass: {
        icon: 'text-slate-500',
        bg: 'bg-slate-100',
        border: 'border-slate-200',
        activeBorder: 'border-slate-500',
        activeBg: 'bg-slate-50',
        text: 'text-slate-700',
        darkBg: 'dark:bg-slate-900/30',
        darkText: 'dark:text-slate-400',
        darkBorder: 'dark:border-slate-800/50',
      },
      icon: <Award className="h-4 w-4" />,
      benefits: [
        '10% discount on all products',
        'Access to premium health content',
        'Reduced shipping rates',
        '20% commission on direct sales',
        '5% commission on indirect sales',
      ],
      pointsRequired: 250,
    },
    {
      name: 'Gold',
      colorClass: {
        icon: 'text-yellow-500',
        bg: 'bg-yellow-100',
        border: 'border-yellow-200',
        activeBorder: 'border-yellow-500',
        activeBg: 'bg-yellow-50',
        text: 'text-yellow-700',
        darkBg: 'dark:bg-yellow-900/30',
        darkText: 'dark:text-yellow-400',
        darkBorder: 'dark:border-yellow-800/50',
      },
      icon: <Award className="h-4 w-4" />,
      benefits: [
        '15% discount on all products',
        'Full access to all health content',
        'Free shipping on orders over $50',
        '30% commission on direct sales',
        '10% commission on indirect sales',
        'Priority customer support',
      ],
      pointsRequired: 500,
      current: true,
    },
    {
      name: 'Platinum',
      colorClass: {
        icon: 'text-blue-500',
        bg: 'bg-blue-100',
        border: 'border-blue-200',
        activeBorder: 'border-blue-500',
        activeBg: 'bg-blue-50',
        text: 'text-blue-700',
        darkBg: 'dark:bg-blue-900/30',
        darkText: 'dark:text-blue-400',
        darkBorder: 'dark:border-blue-800/50',
      },
      icon: <Award className="h-4 w-4" />,
      benefits: [
        '20% discount on all products',
        'Full access to all health content',
        'Free shipping on all orders',
        '30% commission on direct sales',
        '10% commission on indirect sales',
        '5% commission on third-level sales',
        'VIP customer support',
        'Early access to new products',
      ],
      pointsRequired: 1000,
    },
  ];

  const [selectedView, setSelectedView] = useState('all');

  // Filter ranks based on selected view
  const filteredRanks =
    selectedView === 'all'
      ? ranks
      : selectedView === 'current'
        ? ranks.filter((rank) => rank.current)
        : ranks.filter((rank) => rank.name === 'Platinum'); // Next rank after Gold

  return (
    <div className="h-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Rank Benefits</h3>
          <p className="text-xs text-gray-500">
            Unlock more benefits as you rank up
          </p>
        </div>
        <Select value={selectedView} onValueChange={setSelectedView}>
          <SelectTrigger className="w-[120px] h-8 text-sm">
            <SelectValue placeholder="View" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ranks</SelectItem>
            <SelectItem value="current">Current</SelectItem>
            <SelectItem value="next">Next Rank</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden p-4">
        <div className="flex overflow-x-auto pb-2 -mx-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {filteredRanks.map((rank, index) => {
            const isCurrentRank = rank.current;
            const { colorClass } = rank;

            return (
              <div
                key={rank.name}
                className={cn(
                  'flex-shrink-0 w-[230px] rounded-lg border mx-1 transition-all',
                  isCurrentRank
                    ? `${colorClass.activeBorder} ${colorClass.activeBg}`
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                )}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-2 rounded-full ${colorClass.bg} ${colorClass.darkBg}`}
                      >
                        <span className={colorClass.icon}>{rank.icon}</span>
                      </div>
                      <h3 className="font-medium text-sm">{rank.name}</h3>
                    </div>
                    <div className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full font-medium text-gray-700 dark:text-gray-300">
                      {rank.pointsRequired}p
                    </div>
                  </div>

                  <div className="space-y-2 mt-2">
                    {rank.benefits.slice(0, 4).map((benefit, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Zap className="h-3.5 w-3.5 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          {benefit}
                        </span>
                      </div>
                    ))}
                    {rank.benefits.length > 4 && (
                      <Button
                        variant="link"
                        size="sm"
                        className="text-xs h-6 px-0 py-0 text-blue-600 dark:text-blue-400"
                      >
                        +{rank.benefits.length - 4} more benefits
                      </Button>
                    )}
                  </div>

                  {isCurrentRank && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <Badge
                        className={
                          'text-xs bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800/50'
                        }
                      >
                        Current Rank
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RewardsOverview() {
  // Mock data - in a real app, this would come from an API
  const availablePoints = 750;
  const totalEarned = 1250;
  const rewardsRedeemed = 3;

  // Available rewards data
  const availableRewards = [
    { name: '$10 Store Credit', points: 200, image: '🎁' },
    { name: 'Free Shipping (1 month)', points: 300, image: '🚚' },
    { name: 'Premium Membership (1 month)', points: 500, image: '⭐' },
    { name: 'Health Consultation', points: 1000, image: '🩺' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Points Overview Card */}
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-sm font-medium">
                Points Overview
              </CardTitle>
              <CardDescription className="text-xs text-gray-500">
                Your points and activity
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="h-8 text-sm">
              <Gift className="mr-1.5 h-3.5 w-3.5" /> Redeem Points
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-950/40 dark:to-amber-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-900/50">
              <div className="flex items-center space-x-1.5">
                <Star className="h-3.5 w-3.5 text-yellow-500" />
                <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400">
                  Available
                </span>
              </div>
              <p className="text-xl font-bold mt-1 text-yellow-700 dark:text-yellow-400">
                {availablePoints}
              </p>
            </div>

            <div className="bg-muted/50 p-3 rounded-lg border border-border/50">
              <div className="flex items-center space-x-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-[#0C99B4]" />
                <span className="text-xs font-medium">Total</span>
              </div>
              <p className="text-xl font-bold mt-1 text-[#0C99B4] dark:text-[#35b4ca]">
                {totalEarned}
              </p>
            </div>

            <div className="bg-muted/50 p-3 rounded-lg border border-border/50">
              <div className="flex items-center space-x-1.5">
                <Gift className="h-3.5 w-3.5 text-purple-500" />
                <span className="text-xs font-medium">Redeemed</span>
              </div>
              <p className="text-xl font-bold mt-1 text-purple-600 dark:text-purple-400">
                {rewardsRedeemed}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Recent Activity</h3>
              <Button variant="ghost" size="sm" className="h-6 text-xs px-2">
                View All
              </Button>
            </div>
            <div className="space-y-1 max-h-[180px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
              {[
                {
                  description: 'Commission from order #1234',
                  points: 150,
                  date: 'May 12, 2025',
                },
                {
                  description: 'Rank upgrade bonus',
                  points: 100,
                  date: 'May 5, 2025',
                },
                {
                  description: 'Referral bonus - New member',
                  points: 50,
                  date: 'Apr 28, 2025',
                },
                {
                  description: 'Commission from order #1187',
                  points: 75,
                  date: 'Apr 15, 2025',
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0"
                >
                  <div>
                    <p className="text-xs font-medium">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.date}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-xs text-[#0C99B4] h-5 px-1.5"
                  >
                    +{activity.points}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Rewards Card */}
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-sm font-medium">
                Available Rewards
              </CardTitle>
              <CardDescription className="text-xs text-gray-500">
                Redeem your points for rewards
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-sm">
              <Star className="mr-1.5 h-3.5 w-3.5 text-yellow-500" />{' '}
              {availablePoints} points
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableRewards.map((reward, index) => (
              <div
                key={index}
                className="border rounded-lg p-3 hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl">{reward.image}</div>
                    <div>
                      <h4 className="text-sm font-medium group-hover:text-primary transition-colors">
                        {reward.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {reward.points} points
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Redeem
                  </Button>
                </div>
                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-primary ${availablePoints >= reward.points ? 'opacity-100' : 'opacity-40'}`}
                    style={{
                      width: `${Math.min(100, (availablePoints / reward.points) * 100)}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs mt-1 text-right">
                  {availablePoints >= reward.points ? (
                    <span className="text-[#0C99B4] dark:text-[#35b4ca]">
                      Available to redeem
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      Need {reward.points - availablePoints} more points
                    </span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
