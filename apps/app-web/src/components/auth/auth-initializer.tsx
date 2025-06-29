'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthInitializerProps {
  children: React.ReactNode;
}

export function AuthInitializer({ children }: AuthInitializerProps) {
  const { checkAuth } = useAuth();

  useEffect(() => {
    // Force auth check on mount
    checkAuth();
  }, []);

  return <>{children}</>;
}