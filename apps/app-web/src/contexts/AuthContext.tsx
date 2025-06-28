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
import { cookieUtils } from '@/lib/cookies';

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
      // Try to get user profile - the API client will check for tokens in cookies
      const userProfile = await authService.getProfile();
      setUser(userProfile);
    } catch (error: any) {
      // User is not authenticated or there was an error
      if (error.status === 401) {
        // Clear cookies and user data on 401
        cookieUtils.clear();
        sessionStorage.removeItem('user');
      }
      
      setUser(null);
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

        // Store tokens in cookies only
        if (authData.accessToken) {
          cookieUtils.set('accessToken', authData.accessToken, 1); // 1 day expiry
        }
        if (authData.refreshToken) {
          cookieUtils.set('refreshToken', authData.refreshToken, 7); // 7 days expiry
        }

        // Skip email verification for now and redirect to home
        if (
          authData.user.role === 'PARTNER' &&
          authData.user.partnerId
        ) {
          // Redirect partner users to partner dashboard
          router.push('/partner');
        } else {
          // Always redirect to home page, even if status is PENDING_VERIFICATION
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
      // Clear cookies
      cookieUtils.clear();
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

        // Store tokens in cookies only
        if (authData.accessToken) {
          cookieUtils.set('accessToken', authData.accessToken, 1); // 1 day expiry
        }
        if (authData.refreshToken) {
          cookieUtils.set('refreshToken', authData.refreshToken, 7); // 7 days expiry
        }

        // Skip email verification for now and redirect to home
        if (
          authData.user.role === 'PARTNER' &&
          authData.user.partnerId
        ) {
          // Redirect partner users to partner dashboard
          router.push('/partner');
        } else {
          // Always redirect to home page, even if status is PENDING_VERIFICATION
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
