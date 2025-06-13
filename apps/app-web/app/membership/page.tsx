'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMembership } from '@/hooks/use-membership';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';
import {
  Loader2,
  Check,
  X,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Star,
  Shield,
  Truck,
  BadgePercent,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const MembershipLevels = dynamic(
  () => import('@/components/MembershipLevels'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] bg-gray-100 rounded-lg animate-pulse"></div>
    ),
  }
);

// Use dynamic import with SSR disabled to prevent hydration errors
export default dynamic(() => Promise.resolve(MembershipPage), {
  ssr: false,
});

function MembershipPage() {
  const router = useRouter();
  const [membershipTiers, setMembershipTiers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const { membership, refreshMembership } = useMembership();

  // Fetch membership tiers from API
  useEffect(() => {
    async function fetchMembershipTiers() {
      try {
        const response = await fetch('/api/membership-tiers');

        if (!response.ok) {
          throw new Error('Failed to fetch membership tiers');
        }

        const data = await response.json();
        setMembershipTiers(data);
      } catch (error) {
        console.error('Error fetching membership tiers:', error);
        setMembershipTiers([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMembershipTiers();
  }, []);

  // Handle membership actions (join or upgrade)
  const handleMembershipAction = async (tierName: string) => {
    if (!tierName) return;

    try {
      if (tierName === 'level7') {
        setIsJoining(true);

        // Create new membership
        const response = await fetch('/api/membership/join', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tier: tierName }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to join membership');
        }

        // Refresh membership data
        await refreshMembership();

        toast.success('Successfully joined Level 7 tier!');

        // Redirect to profile
        router.push('/profile');
      } else if (tierName.startsWith('level')) {
        setIsUpgrading(true);

        // Check if user has a membership
        if (!membership) {
          toast.error('You need to join Level 7 tier first');
          setIsUpgrading(false);
          return;
        }

        // Check if eligible for upgrade based on current tier and points
        let requiredPoints = 0;
        let nextTier = '';

        switch (membership.tier) {
          case 'level7':
            requiredPoints = 100;
            nextTier = 'level6';
            break;
          case 'level6':
            requiredPoints = 200;
            nextTier = 'level5';
            break;
          case 'level5':
            requiredPoints = 400;
            nextTier = 'level4';
            break;
          case 'level4':
            requiredPoints = 1000;
            nextTier = 'level3';
            break;
          default:
            // No automatic upgrades for level3 and above
            toast.info('You have already reached a discount-based tier');
            setIsUpgrading(false);
            return;
        }

        if (membership.points < requiredPoints) {
          toast.error(
            `You need ${requiredPoints} points to upgrade to ${nextTier}`
          );
          setIsUpgrading(false);
          return;
        }

        // Upgrade membership
        const response = await fetch('/api/membership/current', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tier: tierName }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to upgrade membership');
        }

        // Refresh membership data
        await refreshMembership();

        toast.success(`Successfully upgraded to ${tierName}!`);

        // Redirect to profile
        router.push('/profile');
      }
    } catch (error) {
      console.error('Error handling membership action:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to process membership action'
      );
    } finally {
      setIsJoining(false);
      setIsUpgrading(false);
    }
  };

  // If API fails, use default tiers
  const tiers =
    membershipTiers.length > 0
      ? membershipTiers
      : [
          {
            name: 'Level 1',
            price: 'Top Tier',
            description: 'Premium membership with maximum benefits',
            features: [
              { name: 'Discount on all products', value: '30%' },
              { name: 'Discount on partner services', value: '25%' },
              { name: 'Free shipping', value: 'All orders' },
              { name: 'Member-only offers', value: true },
              { name: 'Monthly free gift claim', value: 'Premium gifts' },
              { name: 'Family sharing', value: 'Up to 5 members' },
              { name: 'Priority bookings', value: true },
              { name: 'Early access to promotions', value: true },
            ],
            cta: 'Contact Support to Upgrade',
            popular: true,
          },
          {
            name: 'Level 2',
            price: 'Premium Tier',
            description: 'Enhanced benefits with significant discounts',
            features: [
              { name: 'Discount on all products', value: '10%' },
              { name: 'Discount on partner services', value: '10%' },
              { name: 'Free shipping', value: 'All orders' },
              { name: 'Member-only offers', value: true },
              { name: 'Monthly free gift claim', value: 'Premium gifts' },
              { name: 'Family sharing', value: 'Up to 3 members' },
              { name: 'Priority bookings', value: true },
              { name: 'Early access to promotions', value: true },
            ],
            cta: 'Contact Support to Upgrade',
            popular: false,
          },
          {
            name: 'Level 3',
            price: 'Advanced Tier',
            description: 'Improved benefits with better discounts',
            features: [
              { name: 'Discount on all products', value: '5%' },
              { name: 'Discount on partner services', value: '5%' },
              { name: 'Free shipping', value: 'Orders over $50' },
              { name: 'Member-only offers', value: true },
              { name: 'Monthly free gift claim', value: 'Standard gifts' },
              { name: 'Family sharing', value: 'Up to 2 members' },
              { name: 'Priority bookings', value: false },
              { name: 'Early access to promotions', value: true },
            ],
            cta: 'Requires 1000 Points',
            popular: false,
          },
          {
            name: 'Level 4',
            price: 'Intermediate Tier',
            description: 'Unlock with 1000 points',
            features: [
              { name: 'Discount on select products', value: '3%' },
              { name: 'Discount on partner services', value: '2%' },
              { name: 'Free shipping', value: 'Orders over $75' },
              { name: 'Member-only offers', value: true },
              { name: 'Monthly free gift claim', value: 'Basic gifts' },
              { name: 'Family sharing', value: false },
              { name: 'Priority bookings', value: false },
              { name: 'Early access to promotions', value: false },
            ],
            cta: 'Requires 1000 Points',
            popular: false,
          },
          {
            name: 'Level 5',
            price: 'Standard Tier',
            description: 'Unlock with 400 points',
            features: [
              { name: 'Discount on select products', value: '2%' },
              { name: 'Discount on partner services', value: '1%' },
              { name: 'Free shipping', value: 'Orders over $100' },
              { name: 'Member-only offers', value: true },
              { name: 'Monthly free gift claim', value: 'Basic gifts' },
              { name: 'Family sharing', value: false },
              { name: 'Priority bookings', value: false },
              { name: 'Early access to promotions', value: false },
            ],
            cta: 'Requires 400 Points',
            popular: false,
          },
          {
            name: 'Level 6',
            price: 'Basic Tier',
            description: 'Unlock with 200 points',
            features: [
              { name: 'Discount on select products', value: '1%' },
              { name: 'Discount on partner services', value: '0.5%' },
              { name: 'Free shipping', value: 'Orders over $150' },
              { name: 'Member-only offers', value: true },
              { name: 'Monthly free gift claim', value: false },
              { name: 'Family sharing', value: false },
              { name: 'Priority bookings', value: false },
              { name: 'Early access to promotions', value: false },
            ],
            cta: 'Requires 200 Points',
            popular: false,
          },
          {
            name: 'Level 7',
            price: 'Starter Tier',
            description: 'Entry level membership',
            features: [
              { name: 'Discount on select products', value: '0.5%' },
              { name: 'Discount on partner services', value: '0%' },
              { name: 'Free shipping', value: 'No' },
              { name: 'Member-only offers', value: false },
              { name: 'Monthly free gift claim', value: false },
              { name: 'Family sharing', value: false },
              { name: 'Priority bookings', value: false },
              { name: 'Early access to promotions', value: false },
            ],
            cta: 'Join Now',
            popular: false,
          },
        ];

  return (
    <div className="container mx-auto px-4 py-6 md:px-6">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold mb-2">GrabHealth AI Membership</h1>
        <p className="text-gray-600 text-sm max-w-2xl mx-auto">
          Unlock exclusive health benefits and discounts on products and
          services
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        <h2 className="text-lg font-bold mb-3 text-center">
          Membership Benefits
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="text-base font-semibold mb-2">Premium Upgrade</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 text-sm">
              <li>Regular purchases (3 months)</li>
              <li>Invite 5 Essential members</li>
              <li>Participate in surveys</li>
              <li>Use partner labs (2× in 6 mo)</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="text-base font-semibold mb-2">Monthly Gifts</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 text-sm">
              <li>Essential: vitamins, sanitizers</li>
              <li>Premium: supplements, devices</li>
              <li>One claim per month</li>
              <li>Find outlets via app</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="text-base font-semibold mb-2">Partner Benefits</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-600 text-sm">
              <li>Discounted lab tests</li>
              <li>Priority appointments</li>
              <li>Special pricing on prescriptions</li>
              <li>Reduced consultation rates</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-5 mb-4">
        <MembershipLevels />
      </div>
    </div>
  );
}
