'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CopyIcon, Download, Share2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import QRCode from 'react-qr-code';
import { commissionService } from '@/services';

type ReferralLinkProps = {
  referralLink: string;
};

type CommissionLevel = {
  level: number;
  name: string;
  rate: number;
};

function ReferralLink({ referralLink }: ReferralLinkProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [commissionLevels, setCommissionLevels] = useState<CommissionLevel[]>([]);
  const [isLoadingRates, setIsLoadingRates] = useState(true);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  // Fetch commission structure on mount
  useEffect(() => {
    const fetchCommissionRates = async () => {
      try {
        const structure = await commissionService.getCommissionStructure();
        if (structure && structure.levels && structure.levels.length > 0) {
          setCommissionLevels(structure.levels);
        }
      } catch (error) {
        console.error('Failed to fetch commission rates:', error);
      } finally {
        setIsLoadingRates(false);
      }
    };

    fetchCommissionRates();
  }, []);

  // Copy referral link to clipboard
  const copyToClipboard = async () => {
    try {
      // Only run on client side
      if (typeof navigator === 'undefined') return;

      const displayUrl = getDisplayUrl();
      await navigator.clipboard.writeText(displayUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // Get the display URL for the referral link
  const getDisplayUrl = () => {
    if (referralLink && referralLink.startsWith('http')) {
      return referralLink;
    }
    // Use window check to avoid hydration errors
    const baseUrl =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://grab-health-ai.vercel.app';
    return `${baseUrl}/auth/register?referrer=${referralLink || 'user1'}`;
  };

  // Get just the referral code for the QR code
  const getReferralCode = () => {
    // If it's already a URL, extract the code from the query parameter
    if (referralLink && referralLink.startsWith('http')) {
      try {
        const url = new URL(referralLink);
        return url.searchParams.get('referrer') || referralLink;
      } catch {
        return referralLink;
      }
    }
    // Otherwise just return the code itself
    return referralLink || 'user1';
  };

  // Share referral link
  const shareLink = async () => {
    // Only run on client side
    if (typeof navigator === 'undefined') return;

    const displayUrl = getDisplayUrl();

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my GrabHealth network',
          text: 'Sign up using my referral link to join my network!',
          url: displayUrl,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch (err: any) {
        // Don't show error if user just canceled the share
        if (err.name === 'AbortError' || err.message?.includes('canceled')) {
          console.log('Share canceled by user');
        } else {
          console.error('Error sharing:', err);
          // Fallback to copy if share fails
          try {
            await navigator.clipboard.writeText(displayUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch (copyErr) {
            console.error('Failed to copy: ', copyErr);
          }
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      try {
        await navigator.clipboard.writeText(displayUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
  };

  // Download QR code as image
  const downloadQRCode = () => {
    // Only run on client side
    if (typeof document === 'undefined' || typeof window === 'undefined')
      return;

    if (!qrCodeRef.current) return;

    const svg = qrCodeRef.current.querySelector('svg');
    if (!svg) return;

    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = 200;
    canvas.height = 200;

    // Create an image from the SVG
    const img = new Image();
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    img.onload = () => {
      // Draw white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Convert to data URL and trigger download
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'grabhealth-referral-qr.png';
      a.click();

      // Clean up
      URL.revokeObjectURL(svgUrl);
    };

    img.src = svgUrl;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Referral Link</CardTitle>
        <CardDescription>
          Share this link or QR code to invite others to join your network
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Input value={getDisplayUrl()} readOnly className="flex-1" />
            <Button
              size="sm"
              onClick={copyToClipboard}
              variant={copied ? 'outline' : 'default'}
            >
              {copied ? 'Copied!' : <CopyIcon className="h-4 w-4 mr-2" />}
              {copied ? '' : 'Copy'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            When someone registers using your link, they'll be added to your
            network
          </p>
        </div>

        <div className="flex justify-center py-4">
          <div className="bg-white p-4 rounded-lg border">
            <div
              className="h-48 w-48 flex items-center justify-center"
              ref={qrCodeRef}
            >
              <QRCode
                size={180}
                value={getDisplayUrl()}
                fgColor="#2563eb"
                bgColor="#ffffff"
                level="H"
              />
              <span className="sr-only">QR Code for your referral link</span>
            </div>
          </div>
        </div>

        {/* <Alert>
          <Share2 className="h-4 w-4" />
          <AlertTitle>How the Commission System Works</AlertTitle>
          <AlertDescription>
            {isLoadingRates ? (
              <div className="text-sm text-muted-foreground">
                Loading commission rates...
              </div>
            ) : commissionLevels.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1 mt-2 text-sm">
                <li>
                  When someone joins using your link, you become their upline
                </li>
                {commissionLevels.map((level) => (
                  <li key={level.level}>
                    {level.name}: Earn {(level.rate * 100).toFixed(0)}%
                    commission
                    {level.level === 0 && ' on direct sales'}
                    {level.level === 1 &&
                      ' when your direct referrals make sales'}
                    {level.level === 2 && ' from your Level 2 network'}
                    {level.level === 3 && ' from your Level 3 network'}
                    {level.level > 3 && ` from your Level ${level.level} network`}
                  </li>
                ))}
                <li>
                  The more people in your network, the more earning potential
                  you have
                </li>
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Commission structure information is not available at the moment.
              </p>
            )}
          </AlertDescription>
        </Alert> */}

        <div className="flex justify-center space-x-4">
          <Button onClick={shareLink}>
            <Share2 className="h-4 w-4 mr-2" />
            {shared ? 'Shared!' : 'Share Link'}
          </Button>
          <Button variant="outline" onClick={downloadQRCode}>
            <Download className="h-4 w-4 mr-2" />
            Download QR Code
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Export the component directly without authentication protection
export default ReferralLink;
