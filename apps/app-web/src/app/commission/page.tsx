'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CommissionProvider } from '@/components/commission/commission-provider';
import CommissionDashboard from '@/components/commission/commission-dashboard';

type User = {
  id: number;
  name: string;
  email: string;
  role?: string;
};

export default function CommissionPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simple direct API call to check authentication
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          console.log('Not authenticated, redirecting to login');
          router.push('/auth/login');
          return;
        }

        const userData = await response.json();
        console.log('User data from direct API call:', userData);

        if (userData && userData.id) {
          setUser(userData);
          setIsLoading(false);
        } else {
          console.log('Invalid user data, redirecting to login');
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-8 mb-16 flex justify-center items-center min-h-[50vh]">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 mb-16">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Commission Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Manage your multi-level commission network and track your earnings
        </p>
      </div>

      <CommissionProvider>
        <CommissionDashboard />
      </CommissionProvider>
    </div>
  );
}
