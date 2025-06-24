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
import { authService, profileService } from '@/services';
import {
  IUserPublic,
  RegisterRequest,
  IProfileUpdateRequest,
} from '@app/shared-types';

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
      // Check if we have a token in localStorage
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Try to get user profile with the token
      const userProfile = await authService.getProfile();
      setUser(userProfile);
    } catch (error: any) {
      // User is not authenticated or there was an error
      // Don't log anything for 401 errors on initial auth check
      if (error.status !== 401) {
        console.log('Auth check failed:', error.message || 'Not authenticated');
      }
      setUser(null);
      // Clear any stored tokens on auth failure
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Only check auth once on mount
    const checkAuthOnce = async () => {
      if (mounted) {
        await checkAuth();
      }
    };

    checkAuthOnce();

    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array - only run once on mount

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const authData = await authService.login({ email, password });
        setUser(authData.user);

        // Store tokens in localStorage (Strapi uses Bearer tokens)
        if (authData.accessToken) {
          localStorage.setItem('accessToken', authData.accessToken);
        }
        if (authData.refreshToken) {
          localStorage.setItem('refreshToken', authData.refreshToken);
        }

        // Check if email verification is needed
        if (authData.user.status === 'PENDING_VERIFICATION') {
          router.push('/auth/verify');
        } else if (
          authData.user.role === 'PARTNER' &&
          authData.user.partnerId
        ) {
          // Redirect partner users to partner dashboard
          router.push('/partner');
        } else {
          router.push('/');
        }
      } catch (error: any) {
        throw new Error(error.message || 'Invalid email or password');
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
      // Clear stored tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);

      // Force a full page reload to clear any cached state
      window.location.href = '/';
    }
  }, [router]);

  const register = useCallback(
    async (data: RegisterRequest) => {
      try {
        const authData = await authService.register({
          email: data.email,
          password: data.password,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
        });
        setUser(authData.user);

        // Store tokens in localStorage (Strapi uses Bearer tokens)
        if (authData.accessToken) {
          localStorage.setItem('accessToken', authData.accessToken);
        }
        if (authData.refreshToken) {
          localStorage.setItem('refreshToken', authData.refreshToken);
        }

        // Check if email verification is needed
        if (authData.user.status === 'PENDING_VERIFICATION') {
          router.push('/auth/verify');
        } else if (
          authData.user.role === 'PARTNER' &&
          authData.user.partnerId
        ) {
          // Redirect partner users to partner dashboard
          router.push('/partner');
        } else {
          router.push('/');
        }
      } catch (error: any) {
        throw error;
      }
    },
    [router]
  );

  const refreshAuth = useCallback(async () => {
    setIsLoading(true);
    await checkAuth();
  }, [checkAuth]);

  const updateProfile = useCallback(async (data: IProfileUpdateRequest) => {
    try {
      const updatedUser = await profileService.updateProfile(data);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }, []);

  const updateProfileImage = useCallback(
    async (file: File) => {
      try {
        const result = await profileService.uploadProfileImage(file);
        // Refresh user data to get the updated profile image
        await refreshAuth();
        return result;
      } catch (error) {
        console.error('Failed to update profile image:', error);
        throw error;
      }
    },
    [refreshAuth]
  );

  return useMemo(
    () => ({
      user,
      isLoading,
      login,
      logout,
      register,
      refreshAuth,
      updateProfile,
      updateProfileImage,
    }),
    [
      user,
      isLoading,
      login,
      logout,
      register,
      refreshAuth,
      updateProfile,
      updateProfileImage,
    ]
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
