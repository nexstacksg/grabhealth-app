'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Award,
  Gift,
  ShoppingBag,
  CreditCard,
  Users,
  ChevronRight,
  Star,
  Share2,
  CopyIcon,
} from 'lucide-react';
// import { useMembership } from '@/contexts/MembershipContext';
import QRCode from 'react-qr-code';
import { toast } from 'sonner';

interface MembershipProfileProps {
  showTitle?: boolean;
}

export function MembershipProfile({}: MembershipProfileProps) {
  // Temporarily mock the membership data until MembershipContext is implemented
  const membership = { id: 'user1', tier: 'ESSENTIAL', points: 100 };
  const isLoading = false;
  const tierDiscount = 10;
  const pointsToNextTier = 400;

  const [copied, setCopied] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  // Get the referral link URL
  const getReferralUrl = () => {
    const baseUrl =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://grab-health-ai.vercel.app';
    // Use user ID from membership if available, otherwise use a generic code or session ID if possible
    return `${baseUrl}/auth/register?referrer=${membership?.id || 'user1'}`;
  };

  // Copy referral link to clipboard
  const copyToClipboard = async () => {
    try {
      if (typeof navigator === 'undefined') return;

      await navigator.clipboard.writeText(getReferralUrl());
      setCopied(true);
      toast.success('Referral link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast.error('Failed to copy link');
    }
  };

  // Share referral link
  const shareLink = async () => {
    if (typeof navigator === 'undefined') return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my GrabHealth network',
          text: 'Sign up using my referral link to join my network!',
          url: getReferralUrl(),
        });
        toast.success('Link shared successfully!');
      } catch (err) {
        // Don't show error for user cancellation
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Error sharing:', err);
          toast.error("Couldn't share link. Copying to clipboard instead.");
          // Fall back to clipboard
          copyToClipboard();
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      copyToClipboard();
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Your Membership</CardTitle>
              <CardDescription>
                Loading your membership details...
              </CardDescription>
            </div>
          </div>

          {/* QR Code Section - Available even during loading */}
          <div className="mt-6 flex justify-center">
            <div className="flex flex-col items-center">
              <div
                className="bg-white p-6 rounded-lg border shadow-sm"
                ref={qrCodeRef}
              >
                <div className="h-64 w-64 flex items-center justify-center">
                  <QRCode
                    size={240}
                    value={getReferralUrl()}
                    fgColor="#2563eb"
                    bgColor="#ffffff"
                    level="H"
                  />
                </div>
              </div>
              <p className="text-base font-medium text-center mt-4 text-emerald-700">
                Scan to join our network
              </p>

              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1"
                  onClick={copyToClipboard}
                >
                  <CopyIcon className="h-4 w-4" />
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>
                <Button
                  size="sm"
                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700"
                  onClick={shareLink}
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-emerald-500 rounded-full border-t-transparent"></div>
            <span className="ml-2 text-sm text-muted-foreground">
              Loading membership details...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!membership) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Your Membership</CardTitle>
            </div>
          </div>

          {/* QR Code Section - Available for all users */}
          <div className="mt-6 flex justify-center">
            <div className="flex flex-col items-center">
              <div
                className="bg-white p-6 rounded-lg border shadow-sm"
                ref={qrCodeRef}
              >
                <div className="h-64 w-64 flex items-center justify-center">
                  <QRCode
                    size={240}
                    value={getReferralUrl()}
                    fgColor="#2563eb"
                    bgColor="#ffffff"
                    level="H"
                  />
                </div>
              </div>
              <p className="text-base font-medium text-center mt-4 text-emerald-700">
                Scan to join our network
              </p>

              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1"
                  onClick={copyToClipboard}
                >
                  <CopyIcon className="h-4 w-4" />
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>
                <Button
                  size="sm"
                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700"
                  onClick={shareLink}
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center py-4">
            <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No Membership Found
            </h3>
            <p className="text-gray-500 mb-4">
              You need to be logged in and have a membership to view additional
              benefits.
            </p>
            <div className="flex justify-center gap-2">
              <Link href="/auth/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/membership">
                <Button>Join Now</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate progress percentage
  const progressPercentage =
    membership.tier === 'level1' ||
    membership.tier === 'level2' ||
    membership.tier === 'level3'
      ? 100
      : Math.min(100, (membership.points / 500) * 100);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Your Membership</CardTitle>
            <CardDescription>
              View your benefits and membership status
            </CardDescription>
          </div>
          <Badge
            className={`${
              membership.tier === 'level1' ||
              membership.tier === 'level2' ||
              membership.tier === 'level3'
                ? 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
            } px-3 py-1 text-xs font-medium rounded-full`}
          >
            {membership.tier === 'level1' ||
            membership.tier === 'level2' ||
            membership.tier === 'level3'
              ? 'Premium'
              : 'Essential'}{' '}
            Tier
          </Badge>
        </div>

        {/* QR Code Section */}
        <div className="mt-6 flex justify-center">
          <div className="flex flex-col items-center">
            <div
              className="bg-white p-6 rounded-lg border shadow-sm"
              ref={qrCodeRef}
            >
              <div className="h-64 w-64 flex items-center justify-center">
                <QRCode
                  size={240}
                  value={getReferralUrl()}
                  fgColor="#2563eb"
                  bgColor="#ffffff"
                  level="H"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
                onClick={copyToClipboard}
              >
                <CopyIcon className="h-4 w-4" />
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
              <Button
                size="sm"
                className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700"
                onClick={shareLink}
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Points Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium">Membership Points</div>
              <div className="text-sm font-medium">
                {membership.points} points
              </div>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            {(membership.tier === 'level4' ||
              membership.tier === 'level5' ||
              membership.tier === 'level6' ||
              membership.tier === 'level7') && (
              <div className="text-xs text-muted-foreground">
                {pointsToNextTier} more points needed to upgrade to Premium
              </div>
            )}
            {(membership.tier === 'level1' ||
              membership.tier === 'level2' ||
              membership.tier === 'level3') && (
              <div className="text-xs text-muted-foreground flex items-center">
                <Star className="h-3 w-3 text-amber-500 mr-1" />
                Premium tier unlocked
              </div>
            )}
          </div>

          <Separator />

          {/* Current Benefits */}
          <div>
            <h4 className="text-sm font-medium mb-3">Your Benefits</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <ShoppingBag className="h-5 w-5 text-emerald-500 mr-3" />
                <div>
                  <div className="text-sm font-medium">Product Discount</div>
                  <div className="text-xs text-muted-foreground">
                    {tierDiscount * 100}% off on health products
                  </div>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <CreditCard className="h-5 w-5 text-emerald-500 mr-3" />
                <div>
                  <div className="text-sm font-medium">Lab Test Discount</div>
                  <div className="text-xs text-muted-foreground">
                    {membership.tier === 'level1' ||
                    membership.tier === 'level2' ||
                    membership.tier === 'level3'
                      ? '15-20%'
                      : '5%'}{' '}
                    off on partner lab tests
                  </div>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Gift className="h-5 w-5 text-emerald-500 mr-3" />
                <div>
                  <div className="text-sm font-medium">Monthly Gift</div>
                  <div className="text-xs text-muted-foreground">
                    {membership.tier === 'level1' ||
                    membership.tier === 'level2' ||
                    membership.tier === 'level3'
                      ? 'Premium'
                      : 'Basic'}{' '}
                    monthly gift
                  </div>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Users className="h-5 w-5 text-emerald-500 mr-3" />
                <div>
                  <div className="text-sm font-medium">Family Sharing</div>
                  <div className="text-xs text-muted-foreground">
                    {membership.tier === 'level1' ||
                    membership.tier === 'level2' ||
                    membership.tier === 'level3'
                      ? 'Up to 4 members'
                      : 'Not available'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Referral Program Section - Highlighted */}
          <div>
            <h4 className="text-base font-semibold mb-3 flex items-center">
              <Users className="h-5 w-5 text-amber-500 mr-2" />
              Referral Program
            </h4>

            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-5 rounded-lg border-2 border-emerald-200 shadow-sm">
              <div className="flex flex-col space-y-4">
                <div>
                  <h5 className="text-lg font-medium text-emerald-800">
                    Invite Friends & Earn Rewards!
                  </h5>
                  <p className="text-sm text-emerald-700 mt-1">
                    Share your personal QR code above and earn up to{' '}
                    <span className="font-bold">30%</span> commission on
                    purchases!
                  </p>
                </div>

                <Link href="/commission" className="block w-full">
                  <Button
                    size="lg"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                  >
                    View Full Commission Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-1 pb-4 px-6">
        <Link
          href="/membership"
          className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center w-full justify-center"
        >
          View All Membership Benefits
          <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
      </CardFooter>
    </Card>
  );
}
