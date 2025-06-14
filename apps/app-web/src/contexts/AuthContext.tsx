'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/auth.service';
import { IUserPublic, RegisterRequest } from '@app/shared-types';

// Create context without explicit type definition to avoid unused warnings
const AuthContext = createContext<
  ReturnType<typeof useAuthProvider> | undefined
>(undefined);

// Custom hook that provides auth functionality
const useAuthProvider = () => {
  const router = useRouter();
  const [user, setUser] = useState<IUserPublic | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      // First check if we have user data in sessionStorage (for PENDING_VERIFICATION users)
      const storedUser = sessionStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // If user is ACTIVE, try to get fresh data from profile
        if (parsedUser.status === 'ACTIVE') {
          try {
            const userProfile = await authService.getProfile();
            if (userProfile && userProfile.id) {
              setUser(userProfile);
              sessionStorage.setItem('user', JSON.stringify(userProfile));
            }
          } catch {
            // If profile fails, keep using stored data
          }
        }
      } else {
        // No stored user, try to get profile (for ACTIVE users)
        try {
          const userProfile = await authService.getProfile();
          if (userProfile && userProfile.id) {
            setUser(userProfile);
            sessionStorage.setItem('user', JSON.stringify(userProfile));
          } else {
            setUser(null);
          }
        } catch (error: any) {
          // If 401, user is not authenticated - this is expected
          if (error?.response?.status === 401) {
            setUser(null);
          } else {
            // Log other errors
            console.error('Error fetching profile:', error);
            setUser(null);
          }
        }
      }
    } catch {
      // If all fails, clear user
      setUser(null);
      sessionStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Small delay to ensure cookies are available after hydration
    const timer = setTimeout(() => {
      checkAuth();
    }, 100);

    return () => clearTimeout(timer);
  }, [checkAuth]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const authData = await authService.login({ email, password });
        setUser(authData.user);
        // Store user data for persistence across refreshes
        sessionStorage.setItem('user', JSON.stringify(authData.user));
        
        // Check if email verification is needed
        if (authData.user.status === 'PENDING_VERIFICATION') {
          router.push('/auth/verify');
        } else {
          router.push('/');
        }
      } catch (error: any) {
        // Handle error like in example.md
        throw error;
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout errors
    } finally {
      setUser(null);
      sessionStorage.removeItem('user');
      router.push('/login');
    }
  }, [router]);

  const register = useCallback(
    async (data: RegisterRequest) => {
      try {
        const authData = await authService.register(data);
        setUser(authData.user);
        // Store user data for persistence across refreshes
        sessionStorage.setItem('user', JSON.stringify(authData.user));
        
        // Check if email verification is needed
        if (authData.user.status === 'PENDING_VERIFICATION') {
          router.push('/auth/verify');
        } else {
          router.push('/');
        }
      } catch (error: any) {
        // Pass through the full error structure including details
        throw error;
      }
    },
    [router]
  );

  const refreshAuth = useCallback(async () => {
    setIsLoading(true);
    await checkAuth();
  }, [checkAuth]);

  return useMemo(
    () => ({
      user,
      isLoading,
      login,
      logout,
      register,
      refreshAuth,
    }),
    [user, isLoading, login, logout, register, refreshAuth]
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const auth = useAuthProvider();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};
