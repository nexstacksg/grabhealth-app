'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CommissionDashboard from '@/components/commission/commission-dashboard';
import { authService } from '@/services/auth.service';

export default function CommissionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await authService.getProfile();

        if (userData && userData.id) {
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

      <CommissionDashboard />
    </div>
  );
}
