'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface PartnerInfo {
  id: string;
  name: string;
  email: string;
  isPartner: boolean;
}

export function usePartnerAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo | null>(null);

  useEffect(() => {
    checkPartnerAuth();
  }, []);

  const checkPartnerAuth = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/v1/partner-dashboard/profile', {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Please log in as a partner to access this page');
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to verify partner status');
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setPartnerInfo({
          id: data.data.id,
          name: data.data.name,
          email: data.data.email,
          isPartner: true,
        });
      } else {
        toast.error('You need to be a partner to access this page');
        router.push('/');
      }
    } catch (error) {
      console.error('Partner auth check error:', error);
      toast.error('Unable to verify partner status');
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    isLoading, 
    partnerInfo, 
    isPartner: !!partnerInfo,
    partnerId: partnerInfo?.id || null 
  };
}