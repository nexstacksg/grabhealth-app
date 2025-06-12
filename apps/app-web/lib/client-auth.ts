// Client-side authentication utilities
import { useRouter } from 'next/navigation';

// Client-side authentication check
export async function checkAuthStatus() {
  try {
    // Make a request to your auth endpoint
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for sending cookies
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return null;
  }
}

// Hook for client components to require authentication
export function useRequireAuth() {
  const router = useRouter();

  return async () => {
    const user = await checkAuthStatus();
    
    if (!user) {
      router.push('/auth/login');
      return null;
    }
    
    return user;
  };
}
