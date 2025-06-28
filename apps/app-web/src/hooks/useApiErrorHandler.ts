import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cookieUtils } from '@/lib/cookies';

export const useApiErrorHandler = () => {
  const router = useRouter();

  const handleApiError = useCallback(
    (error: any) => {
      // Handle 401 Unauthorized errors
      if (error.status === 401) {
        // Clear auth data
        cookieUtils.clear();
        sessionStorage.removeItem('user');
        
        // Redirect to login if not already on auth pages
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith('/auth/')) {
          router.push('/auth/login');
        }
        
        return;
      }
      
      // Re-throw other errors to be handled by the calling code
      throw error;
    },
    [router]
  );

  return { handleApiError };
};