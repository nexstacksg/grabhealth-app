'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuth();

  useEffect(() => {
    // Check auth status on mount and when focus returns to window
    checkAuth();

    const handleFocus = () => {
      checkAuth();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [checkAuth]);

  return <>{children}</>;
}